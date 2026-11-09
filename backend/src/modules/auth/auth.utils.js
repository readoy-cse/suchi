import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";

const cookieName = "suchi_session";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
let temporaryDevelopmentSecret;

export function getJwtSecret() {
  const configuredSecret = process.env.JWT_SECRET;
  const isPlaceholder = configuredSecret?.trim().toLowerCase().startsWith("replace-with") ?? false;

  if (configuredSecret && configuredSecret.length >= 32 && !isPlaceholder) return configuredSecret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be a non-placeholder random value of at least 32 characters in production.");
  }
  if (configuredSecret && !isPlaceholder) {
    throw new Error("JWT_SECRET must be at least 32 characters.");
  }

  if (!temporaryDevelopmentSecret) {
    temporaryDevelopmentSecret = randomBytes(48).toString("base64url");
    console.warn("JWT_SECRET is unset; using a temporary development secret. Sessions will expire when the backend restarts.");
  }

  return temporaryDevelopmentSecret;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function setSessionCookie(response, userId) {
  const token = jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: "7d" });
  response.cookie(cookieName, token, { ...cookieOptions(), maxAge: sessionDurationMs });
}

export function clearSessionCookie(response) {
  response.clearCookie(cookieName, cookieOptions());
}

export function readSessionToken(request) {
  return request.cookies?.[cookieName];
}

export function verifySessionToken(token) {
  return jwt.verify(token, getJwtSecret());
}