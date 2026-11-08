import { useEffect, useState } from "react";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { api } from "../../lib/api.js";

export function NotificationLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/notifications")
      .then(({ logs: results }) => { if (active) setLogs(results); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Integrations</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Telegram delivery</h1>
        <p className="mt-2 text-sm text-[#63756d]">Recent delivery attempts for published updates.</p>
        {error && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}
        {loading ? <p className="mt-8 text-sm text-[#63756d]" role="status">Loading delivery logs...</p> : logs.length === 0 ? <p className="mt-8 border-y border-[#d8ddd5] py-6 text-sm text-[#63756d]">No Telegram deliveries have been attempted.</p> : (
          <div className="mt-8 divide-y divide-[#d8ddd5] border-y border-[#d8ddd5]">
            {logs.map((log) => (
              <article className="flex flex-wrap items-start justify-between gap-3 py-4" key={log._id}>
                <div><h2 className="text-sm font-semibold">{log.contentType} update</h2><p className="mt-1 text-xs text-[#849189]">{new Date(log.createdAt).toLocaleString()} · Telegram</p>{log.errorMessage && <p className="mt-2 text-sm text-[#8b3c2a]">{log.errorMessage}</p>}</div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${log.status === "sent" ? "bg-[#dcebdd] text-[#285b3b]" : "bg-[#f6e1d9] text-[#8b3c2a]"}`}>{log.status}</span>
              </article>
            ))}
          </div>
        )}
      </main>
    </WorkspaceLayout>
  );
}