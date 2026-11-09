import mongoose from "mongoose";
import "../config/env.js";
import { connectDatabase } from "../config/database.js";
import { Exam } from "../modules/academics/exam.model.js";
import { Notice } from "../modules/academics/notice.model.js";
import { Routine } from "../modules/academics/routine.model.js";
import { Submission } from "../modules/submissions/submission.model.js";
import { User } from "../modules/users/user.model.js";

const demoRecords = [
  {
    Model: Routine,
    filter: { courseCode: "SUCHIDEMO101" },
    value: { courseTitle: "Web Programming", courseCode: "SUCHIDEMO101", teacher: "Demo Instructor", day: "Monday", startTime: "09:00", endTime: "10:30", room: "Lab 2", topic: "React fundamentals", resourceUrl: "https://react.dev/learn" },
  },
  {
    Model: Routine,
    filter: { courseCode: "SUCHIDEMO102" },
    value: { courseTitle: "Database Systems", courseCode: "SUCHIDEMO102", teacher: "Demo Instructor", day: "Wednesday", startTime: "11:00", endTime: "12:30", room: "Room 304", topic: "Document databases", resourceUrl: "https://www.mongodb.com/docs/" },
  },
  {
    Model: Exam,
    filter: { courseCode: "SUCHIDEMO101", examType: "Demo Midterm" },
    value: { courseTitle: "Web Programming", courseCode: "SUCHIDEMO101", examType: "Demo Midterm", date: new Date("2026-12-10T00:00:00.000Z"), startTime: "10:00", room: "Exam Hall B", topics: ["Components", "Forms", "HTTP APIs"], suggestion: "Review the class exercises.", resourceUrl: "https://react.dev/learn" },
  },
  {
    Model: Notice,
    filter: { title: "Suchi Demo: Project clinic" },
    value: { title: "Suchi Demo: Project clinic", body: "Bring your current project questions to the lab clinic on Thursday.", category: "Academic" },
  },
  {
    Model: Notice,
    filter: { title: "Suchi Demo: Routine update" },
    value: { title: "Suchi Demo: Routine update", body: "The Wednesday database class meets in Room 304 this week.", category: "Schedule" },
  },
  {
    Model: Submission,
    filter: { title: "Suchi Demo: Peer study circle" },
    value: { title: "Suchi Demo: Peer study circle", type: "event", description: "A small peer-led review session before the programming midterm.", eventDate: new Date("2026-12-07T10:00:00.000Z"), location: "Library study room", resourceUrl: "", status: "approved" },
  },
  {
    Model: Submission,
    filter: { title: "Suchi Demo: Student showcase" },
    value: { title: "Suchi Demo: Student showcase", type: "news", description: "Students will share their semester web projects in the department lab.", eventDate: new Date("2026-12-15T09:00:00.000Z"), location: "Department lab", resourceUrl: "", status: "approved" },
  },
  {
    Model: Submission,
    filter: { title: "Suchi Demo: Request for review" },
    value: { title: "Suchi Demo: Request for review", type: "suggestion", description: "Could we add a short Git practice session before the project deadline?", status: "pending" },
  },
];

async function seedDemo() {
  const admin = await User.findOne({ role: "admin", isActive: true }).select("_id");
  if (!admin) throw new Error("Create the initial admin before seeding demo content.");

  let inserted = 0;
  for (const record of demoRecords) {
    const isSubmission = record.Model === Submission;
    const values = isSubmission
      ? {
        ...record.value,
        submittedBy: admin._id,
        ...(record.value.status === "approved" ? { reviewedBy: admin._id, reviewedAt: new Date() } : {}),
      }
      : { ...record.value, createdBy: admin._id };
    const result = await record.Model.updateOne(
      record.filter,
      { $setOnInsert: values },
      { upsert: true },
    );
    inserted += result.upsertedCount;
  }

  console.info(`Demo seed complete. Added ${inserted} new records; existing demo records were left unchanged.`);
}

try {
  await connectDatabase();
  await seedDemo();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
