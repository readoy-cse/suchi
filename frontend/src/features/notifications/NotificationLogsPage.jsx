import { useEffect, useState } from "react";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { api } from "../../lib/api.js";

export function NotificationLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resendingId, setResendingId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [expandedMessages, setExpandedMessages] = useState({});

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

  const sentCount = logs.filter((log) => log.status === "sent").length;
  const failedCount = logs.filter((log) => log.status !== "sent" && log.status !== "disabled").length;
  const latestAttempt = logs[0]?.createdAt
    ? new Date(logs[0].createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
        <section className="relative overflow-hidden rounded-[22px] border border-[#e3e7dd] bg-[#fbfbf8] px-5 py-5 text-[#17392f] shadow-sm sm:px-7 sm:py-6">
          <div aria-hidden="true" className="absolute -right-12 -top-36 size-80 rounded-full border border-[#17392f]/[0.04]" />
          <div aria-hidden="true" className="absolute -right-2 -top-28 size-60 rounded-full border border-[#d6ef79]/40" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a75a3b]">Integrations · Activity</p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-[#17392f] sm:text-[36px]">Telegram delivery</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#718078]">Recent delivery attempts for published updates.</p>
            </div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dfe5d9] bg-[#f4f6ef] px-3 py-2 text-xs font-semibold text-[#526c5d]">
              <span className="size-2 rounded-full bg-[#8cac39]" /> Latest activity <span className="text-[#17392f]">{loading ? "Loading..." : latestAttempt}</span>
            </div>
          </div>
        </section>
        <section aria-label="Delivery summary" className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[["Total attempts", logs.length, "#17392f"], ["Delivered", sentCount, "#4f8060"], ["Needs attention", failedCount, "#a75a3b"]].map(([label, value, color]) => <div className="rounded-2xl border border-[#e3e7dd] bg-[#fbfbf8] px-4 py-3" key={label}><p className="text-xs font-medium text-[#718078]">{label}</p><p className="mt-0.5 font-display text-xl font-bold" style={{ color }}>{loading ? "—" : value}</p></div>)}
        </section>
        <section className="mt-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-xl font-semibold tracking-[-0.02em]">Recent activity</h2><p className="mt-1 text-sm text-[#718078]">Delivery history for published updates</p></div>{!loading && <span className="rounded-full border border-[#dfe4da] bg-[#fbfbf8] px-3 py-1.5 text-xs font-semibold text-[#63756d]">{logs.length} {logs.length === 1 ? "attempt" : "attempts"}</span>}</div>
        {error && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}
        {actionMessage && <p className="mt-6 text-sm text-[#245444]" role="status">{actionMessage}</p>}
        {loading ? <div className="rounded-2xl border border-[#e5e8df] bg-[#fbfbf8] px-5 py-8 text-center" role="status"><div className="mx-auto size-6 animate-spin rounded-full border-2 border-[#d8ddd5] border-t-[#245444]"/><p className="mt-3 text-sm text-[#63756d]">Loading delivery logs...</p></div> : logs.length === 0 ? <div className="rounded-2xl border border-dashed border-[#cbd4cb] bg-[#fbfbf8] px-6 py-8 text-center"><h3 className="font-display text-lg font-semibold">Nothing sent yet</h3><p className="mt-1 text-sm text-[#718078]">Telegram delivery attempts will appear here when an update is published.</p></div> : (
          <div className="space-y-3">
            {logs.map((log) => {
              const isSuccess = log.status === "sent";
              const isDisabled = log.status === "disabled";
              return (
                <article className="overflow-hidden rounded-2xl border border-[#e2e6de] bg-[#fbfbf8] shadow-sm transition-shadow hover:shadow-md" key={log._id}>
                  <div className={`h-1 ${isSuccess ? "bg-[#8cac39]" : isDisabled ? "bg-[#b4a66c]" : "bg-[#a75a3b]"}`} />
                  <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-semibold tracking-[-0.015em] text-[#17392f]">{log.title || `${log.contentType} update`}</h3>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${isSuccess ? "bg-[#dcebdd] text-[#285b3b]" : isDisabled ? "bg-[#ece8d3] text-[#655d3d]" : "bg-[#f3d4c7] text-[#8b3c2a]"}`}>
                          <span aria-hidden="true" className={`size-1.5 rounded-full ${isSuccess ? "bg-[#4f8060]" : isDisabled ? "bg-[#8c8152]" : "bg-[#a75a3b]"}`} />
                          {isSuccess ? "Delivered" : isDisabled ? "Not configured" : "Failed"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[#849189]">{new Date(log.createdAt).toLocaleString()} · Telegram{log.actorName ? ` · Sent by ${log.actorName}` : ""}</p>
                      {log.message && (
                        <div className="mt-2 max-w-4xl">
                          <button
                            aria-controls={`delivery-message-${log._id}`}
                            aria-expanded={Boolean(expandedMessages[log._id])}
                            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] font-semibold text-[#526c5d] transition hover:bg-[#eff2e9] focus:outline-none focus:ring-2 focus:ring-[#a75a3b]"
                            onClick={() => setExpandedMessages((current) => ({ ...current, [log._id]: !current[log._id] }))}
                            type="button"
                          >
                            <svg aria-hidden="true" className={`size-3 transition-transform ${expandedMessages[log._id] ? "rotate-180" : ""}`} fill="none" viewBox="0 0 16 16"><path d="m3.5 6 4.5 4 4.5-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6"/></svg>
                            {expandedMessages[log._id] ? "Hide message" : "Show message"}
                          </button>
                          {expandedMessages[log._id] && <div className="mt-1.5 overflow-hidden rounded-xl border border-[#e4e9df] bg-[#f7f8f3]" id={`delivery-message-${log._id}`}>
                          <div className="flex items-center justify-between border-b border-[#e7ebe2] px-3.5 py-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#718078]">Message preview</span>
                            <span className="text-[10px] font-medium text-[#9aa49c]">Telegram</span>
                          </div>
                          <pre className="delivery-message max-h-56 overflow-auto whitespace-pre-wrap break-words px-3.5 py-3 text-[13px] leading-[1.65] text-[#354f45]">{log.message}</pre>
                          </div>}
                        </div>
                      )}
                      {log.errorMessage && <p className="mt-3 rounded-lg border border-[#edcbbb] bg-white px-3 py-2 text-sm text-[#8b3c2a]" role="alert">{log.errorMessage}</p>}
                    </div>
                    {log.message && (
                      <button className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#d4ddd2] bg-white px-3 py-2 text-xs font-semibold text-[#245444] transition hover:border-[#aebfae] hover:bg-[#f4f7f0] focus:outline-none focus:ring-2 focus:ring-[#a75a3b] disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={resendingId === log._id} onClick={() => handleResend(log._id)}>
                        <svg aria-hidden="true" className={`size-4 ${resendingId === log._id ? "animate-spin" : ""}`} fill="none" viewBox="0 0 20 20"><path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6M16.5 3v4.5h-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7"/></svg>
                        {resendingId === log._id ? "Resending..." : "Resend"}
                      </button>
                    )}
                  </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </section>
      </main>
    </WorkspaceLayout>
  );
}
