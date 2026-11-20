import { useEffect, useState } from "react";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { api } from "../../lib/api.js";

export function NotificationLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resendingId, setResendingId] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function loadLogs() {
    setLoading(true);
    setError("");
    try {
      const { logs: results } = await api("/notifications");
      setLogs(results);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api("/notifications")
      .then(({ logs: results }) => { if (active) setLogs(results); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function handleResend(logId) {
    setResendingId(logId);
    setActionMessage("");
    setError("");
    try {
      const { notification } = await api(`/notifications/${logId}/resend`, { method: "POST" });
      setActionMessage(notification.status === "sent"
        ? "Message resent successfully."
        : `Resend failed: ${notification.errorMessage}`);
      await loadLogs();
    } catch (resendError) {
      setError(resendError.message);
    } finally {
      setResendingId("");
    }
  }

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Integrations</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Telegram delivery</h1>
        <p className="mt-2 text-sm text-[#63756d]">Recent delivery attempts for published updates.</p>
        {error && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}
        {actionMessage && <p className="mt-6 text-sm text-[#245444]" role="status">{actionMessage}</p>}
        {loading ? <p className="mt-8 text-sm text-[#63756d]" role="status">Loading delivery logs...</p> : logs.length === 0 ? <p className="mt-8 border-y border-[#d8ddd5] py-6 text-sm text-[#63756d]">No Telegram deliveries have been attempted.</p> : (
          <div className="mt-8 divide-y divide-[#d8ddd5] border-y border-[#d8ddd5]">
            {logs.map((log) => {
              const isSuccess = log.status === "sent";
              const isDisabled = log.status === "disabled";
              return (
                <article className={`my-3 rounded-xl border p-4 ${isSuccess ? "border-[#b8ccb9] bg-[#f4f8f1]" : isDisabled ? "border-[#ddd7bf] bg-[#faf8ef]" : "border-[#dfc1b6] bg-[#fff8f5]"}`} key={log._id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold">{log.title || `${log.contentType} update`}</h2>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${isSuccess ? "bg-[#dcebdd] text-[#285b3b]" : isDisabled ? "bg-[#ece8d3] text-[#655d3d]" : "bg-[#f3d4c7] text-[#8b3c2a]"}`}>
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${isSuccess ? "bg-[#4f8060]" : isDisabled ? "bg-[#8c8152]" : "bg-[#a75a3b]"}`} />
                          {isSuccess ? "Success" : isDisabled ? "Not configured" : "Failed"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#849189]">{new Date(log.createdAt).toLocaleString()} · Telegram{log.actorName ? ` · Sent by ${log.actorName}` : ""}</p>
                      {log.message && <pre className="mt-3 max-w-3xl whitespace-pre-wrap rounded-lg border border-[#e1e5dc] bg-white p-3 text-xs leading-5 text-[#354f45]">{log.message}</pre>}
                      {log.errorMessage && <p className="mt-3 rounded-lg border border-[#edcbbb] bg-white px-3 py-2 text-sm text-[#8b3c2a]" role="alert">{log.errorMessage}</p>}
                    </div>
                    {log.message && (
                      <button className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#17392f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#245444] focus:outline-none focus:ring-2 focus:ring-[#a75a3b] disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={resendingId === log._id} onClick={() => handleResend(log._id)}>
                        <svg aria-hidden="true" className={`size-4 ${resendingId === log._id ? "animate-spin" : ""}`} fill="none" viewBox="0 0 20 20"><path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6M16.5 3v4.5h-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7"/></svg>
                        {resendingId === log._id ? "Resending..." : "Resend"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </WorkspaceLayout>
  );
}