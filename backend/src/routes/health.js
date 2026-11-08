import { Router } from "express";
import { isDatabaseConnected } from "../config/database.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  const database = isDatabaseConnected() ? "connected" : "disconnected";

  response.status(database === "connected" ? 200 : 503).json({
    status: database === "connected" ? "ok" : "unavailable",
    database,
  });
});