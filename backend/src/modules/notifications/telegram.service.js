import { NotificationLog } from "./notification.model.js";

export function formatTelegramMessage({ contentType, title, path, action, actorName, authorName, details }) {
  const updated = action === "updated";
  const subject = String(title ?? "").slice(0, 300);
  const lines = [];

  if (contentType === "routine") {
    lines.push(updated ? "🔄 Class routine updated" : "📚 New class routine added", `Course: ${subject}`);
    if (details.courseCode) lines.push(`Course code: ${details.courseCode}`);
    if (details.day && details.startTime && details.endTime) lines.push(`When: ${details.day}, ${details.startTime} - ${details.endTime}`);
    if (details.room) lines.push(`Room: ${details.room}`);
  } else if (contentType === "exam") {
    lines.push(updated ? "🔄 Exam schedule updated" : "📝 New exam added", `Course: ${subject}`);
    if (details.courseCode) lines.push(`Course code: ${details.courseCode}`);
    if (details.examType) lines.push(`Exam: ${details.examType}`);
    if (details.date) lines.push(`Date: ${new Date(details.date).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}`);
    if (details.startTime) lines.push(`Time: ${details.startTime}`);
    if (details.room) lines.push(`Room: ${details.room}`);
  } else if (contentType === "notice") {
    lines.push(updated ? "🔄 Announcement updated" : "📢 New announcement posted", `Title: ${subject}`);
    if (details.category) lines.push(`Category: ${details.category}`);
  } else {
    const kind = details.type === "event" ? "event" : details.type === "news" ? "community news" : "suggestion";
    lines.push(updated ? `🔄 ${kind[0].toUpperCase()}${kind.slice(1)} updated` : `📣 New ${kind} shared`, `Title: ${subject}`);
    if (details.eventDate) lines.push(`Date: ${new Date(details.eventDate).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}`);
    if (details.location) lines.push(`Location: ${details.location}`);
  }

  lines.push(`Added by: ${authorName || actorName || "Suchi user"}`);
  const appUrl = process.env.PUBLIC_APP_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  lines.push("", `🔗 ${new URL(path, appUrl).toString()}`);
  return lines.join("\n");
}

async function sendTelegramText({ contentType, contentId, title = "", actorName = "", message, fetchImpl = fetch }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    await NotificationLog.create({
      contentType,
      contentId,
      status: "disabled",
      message,
      title,
      actorName,
      errorMessage: "Telegram bot is not configured.",
    });
    return { status: "disabled", errorMessage: "Telegram bot is not configured." };
  }

  let status = "failed";
  let errorMessage = "";
  let sentAt;

  try {
    const result = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
      signal: AbortSignal.timeout(5000),
    });
    const payload = await result.json().catch(() => null);
    if (!result.ok || !payload?.ok) {
      const telegramDescription = payload?.description;
      throw new Error(telegramDescription ? `Telegram: ${telegramDescription}` : `Telegram HTTP ${result.status}`);
    }
    status = "sent";
    sentAt = new Date();
  } catch (error) {
    if (error?.name === "TimeoutError") errorMessage = "Telegram request timed out.";
    else if (error instanceof Error && error.message) errorMessage = error.message.slice(0, 500);
    else errorMessage = "Telegram delivery failed.";
  }

  try {
    await NotificationLog.create({ contentType, contentId, status, message, title, actorName, errorMessage, sentAt });
  } catch (error) {
    console.error("Could not save Telegram delivery log.", error);
  }

  return { status, errorMessage };
}

export async function notifyPublishedContent({ contentType, contentId, title, path, action = "created", actorName, authorName, details = {}, fetchImpl = fetch }) {
  const message = formatTelegramMessage({ contentType, title, path, action, actorName, authorName, details });
  return sendTelegramText({ contentType, contentId, title, actorName, message, fetchImpl });
}

export async function resendTelegramMessage(log, fetchImpl = fetch) {
  if (!log.message) throw new Error("The original Telegram message is not available.");
  return sendTelegramText({
    contentType: log.contentType,
    contentId: log.contentId,
    title: log.title,
    actorName: log.actorName,
    message: log.message,
    fetchImpl,
  });
}
