import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import "../config/env.js";
import { connectDatabase } from "../config/database.js";
import { User } from "../modules/users/user.model.js";

async function seedAdmin() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env before seeding.");
  }
  if (Buffer.byteLength(password, "utf8") < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("ADMIN_PASSWORD must be between 12 and 72 bytes.");
  }
  if (await User.exists({ role: "admin", isActive: true })) {
    throw new Error("An active admin already exists; refusing to create another seed admin.");
  }
  if (await User.exists({ email })) {
    throw new Error("ADMIN_EMAIL already belongs to an account; choose a different seed email.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ name, email, passwordHash, role: "admin", isActive: true });
  console.info(`Created initial admin account for ${email}.`);
}

try {
  await connectDatabase();
  await seedAdmin();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}