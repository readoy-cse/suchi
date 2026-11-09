import mongoose from "mongoose";
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { notifyPublishedContent } from "../notifications/telegram.service.js";
import { Submission } from "./submission.model.js";

export const submissionRouter = Router();

const resourceUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "Enter a valid http or https URL.").optional().default("");

export const submissionSchema = z.object({
  title: z.string().trim().min(3).max(160),
  type: z.enum(["event", "news", "suggestion"]),
  description: z.string().trim().min(1).max(10000),
  eventDate: z.preprocess((value) => value === "" || value === null ? undefined : value, z.coerce.date().optional()),
  location: z.string().trim().max(160).optional().default(""),
  resourceUrl,
});

const reviewSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reviewNote: z.string().trim().max(500).optional().default(""),
});

function invalidBody(response, result) {
  return response.status(400).json({ message: result.error.issues[0]?.message ?? "Check the submitted information." });
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

function rolePublishes(role) {
  return role === "admin" || role === "cr";
}

submissionRouter.use(requireAuth);

submissionRouter.post("/", async (request, response) => {
  const parsed = submissionSchema.safeParse(request.body);
  if (!parsed.success) return invalidBody(response, parsed);

  const isReviewer = rolePublishes(request.user.role);
  const item = await Submission.create({
    ...parsed.data,
    submittedBy: request.user._id,
    status: isReviewer ? "approved" : "pending",
    reviewedBy: isReviewer ? request.user._id : undefined,
    reviewedAt: isReviewer ? new Date() : undefined,
  });

  const notification = isReviewer
    ? await notifyPublishedContent({ contentType: "submission", contentId: item._id, title: item.title, path: "/events", actorName: request.user.name, details: item })
    : { status: "pending" };
  return response.status(201).json({ item, notification });
});

submissionRouter.get("/mine", async (request, response) => {
  const items = await Submission.find({ submittedBy: request.user._id }).sort({ createdAt: -1 });
  return response.json({ items });
});

submissionRouter.get("/pending", requireRole("admin", "cr"), async (_request, response) => {
  const items = await Submission.find({ status: "pending" }).sort({ createdAt: 1 }).limit(200);
  return response.json({ items });
});

submissionRouter.get("/published", async (_request, response) => {
  const items = await Submission.find({ status: "approved" }).sort({ createdAt: -1 }).limit(200);
  return response.json({ items });
});

submissionRouter.patch("/:id", async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ message: "Invalid submission id." });
  const item = await Submission.findById(request.params.id);
  if (!item) return response.status(404).json({ message: "Submission not found." });
  if (item.submittedBy.toString() !== request.user._id.toString()) {
    return response.status(403).json({ message: "You can only edit your own submissions." });
  }
  if (item.status !== "pending") return response.status(409).json({ message: "Only pending submissions can be edited." });

  const parsed = submissionSchema.safeParse(request.body);
  if (!parsed.success) return invalidBody(response, parsed);
  Object.assign(item, parsed.data);
  await item.save();
  return response.json({ item });
});

submissionRouter.delete("/:id", async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ message: "Invalid submission id." });
  const item = await Submission.findById(request.params.id);
  if (!item) return response.status(404).json({ message: "Submission not found." });
  if (item.submittedBy.toString() !== request.user._id.toString()) {
    return response.status(403).json({ message: "You can only withdraw your own submissions." });
  }
  if (item.status !== "pending") return response.status(409).json({ message: "Only pending submissions can be withdrawn." });

  await item.deleteOne();
  return response.status(204).end();
});

submissionRouter.patch("/:id/review", requireRole("admin", "cr"), async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ message: "Invalid submission id." });
  const parsed = reviewSchema.safeParse(request.body);
  if (!parsed.success) return invalidBody(response, parsed);

  const item = await Submission.findById(request.params.id);
  if (!item) return response.status(404).json({ message: "Submission not found." });
  if (item.status !== "pending") return response.status(409).json({ message: "This submission has already been reviewed." });

  item.status = parsed.data.decision;
  item.reviewNote = parsed.data.reviewNote;
  item.reviewedBy = request.user._id;
  item.reviewedAt = new Date();
  await item.save();
  const notification = item.status === "approved"
    ? await notifyPublishedContent({ contentType: "submission", contentId: item._id, title: item.title, path: "/events", actorName: request.user.name, details: item })
    : { status: "not-sent" };
  return response.json({ item, notification });
});
