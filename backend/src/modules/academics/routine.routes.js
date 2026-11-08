import { Routine } from "./routine.model.js";
import { routineSchema } from "./academic.schemas.js";
import { createAcademicRouter } from "./academic.routes.js";

export const routineRouter = createAcademicRouter({
  Model: Routine,
  schema: routineSchema,
  sort: { day: 1, startTime: 1 },
  contentType: "routine",
  path: "/routines",
});