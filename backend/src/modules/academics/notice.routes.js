import { Notice } from "./notice.model.js";
import { noticeSchema } from "./academic.schemas.js";
import { createAcademicRouter } from "./academic.routes.js";

export const noticeRouter = createAcademicRouter({
  Model: Notice,
  schema: noticeSchema,
  sort: { publishedAt: -1 },
  contentType: "notice",
  path: "/notices",
});