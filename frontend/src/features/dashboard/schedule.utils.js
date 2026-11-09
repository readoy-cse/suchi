const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const millisecondsPerMinute = 60 * 1000;
const millisecondsPerDay = 24 * 60 * millisecondsPerMinute;

function routineOccurrence(routine, now) {
  const weekday = weekdayNames.indexOf(routine.day);
  if (weekday < 0) return null;

  const [startHour, startMinute] = routine.startTime.split(":").map(Number);
  const [endHour, endMinute] = routine.endTime.split(":").map(Number);
  const dayOffset = (weekday - now.getDay() + 7) % 7;
  const startsAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, startHour, startMinute);
  const endsAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, endHour, endMinute);

  if (endsAt <= now) {
    startsAt.setDate(startsAt.getDate() + 7);
    endsAt.setDate(endsAt.getDate() + 7);
  }
  if (startsAt >= new Date(now.getTime() + 7 * millisecondsPerDay)) return null;

  return { ...routine, startsAt, endsAt };
}

export function getUpcomingClasses(routines, now = new Date()) {
  return routines
    .map((routine) => routineOccurrence(routine, now))
    .filter(Boolean)
    .sort((left, right) => left.startsAt - right.startsAt);
}

function examOccurrence(exam, now) {
  const datePart = String(exam.date).slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = exam.startTime.split(":").map(Number);
  const startsAt = new Date(year, month - 1, day, hour, minute);
  return startsAt > now ? { ...exam, startsAt } : null;
}

export function getUpcomingExams(exams, now = new Date()) {
  return exams
    .map((exam) => examOccurrence(exam, now))
    .filter(Boolean)
    .sort((left, right) => left.startsAt - right.startsAt);
}

export function timeUntil(date, now = new Date()) {
  const minutes = Math.max(0, Math.ceil((date.getTime() - now.getTime()) / millisecondsPerMinute));
  if (minutes === 0) return "Starting now";
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const remainingMinutes = minutes % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (!days && remainingMinutes) parts.push(`${remainingMinutes}m`);
  return `In ${parts.join(" ")}`;
}

export function scheduleLabel(item, now = new Date()) {
  if (item.endsAt && item.startsAt <= now && item.endsAt > now) return "In progress";
  return timeUntil(item.startsAt, now);
}