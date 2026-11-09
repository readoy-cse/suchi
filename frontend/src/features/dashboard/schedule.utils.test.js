import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getUpcomingClasses, getUpcomingExams, scheduleLabel, timeUntil } from "./schedule.utils.js";

describe("dashboard schedule summaries", () => {
  it("orders weekly classes and includes the next occurrence inside the rolling week", () => {
    const now = new Date(2026, 10, 9, 9, 15);
    const routines = [
      { _id: "later", day: "Monday", startTime: "11:00", endTime: "12:00" },
      { _id: "ended", day: "Monday", startTime: "08:00", endTime: "09:00" },
      { _id: "wednesday", day: "Wednesday", startTime: "10:00", endTime: "11:00" },
    ];

    const upcoming = getUpcomingClasses(routines, now);
    assert.deepEqual(upcoming.map((item) => item._id), ["later", "wednesday", "ended"]);
    assert.equal(timeUntil(upcoming[0].startsAt, now), "In 1h 45m");
  });

  it("keeps a class in progress as the next class", () => {
    const now = new Date(2026, 10, 9, 9, 30);
    const upcoming = getUpcomingClasses([
      { _id: "current", day: "Monday", startTime: "09:00", endTime: "10:00" },
    ], now);

    assert.equal(upcoming.length, 1);
    assert.equal(scheduleLabel(upcoming[0], now), "In progress");
  });

  it("sorts future exams and omits past exams", () => {
    const now = new Date(2026, 10, 9, 9, 0);
    const upcoming = getUpcomingExams([
      { _id: "later", date: "2026-11-12T00:00:00.000Z", startTime: "10:00" },
      { _id: "sooner", date: "2026-11-10T00:00:00.000Z", startTime: "08:30" },
      { _id: "past", date: "2026-11-08T00:00:00.000Z", startTime: "10:00" },
    ], now);

    assert.deepEqual(upcoming.map((item) => item._id), ["sooner", "later"]);
  });
});