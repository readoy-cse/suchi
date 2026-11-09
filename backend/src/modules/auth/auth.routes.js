import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { User, publicUser } from "../users/user.model.js";
import { clearSessionCookie, setSessionCookie } from "./auth.utils.js";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again in a few minutes." },
});

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

const accountSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  name: z.string().trim().min(2).max(80).optional(),
  newPassword: z.string().min(8).max(72).optional(),
}).refine((value) => value.name !== undefined || value.newPassword !== undefined, {
  message: "Enter a new name or password.",
});

function validationMessage(result) {
  return result.error.issues[0]?.message ?? "Check the submitted information.";
}

authRouter.post("/register", authLimiter, async (request, response) => {
  const parsed = registrationSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: validationMessage(parsed) });
  if (Buffer.byteLength(parsed.data.password, "utf8") > 72) {
    return response.status(400).json({ message: "Password must be at most 72 bytes." });
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    const user = await User.create({
      name: parsed.data.name,
      email,
      passwordHash,
      role: "student",
      isActive: true,
    });
    setSessionCookie(response, user._id.toString());
    return response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000) return response.status(409).json({ message: "An account with this email already exists." });
    throw error;
  }
});

authRouter.post("/login", authLimiter, async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: validationMessage(parsed) });
  if (Buffer.byteLength(parsed.data.password, "utf8") > 72) {
    return response.status(400).json({ message: "Email or password is incorrect." });
  }

  const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+passwordHash");
  if (!user || !user.isActive || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return response.status(401).json({ message: "Email or password is incorrect." });
  }

  setSessionCookie(response, user._id.toString());
  return response.json({ user: publicUser(user) });
});

authRouter.post("/logout", (_request, response) => {
  clearSessionCookie(response);
  return response.json({ message: "Signed out." });
});

authRouter.get("/me", requireAuth, (request, response) => {
  return response.json({ user: publicUser(request.user) });
});

authRouter.patch("/account", requireAuth, async (request, response) => {
  const parsed = accountSchema.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ message: validationMessage(parsed) });
  if (Buffer.byteLength(parsed.data.currentPassword, "utf8") > 72 || (parsed.data.newPassword && Buffer.byteLength(parsed.data.newPassword, "utf8") > 72)) {
    return response.status(400).json({ message: "Password must be at most 72 bytes." });
  }

  const user = await User.findById(request.user._id).select("+passwordHash");
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return response.status(401).json({ message: "Current password is incorrect." });
  }

  if (parsed.data.name !== undefined) user.name = parsed.data.name;
  if (parsed.data.newPassword) user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();
  return response.json({ user: publicUser(user) });
});
