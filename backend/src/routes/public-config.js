import { Router } from "express";
import { telegramChannelUrl } from "../config/env.js";

export const publicConfigRouter = Router();

publicConfigRouter.get("/public", (_request, response) => {
  response.status(200).json({
    telegramChannelUrl,
  });
});
