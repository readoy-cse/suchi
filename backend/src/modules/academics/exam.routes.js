import { Exam } from "./exam.model.js";
import { examSchema } from "./academic.schemas.js";
import { createAcademicRouter } from "./academic.routes.js";

export const examRouter = createAcademicRouter({
  Model: Exam,
  schema: examSchema,
  sort: { date: 1, startTime: 1 },
  contentType: "exam",
  path: "/exams",
});