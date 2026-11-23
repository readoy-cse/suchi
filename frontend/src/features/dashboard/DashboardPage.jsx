import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { useAuth } from "../auth/useAuth.js";
import { api } from "../../lib/api.js";
import { getUpcomingClasses, getUpcomingExams, scheduleLabel } from "./schedule.utils.js";

const icons = {
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Zm0 15A2.5 2.5 0 0 0 6.5 23H20" />,
  pen: <path d="m15 5 4 4M4 20l1-5L16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 2Z" />,
  bell: <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8Zm4.3 12a2 2 0 0 0 3.4 0" />,
  inbox: <path d="M22 12h-6l-2 3h-4l-2-3H2m3.5-6.9L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1Z" />,
  clock: <path d="M12 7v5l3 2m7-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
  pin: <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  spark: <path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8m0-12.8-2.8 2.8m-7.2 7.2-2.8 2.8" />,
};

function Icon({ name, className = "size-4" }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  );
}

function greeting(now) {
  const hour = now.getHours();
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SectionHeader({ eyebrow, title, to, linkLabel }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a75a3b]">{eyebrow}</p>
        <h2 className="mt-0.5 font-display text-base font-bold tracking-[-0.03em] text-[#17392f]">{title}</h2>
      </div>
      <Link className="group inline-flex items-center gap-1.5 rounded-full border border-[#e1e6dc] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#245444] transition hover:border-[#17392f] hover:bg-[#17392f] hover:text-white" to={to}>
        {linkLabel}
        <Icon className="size-3.5 transition-transform group-hover:translate-x-0.5" name="arrow" />
      </Link>
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#d9dfd3] bg-[#f7f8f3] px-3 py-3.5 text-sm text-[#718078]">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[#9aa79f] shadow-sm"><Icon name="spark" /></span>
      {children}
    </div>
  );
}

