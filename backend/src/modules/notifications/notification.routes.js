import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { NotificationLog } from "./notification.model.js";

export const notificationRouter = Router();

notificationRouter.get("/", requireAuth, requireRole("admin", "cr"), async (_request, response) => {
  const logs = await NotificationLog.find().sort({ createdAt: -1 }).limit(100).lean();
  return response.json({ logs });
});