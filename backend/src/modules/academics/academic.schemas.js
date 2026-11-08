import { z } from "zod";

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const resourceUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}, "Enter a valid http or https URL.").optional().default("");

export const routineSchema = z.object({
  courseTitle: z.string().trim().min(2).max(120),
  courseCode: z.string().trim().min(2).max(20).transform((value) => value.toUpperCase()),
  teacher: z.string().trim().min(2).max(100),
  day: z.enum(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
  startTime: z.string().regex(timePattern, "Use a valid 24-hour start time."),
  endTime: z.string().regex(timePattern, "Use a valid 24-hour end time."),
  room: z.string().trim().min(1).max(40),
  topic: z.string().trim().max(500).optional().default(""),
  resourceUrl,
}).refine((entry) => entry.startTime < entry.endTime, {
  message: "End time must be later than start time.",
  path: ["endTime"],
});

export const examSchema = z.object({
  courseTitle: z.string().trim().min(2).max(120),
  courseCode: z.string().trim().min(2).max(20).transform((value) => value.toUpperCase()),
  examType: z.string().trim().min(2).max(40),
  date: z.coerce.date(),
  startTime: z.string().regex(timePattern, "Use a valid 24-hour time."),
  room: z.string().trim().min(1).max(40),
  topics: z.array(z.string().trim().min(1).max(120)).max(40).optional().default([]),
  suggestion: z.string().trim().max(2000).optional().default(""),
  resourceUrl,
});

export const noticeSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(10000),
  category: z.string().trim().min(2).max(40),
  attachmentUrl: resourceUrl,
});