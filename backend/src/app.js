import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { clientOrigin } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { examRouter } from "./modules/academics/exam.routes.js";
import { noticeRouter } from "./modules/academics/notice.routes.js";
import { routineRouter } from "./modules/academics/routine.routes.js";
import { notificationRouter } from "./modules/notifications/notification.routes.js";
import { commentRouter } from "./modules/comments/comment.routes.js";
import { submissionRouter } from "./modules/submissions/submission.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { healthRouter } from "./routes/health.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/routines", routineRouter);
app.use("/api/exams", examRouter);
app.use("/api/notices", noticeRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api", commentRouter);
app.use("/api/notifications", notificationRouter);

app.use((error, _request, response, _next) => {
	void _next;
	const status = Number.isInteger(error.status) ? error.status : 500;
	if (status >= 500) console.error(error);

	response.status(status).json({
		message: status >= 500 ? "An unexpected server error occurred." : error.message,
	});
});