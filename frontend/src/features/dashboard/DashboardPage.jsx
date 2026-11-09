import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { useAuth } from "../auth/useAuth.js";
import { api } from "../../lib/api.js";
import { getUpcomingClasses, getUpcomingExams, scheduleLabel } from "./schedule.utils.js";

function ScheduleList({ title, empty, items, now, type }) {
  return (
    <section className="border-y border-[#d8ddd5] py-5" aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link className="text-sm font-semibold text-[#245444] underline underline-offset-4" to={type === "class" ? "/routines" : "/exams"}>View all</Link>
      </div>
      {items.length === 0 ? <p className="text-sm text-[#63756d]">{empty}</p> : (
        <ul className="divide-y divide-[#e3e6df]">
          {items.slice(0, 4).map((item) => (
            <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={item._id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.courseTitle}</p>
                <p className="mt-1 text-xs text-[#63756d]">{type === "class" ? `${item.courseCode} · ${item.day} · ${item.startTime} · ${item.room}` : `${item.courseCode} · ${item.examType} · ${item.startsAt.toLocaleString()} · ${item.room}`}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#e6ecdc] px-2.5 py-1 text-xs font-semibold text-[#354f45]">{scheduleLabel(item, now)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SummaryMetric({ label, value, detail, to }) {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#63756d]">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-[#17392f]">{value}</p>
      <p className="mt-1 text-sm text-[#63756d]">{detail}</p>
    </>
  );

  return to ? <Link className="block border-l-2 border-[#d6ef79] py-1 pl-4 hover:border-[#e77a52]" to={to}>{content}</Link> : <div className="border-l-2 border-[#d6ef79] py-1 pl-4">{content}</div>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const isReviewer = user.role === "admin" || user.role === "cr";
  const [data, setData] = useState({ routines: [], exams: [], notices: [], published: [], mine: [], pending: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    const requests = [api("/routines"), api("/exams"), api("/notices"), api("/submissions/published"), api("/submissions/mine")];
    if (isReviewer) requests.push(api("/submissions/pending"));

    Promise.all(requests)
      .then(([routines, exams, notices, published, mine, pending = { items: [] }]) => {
        if (active) setData({ routines: routines.items, exams: exams.items, notices: notices.items, published: published.items, mine: mine.items, pending: pending.items });
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });

    const interval = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isReviewer]);

  const upcomingClasses = getUpcomingClasses(data.routines, now);
  const upcomingExams = getUpcomingExams(data.exams, now);
  const pendingMine = data.mine.filter((item) => item.status === "pending").length;

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">{user.role} account</p>
            <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Your academic home</h1>
            <p className="mt-2 text-sm text-[#63756d]">Welcome, {user.name}. Here’s what’s coming up.</p>
          </div>
          <Link className="rounded-lg bg-[#17392f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245444] focus:outline-none focus:ring-2 focus:ring-[#a75a3b]" to="/contribute">Share an update</Link>
        </div>

        {error && <p className="mt-6 text-sm text-red-700" role="alert">Could not load dashboard data: {error}</p>}
        {loading ? <p className="py-12 text-sm text-[#63756d]" role="status">Loading your academic summary...</p> : (
          <>
            <section className="mt-7 grid gap-6 border-y border-[#d8ddd5] py-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Academic summary">
              <SummaryMetric label="Classes next 7 days" value={upcomingClasses.length} detail={upcomingClasses[0] ? `Next: ${scheduleLabel(upcomingClasses[0], now)}` : "No upcoming classes"} to="/routines" />
              <SummaryMetric label="Upcoming exams" value={upcomingExams.length} detail={upcomingExams[0] ? `Next: ${scheduleLabel(upcomingExams[0], now)}` : "No upcoming exams"} to="/exams" />
              <SummaryMetric label="Published updates" value={data.notices.length + data.published.length} detail={`${data.notices.length} notices · ${data.published.length} community posts`} to="/notices" />
              <SummaryMetric label={isReviewer ? "Needs review" : "Pending submissions"} value={isReviewer ? data.pending.length : pendingMine} detail={isReviewer ? "Student posts awaiting review" : "Your posts awaiting review"} to={isReviewer ? "/submissions/review" : "/submissions/mine"} />
            </section>

            <section className="mt-7 grid gap-x-10 gap-y-7 lg:grid-cols-2" aria-label="Upcoming schedule">
              <ScheduleList title="Next classes" empty="No classes are scheduled in the next 7 days." items={upcomingClasses} now={now} type="class" />
              <ScheduleList title="Upcoming exams" empty="No upcoming exams are scheduled." items={upcomingExams} now={now} type="exam" />
            </section>

            <section className="mt-8 grid gap-x-10 gap-y-8 border-t border-[#d8ddd5] pt-7 lg:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Latest notices</h2><Link className="text-sm font-semibold text-[#245444] underline underline-offset-4" to="/notices">All notices</Link></div>
                {data.notices.length === 0 ? <p className="py-4 text-sm text-[#63756d]">No notices have been published.</p> : <ul className="divide-y divide-[#e3e6df]">{data.notices.slice(0, 3).map((notice) => <li className="py-3" key={notice._id}><p className="text-sm font-semibold">{notice.title}</p><p className="mt-1 line-clamp-2 text-sm leading-5 text-[#63756d]">{notice.body}</p></li>)}</ul>}
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Class community</h2><Link className="text-sm font-semibold text-[#245444] underline underline-offset-4" to="/events">Open feed</Link></div>
                {data.published.length === 0 ? <p className="py-4 text-sm text-[#63756d]">No community updates have been published.</p> : <ul className="divide-y divide-[#e3e6df]">{data.published.slice(0, 3).map((item) => <li className="py-3" key={item._id}><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 line-clamp-2 text-sm leading-5 text-[#63756d]">{item.description}</p></li>)}</ul>}
              </div>
            </section>
          </>
        )}
      </main>
    </WorkspaceLayout>
  );
}
