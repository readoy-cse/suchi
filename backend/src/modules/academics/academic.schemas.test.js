import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { examSchema, noticeSchema, routineSchema } from "./academic.schemas.js";
import { submissionSchema } from "../submissions/submission.routes.js";

describe("academic content validation", () => {
  it("normalizes course codes and accepts valid routine times", () => {
    const result = routineSchema.safeParse({
      courseTitle: "Programming Fundamentals",
      courseCode: "cse-101",
      teacher: "Ada Lovelace",
      day: "Monday",
      startTime: "09:00",
      endTime: "10:30",
      room: "A-201",
    });

    assert.equal(result.success, true);
    assert.equal(result.data.courseCode, "CSE-101");
  });

  it("rejects invalid routine times and non-HTTP resource URLs", () => {
    const result = routineSchema.safeParse({
      courseTitle: "Programming Fundamentals",
      courseCode: "CSE-101",
      teacher: "Ada Lovelace",
      day: "Monday",
      startTime: "11:00",
      endTime: "10:30",
      room: "A-201",
      resourceUrl: "javascript:alert(1)",
    });

    assert.equal(result.success, false);
  });

  it("rejects malformed exam dates and unsafe attachments", () => {
    const result = examSchema.safeParse({
      courseTitle: "Programming Fundamentals",
      courseCode: "CSE-101",
      examType: "Final",
      date: "not-a-date",
      startTime: "09:00",
      room: "A-201",
      resourceUrl: "file:///private",
    });

    assert.equal(result.success, false);
  });

  it("accepts a notice with a safe optional resource", () => {
    const result = noticeSchema.safeParse({
      title: "Library hours updated",
      body: "The library will open at 8 AM this week.",
      category: "Academic",
      attachmentUrl: "https://example.test/library",
    });

    assert.equal(result.success, true);
  });
});

describe("student submission validation", () => {
  it("strips client-supplied status and submitter fields", () => {
    const result = submissionSchema.safeParse({
      title: "Study group meetup",
      type: "event",
      description: "A student-submitted meetup.",
      status: "approved",
      submittedBy: "507f1f77bcf86cd799439011",
      reviewedBy: "507f1f77bcf86cd799439012",
    });

    assert.equal(result.success, true);
    assert.equal("status" in result.data, false);
    assert.equal("submittedBy" in result.data, false);
    assert.equal("reviewedBy" in result.data, false);
  });

  it("rejects an unsafe submission resource URL", () => {
    const result = submissionSchema.safeParse({
      title: "Study group meetup",
      type: "event",
      description: "A student-submitted meetup.",
      resourceUrl: "javascript:alert(1)",
    });

    assert.equal(result.success, false);
  });
});