import mongoose from "mongoose";
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { notifyPublishedContent } from "../notifications/telegram.service.js";

export function createAcademicRouter({ Model, schema, sort, contentType, path }) {
  const router = Router();
  const canManage = [requireAuth, requireRole("admin", "cr")];

  router.get("/", requireAuth, async (_request, response) => {
    const items = await Model.find().sort(sort).limit(200);
    return response.json({ items });
  });

  router.post("/", ...canManage, async (request, response) => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({ message: parsed.error.issues[0]?.message ?? "Check the submitted information." });
    }

    const item = await Model.create({ ...parsed.data, createdBy: request.user._id });
    const notification = await notifyPublishedContent({ contentType, contentId: item._id, title: item.courseTitle ?? item.title, path });
    return response.status(201).json({ item, notification });
  });

  router.patch("/:id", ...canManage, async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: "Invalid content id." });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({ message: parsed.error.issues[0]?.message ?? "Check the submitted information." });
    }

    const item = await Model.findById(request.params.id);
    if (!item) return response.status(404).json({ message: "Content not found." });
    Object.assign(item, parsed.data);
    await item.save();
    const notification = await notifyPublishedContent({ contentType, contentId: item._id, title: item.courseTitle ?? item.title, path });
    return response.json({ item, notification });
  });

  router.delete("/:id", ...canManage, async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: "Invalid content id." });
    const item = await Model.findByIdAndDelete(request.params.id);
    if (!item) return response.status(404).json({ message: "Content not found." });
    return response.status(204).end();
  });

  return router;
}