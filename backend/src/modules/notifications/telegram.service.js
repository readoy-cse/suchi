import { NotificationLog } from "./notification.model.js";

export async function notifyPublishedContent({ contentType, contentId, title, path, fetchImpl = fetch }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return { status: "disabled" };

  let status = "failed";
  let errorMessage = "";
  let sentAt;

  try {
    const appUrl = process.env.PUBLIC_APP_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
    const link = new URL(path, appUrl).toString();
    const result = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: `Suchi update: ${title.slice(0, 300)}\n${link}` }),
      signal: AbortSignal.timeout(5000),
    });
    const payload = await result.json().catch(() => null);
    if (!result.ok || !payload?.ok) throw new Error("Telegram rejected the message.");
    status = "sent";
    sentAt = new Date();
  } catch {
    errorMessage = "Telegram delivery failed.";
  }

  try {
    await NotificationLog.create({ contentType, contentId, status, errorMessage, sentAt });
  } catch (error) {
    console.error("Could not save Telegram delivery log.", error);
  }

  return { status, errorMessage };
}