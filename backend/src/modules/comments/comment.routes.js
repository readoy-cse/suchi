import mongoose from "mongoose";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { Routine } from "../academics/routine.model.js";
import { Exam } from "../academics/exam.model.js";
import { Notice } from "../academics/notice.model.js";
import { Submission } from "../submissions/submission.model.js";
import { Comment } from "./comment.model.js";

export const commentRouter = Router();

const contentModels = {
  routine: Routine,
  exam: Exam,
  notice: Notice,
  submission: Submission,
};

const commentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

commentRouter.use(requireAuth);

async function findPublishedContent(contentType, contentId) {
  const Model = contentModels[contentType];
  if (!Model || !mongoose.isValidObjectId(contentId)) return null;
  const filter = contentType === "submission"
    ? { _id: contentId, status: "approved" }
    : { _id: contentId };
  return Model.exists(filter);
}

function presentComment(comment) {
  return {
    id: comment._id.toString(),
    body: comment.body,
    createdAt: comment.createdAt,
    author: comment.author
      ? { id: comment.author._id.toString(), name: comment.author.name, role: comment.author.role }
      : { id: "", name: "Former member", role: "student" },
  };
}

commentRouter.get("/content/:contentType/:contentId/comments", async (request, response) => {
  const { contentType, contentId } = request.params;
  if (!await findPublishedContent(contentType, contentId)) {
    return response.status(404).json({ message: "Published content not found." });
  }

  const comments = await Comment.find({ contentType, contentId })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("author", "name role");
  return response.json({ comments: comments.map(presentComment) });
});

commentRouter.post("/content/:contentType/:contentId/comments", async (request, response) => {
  const { contentType, contentId } = request.params;
  if (!await findPublishedContent(contentType, contentId)) {
    return response.status(404).json({ message: "Published content not found." });
  }
  const parsed = commentSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: parsed.error.issues[0]?.message ?? "Enter a valid comment." });

  const comment = await Comment.create({
    contentType,
    contentId,
    author: request.user._id,
    body: parsed.data.body,
  });
  await comment.populate("author", "name role");
  return response.status(201).json({ comment: presentComment(comment) });
});

commentRouter.delete("/comments/:id", async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: "Invalid comment id." });
  const comment = await Comment.findById(request.params.id);
  if (!comment) return response.status(404).json({ message: "Comment not found." });

  const isAuthor = comment.author.toString() === request.user._id.toString();
  const isModerator = ["admin", "cr"].includes(request.user.role);
  if (!isAuthor && !isModerator) return response.status(403).json({ message: "You cannot remove this comment." });

  await comment.deleteOne();
  return response.status(204).end();
});
