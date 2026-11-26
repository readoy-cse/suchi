import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { NotificationLog } from "./notification.model.js";
import { resendTelegramMessage } from "./telegram.service.js";
import { Routine } from "../academics/routine.model.js";
import { Exam } from "../academics/exam.model.js";
import { Notice } from "../academics/notice.model.js";
import { Submission } from "../submissions/submission.model.js";
import { notifyPublishedContent } from "./telegram.service.js";

export const notificationRouter = Router();

notificationRouter.get("/", requireAuth, requireRole("admin", "cr"), async (_request, response) => {
  const logs = await NotificationLog.find().sort({ createdAt: -1 }).limit(100).lean();
  return response.json({ logs });
});

notificationRouter.post("/:id/resend", requireAuth, requireRole("admin", "cr"), async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: "Invalid Telegram delivery log id." });
  const log = await NotificationLog.findById(request.params.id);
  if (!log) return response.status(404).json({ message: "Telegram delivery log not found." });
  try {
    if (!log.message) {
      const models = { routine: Routine, exam: Exam, notice: Notice, submission: Submission };
      const Model = models[log.contentType];
      const item = Model ? await Model.findById(log.contentId) : null;
      if (!item) return response.status(404).json({ message: "The original update no longer exists." });
      const title = item.courseTitle ?? item.title;
      const paths = { routine: "/routines", exam: "/exams", notice: "/notices", submission: "/events" };
      const notification = await notifyPublishedContent({
        contentType: log.contentType,
        contentId: log.contentId,
        title,
        path: paths[log.contentType],
        action: "created",
        actorName: log.actorName || "Suchi user",
        details: item,
      });
      return response.json({ notification });
    }
    const notification = await resendTelegramMessage(log);
    return response.json({ notification });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});