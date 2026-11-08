import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: resolve(backendDirectory, ".env") });

export const port = Number(process.env.PORT ?? 4000);
export const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}