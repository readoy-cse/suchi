import { User } from "../modules/users/user.model.js";
import { clearSessionCookie, readSessionToken, verifySessionToken } from "../modules/auth/auth.utils.js";

export async function requireAuth(request, response, next) {
  const token = readSessionToken(request);
  if (!token) return response.status(401).json({ message: "Sign in to continue." });

  let payload;
  try {
    payload = verifySessionToken(token);
  } catch {
    clearSessionCookie(response);
    return response.status(401).json({ message: "Your session has expired. Sign in again." });
  }

  if (!payload || typeof payload !== "object" || typeof payload.sub !== "string") {
    clearSessionCookie(response);
    return response.status(401).json({ message: "Your session is invalid. Sign in again." });
  }

  try {
    const user = await User.findById(payload.sub).select("_id name email role isActive createdAt updatedAt");
    if (!user || !user.isActive) {
      clearSessionCookie(response);
      return response.status(401).json({ message: "This account is unavailable." });
    }

    request.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({ message: "You do not have permission to do that." });
    }
    return next();
  };
}