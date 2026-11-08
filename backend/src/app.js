import cors from "cors";
import express from "express";
import { clientOrigin } from "./config/env.js";
import { healthRouter } from "./routes/health.js";

export const app = express();

app.use(cors({ origin: clientOrigin }));
app.use(express.json());
app.use("/api/health", healthRouter);