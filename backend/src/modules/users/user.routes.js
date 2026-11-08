import mongoose from "mongoose";
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { User, publicUser } from "./user.model.js";

export const userRouter = Router();

const roleSchema = z.object({ role: z.enum(["admin", "cr", "student"]) });
const statusSchema = z.object({ isActive: z.boolean() });

function validId(id) {
  return mongoose.isValidObjectId(id);
}

async function guardLastActiveAdmin(target, changingAdmin) {
  if (!changingAdmin || target.role !== "admin" || !target.isActive) return false;
  const activeAdminCount = await User.countDocuments({ role: "admin", isActive: true });
  return activeAdminCount <= 1;
}

userRouter.use(requireAuth, requireRole("admin"));

userRouter.get("/", async (_request, response) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(200);
  return response.json({ users: users.map(publicUser) });
});

userRouter.get("/:id", async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ message: "Invalid user id." });
  const user = await User.findById(request.params.id);
  if (!user) return response.status(404).json({ message: "User not found." });
  return response.json({ user: publicUser(user) });
});

userRouter.patch("/:id/role", async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ message: "Invalid user id." });
  const parsed = roleSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Select a valid role." });

  const user = await User.findById(request.params.id);
  if (!user) return response.status(404).json({ message: "User not found." });
  if (await guardLastActiveAdmin(user, parsed.data.role !== "admin")) {
    return response.status(409).json({ message: "At least one active admin account must remain." });
  }

  user.role = parsed.data.role;
  await user.save();
  return response.json({ user: publicUser(user) });
});

userRouter.patch("/:id/status", async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ message: "Invalid user id." });
  const parsed = statusSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: "Choose a valid account status." });

  const user = await User.findById(request.params.id);
  if (!user) return response.status(404).json({ message: "User not found." });
  if (await guardLastActiveAdmin(user, !parsed.data.isActive)) {
    return response.status(409).json({ message: "At least one active admin account must remain." });
  }

  user.isActive = parsed.data.isActive;
  await user.save();
  return response.json({ user: publicUser(user) });
});