function Panel({ className = "", children, ...props }) {
  return (
    <section className={`workspace-panel dash-rise rounded-[20px] p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </section>
  );
}

function SpotlightCard({ item, now }) {
  if (!item) {
    return (
      <div className="relative flex h-full min-h-[160px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#d6ef79] p-4 text-[#17392f]">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#17392f]/70">Next up</p>
        <div>
          <p className="font-display text-xl font-extrabold leading-tight tracking-[-0.04em]">Your week is clear.</p>
          <p className="mt-1 text-sm text-[#17392f]/70">No classes or exams on the horizon.</p>
        </div>
      </div>
    );
  }

  const isExam = item.kind === "exam";
  const live = item.endsAt && item.startsAt <= now && item.endsAt > now;
  const progress = live ? Math.min(100, Math.round(((now - item.startsAt) / (item.endsAt - item.startsAt)) * 100)) : null;

  return (
    <Link className="group relative flex h-full min-h-[160px] flex-col justify-between overflow-hidden rounded-[20px] bg-[#d6ef79] p-4 text-[#17392f] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(214,239,121,0.9)]" to={isExam ? "/exams" : "/routines"}>
      <div aria-hidden="true" className="absolute -bottom-16 -right-12 size-48 rounded-full bg-white/30 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#17392f] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d6ef79]">
          {live && <span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-[#d6ef79]" /><span className="relative inline-flex size-1.5 rounded-full bg-[#d6ef79]" /></span>}
          {live ? "Live now" : isExam ? "Next exam" : "Next class"}
        </span>
        <Icon className="size-5 transition-transform duration-300 group-hover:-rotate-45" name="arrow" />
      </div>
      <div className="relative mt-3">
        <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.05em]">{scheduleLabel(item, now)}</p>
        <p className="mt-2 line-clamp-1 font-display text-sm font-bold leading-snug tracking-[-0.02em]">{item.courseTitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#17392f]/70">
          <span>{item.courseCode}</span>
          <span className="inline-flex items-center gap-1"><Icon className="size-3.5" name="clock" />{isExam ? item.startsAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : `${item.startTime}–${item.endTime}`}</span>
          {item.room && <span className="inline-flex items-center gap-1"><Icon className="size-3.5" name="pin" />{item.room}</span>}
        </div>
        {progress !== null && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#17392f]/15">
            <div className="h-full rounded-full bg-[#17392f]" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </Link>
  );
}

const metricTones = {
  green: "bg-[#17392f] text-[#d6ef79]",
  lime: "bg-[#eef7cc] text-[#3f5a1d]",
  clay: "bg-[#f6e6dd] text-[#a75a3b]",
  sky: "bg-[#e5eef0] text-[#2f5a63]",
};

function SummaryMetric({ label, value, detail, to, icon, tone, delay }) {
  return (
    <Link className="dash-rise group relative overflow-hidden rounded-[18px] border border-white/70 bg-white/80 p-3 shadow-[0_24px_50px_-40px_rgba(23,57,47,0.5)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#d6ef79] hover:shadow-[0_30px_60px_-36px_rgba(23,57,47,0.55)]" style={{ animationDelay: `${delay}ms` }} to={to}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[28px] font-extrabold leading-none tracking-[-0.05em] text-[#17392f]">{value}</p>
          <p className="mt-1 text-[13px] font-semibold text-[#17392f]">{label}</p>
        </div>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${metricTones[tone]}`}><Icon className="size-[18px]" name={icon} /></span>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs text-[#718078]">{detail}</p>
        <Icon className="size-3.5 shrink-0 -translate-x-1 text-[#9aa79f] opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" name="arrow" />
      </div>
    </Link>
  );
}

function ClassTimeline({ items, now }) {
  if (items.length === 0) return <EmptyState>No classes are scheduled in the next 7 days.</EmptyState>;
  return (
    <ol className="relative space-y-1 before:absolute before:bottom-3 before:left-[25px] before:top-3 before:w-px before:bg-gradient-to-b before:from-[#d6ef79] before:via-[#dfe5d9] before:to-transparent">
      {items.slice(0, 5).map((item, index) => {
        const live = item.startsAt <= now && item.endsAt > now;
        return (
          <li className="group relative flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-[#f6f8f1]" key={item._id}>
            <div className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-xl border text-center ${index === 0 ? "border-[#17392f] bg-[#17392f] text-white" : "border-[#e3e8de] bg-white text-[#17392f]"}`}>
              <span className="leading-none">
                <span className={`block text-[9px] font-bold uppercase tracking-[0.14em] ${index === 0 ? "text-[#d6ef79]" : "text-[#a75a3b]"}`}>{item.day.slice(0, 3)}</span>
                <span className="mt-0.5 block font-display text-[11px] font-bold">{item.startTime}</span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#17392f]">{item.courseTitle}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-[#718078]">
                <span className="font-semibold text-[#526c5d]">{item.courseCode}</span>
                <span className="inline-flex items-center gap-1"><Icon className="size-3" name="clock" />{item.startTime}–{item.endTime}</span>
                {item.room && <span className="inline-flex items-center gap-1"><Icon className="size-3" name="pin" />{item.room}</span>}
              </p>
            </div>
            <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-block ${live ? "bg-[#d6ef79] text-[#17392f]" : "bg-[#f1f3ed] text-[#526c5d]"}`}>{scheduleLabel(item, now)}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ExamList({ items, now }) {
  if (items.length === 0) return <EmptyState>No upcoming exams are scheduled.</EmptyState>;
  return (
    <ul className="space-y-1.5">
      {items.slice(0, 4).map((item, index) => (
        <li className={`flex items-center gap-3 rounded-xl border p-2 transition hover:-translate-y-0.5 ${index === 0 ? "border-[#f0d9cc] bg-gradient-to-r from-[#fbf1eb] to-white" : "border-[#edf0e9] bg-white"}`} key={item._id}>
          <div className="w-10 shrink-0 overflow-hidden rounded-lg border border-[#eadfd8] bg-white text-center shadow-sm">
            <p className="bg-[#a75a3b] py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">{item.startsAt.toLocaleDateString(undefined, { month: "short" })}</p>
            <p className="py-0.5 font-display text-base font-extrabold leading-tight text-[#17392f]">{item.startsAt.getDate()}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#17392f]">{item.courseTitle}</p>
            <p className="mt-0.5 truncate text-xs text-[#718078]">
              <span className="font-semibold text-[#a75a3b]">{item.examType}</span> · {item.courseCode} · {item.startsAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}{item.room ? ` · ${item.room}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-right text-[11px] font-bold text-[#a75a3b]">{scheduleLabel(item, now)}</span>
        </li>
      ))}
    </ul>
  );
}

function FeedList({ items, bodyKey, icon, empty }) {
  if (items.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <ul className="space-y-1">
      {items.slice(0, 3).map((item) => (
        <li className="flex gap-3 rounded-xl p-2 transition hover:bg-[#f6f8f1]" key={item._id}>
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#f1f4ea] text-[#245444]"><Icon name={icon} /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#17392f]">{item.title}</p>
            <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-[#718078]">{item[bodyKey]}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-5 space-y-5" role="status">
      <span className="sr-only">Loading your academic summary...</span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((key) => <div className="h-[118px] animate-pulse rounded-[18px] bg-white/70" key={key} />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="h-56 animate-pulse rounded-[20px] bg-white/70 lg:col-span-7" />
        <div className="h-56 animate-pulse rounded-[20px] bg-white/70 lg:col-span-5" />
      </div>
    </div>
  );
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
        if (active) {
          setData({ routines: routines.items, exams: exams.items, notices: notices.items, published: published.items, mine: mine.items, pending: pending.items });
        }
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
  const firstName = user.name.split(" ")[0];

  const nextClass = upcomingClasses[0] && { ...upcomingClasses[0], kind: "class" };
  const nextExam = upcomingExams[0] && { ...upcomingExams[0], kind: "exam" };
  const spotlight = [nextClass, nextExam].filter(Boolean).sort((a, b) => a.startsAt - b.startsAt)[0];

  const todayCount = upcomingClasses.filter((item) => item.startsAt.toDateString() === now.toDateString()).length;

  return (
    <WorkspaceLayout>
      <div className="relative">
        <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-6">
          {/* Hero */}
          <section className="dash-rise grid gap-3 lg:grid-cols-12">
            <div className="relative isolate overflow-hidden rounded-[22px] bg-[#17392f] p-5 text-white shadow-[0_40px_80px_-50px_rgba(23,57,47,0.9)] sm:px-6 sm:py-5 lg:col-span-8">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_100%_0%,rgba(214,239,121,0.22),transparent_55%),radial-gradient(60%_80%_at_0%_100%,rgba(167,90,59,0.28),transparent_60%)]" />
              <div aria-hidden="true" className="dash-grid absolute inset-0 -z-10 opacity-[0.07]" />
              <div aria-hidden="true" className="absolute -right-20 -top-24 -z-10 size-72 rounded-full border border-white/10" />
              <div aria-hidden="true" className="absolute -right-6 -top-10 -z-10 size-44 rounded-full border border-[#d6ef79]/25" />

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d6ef79]">{user.role}</span>
                <span className="text-xs font-medium text-white/60">{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span>
              </div>

              <h1 className="mt-3 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.05em] sm:text-[34px]">
                {greeting(now)},<br />
                <span className="bg-gradient-to-r from-[#d6ef79] via-[#eaf7b8] to-[#f3c9b4] bg-clip-text text-transparent">{firstName}.</span>
              </h1>
              <p className="mt-2 max-w-md text-[13px] leading-5 text-white/65">
                {loading ? "Gathering your academic world…" : todayCount > 0 ? `You have ${todayCount} class${todayCount > 1 ? "es" : ""} on today's schedule. Make it count.` : "A calm, clear view of everything that's next on campus."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link className="group inline-flex items-center gap-2 rounded-full bg-[#d6ef79] px-4 py-2 text-xs font-bold text-[#17392f] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#d6ef79] focus:ring-offset-2 focus:ring-offset-[#17392f]" to="/contribute">
                  <Icon name="pen" /> Share an update
                </Link>
                <Link className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10" to="/routines">
                  <Icon name="book" /> My routine
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              {loading ? <div className="h-full min-h-[160px] animate-pulse rounded-[20px] bg-[#d6ef79]/50" /> : <SpotlightCard item={spotlight} now={now} />}
            </div>
          </section>

          {error && <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">Could not load dashboard data: {error}</p>}

          {loading ? <DashboardSkeleton /> : (
            <>
              <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Academic summary">
                <SummaryMetric delay={60} icon="book" label="Classes this week" tone="green" value={upcomingClasses.length} detail={upcomingClasses[0] ? `Next ${scheduleLabel(upcomingClasses[0], now).toLowerCase()}` : "No upcoming classes"} to="/routines" />
                <SummaryMetric delay={120} icon="pen" label="Upcoming exams" tone="clay" value={upcomingExams.length} detail={upcomingExams[0] ? `Next ${scheduleLabel(upcomingExams[0], now).toLowerCase()}` : "No upcoming exams"} to="/exams" />
                <SummaryMetric delay={180} icon="bell" label="Published updates" tone="lime" value={data.notices.length + data.published.length} detail={`${data.notices.length} notices · ${data.published.length} community posts`} to="/notices" />
                <SummaryMetric delay={240} icon="inbox" label={isReviewer ? "Needs review" : "Pending submissions"} tone="sky" value={isReviewer ? data.pending.length : pendingMine} detail={isReviewer ? "Student posts awaiting review" : "Your posts awaiting review"} to={isReviewer ? "/submissions/review" : "/submissions/mine"} />
              </section>

              <section className="mt-3 grid gap-3 lg:grid-cols-12" aria-label="Upcoming schedule">
                <Panel className="lg:col-span-7" style={{ animationDelay: "200ms" }} aria-label="Next classes">
                  <SectionHeader eyebrow="Next 7 days" linkLabel="Full routine" title="Class timeline" to="/routines" />
                  <ClassTimeline items={upcomingClasses} now={now} />
                </Panel>
                <Panel className="lg:col-span-5" style={{ animationDelay: "260ms" }} aria-label="Upcoming exams">
                  <SectionHeader eyebrow="Stay prepared" linkLabel="All exams" title="Upcoming exams" to="/exams" />
                  <ExamList items={upcomingExams} now={now} />
                </Panel>
              </section>

              <section className="mt-3 grid gap-3 lg:grid-cols-2">
                <Panel style={{ animationDelay: "320ms" }} aria-label="Latest notices">
                  <SectionHeader eyebrow="Official" linkLabel="All notices" title="Latest notices" to="/notices" />
                  <FeedList bodyKey="body" empty="No notices have been published." icon="bell" items={data.notices} />
                </Panel>
                <Panel style={{ animationDelay: "380ms" }} aria-label="Class community">
                  <SectionHeader eyebrow="From classmates" linkLabel="Open feed" title="Class community" to="/events" />
                  <FeedList bodyKey="description" empty="No community updates have been published." icon="users" items={data.published} />
                </Panel>
              </section>
            </>
          )}
        </main>
      </div>
    </WorkspaceLayout>
  );
}
