import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

function HomePage() {
  const [health, setHealth] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/health", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("API request failed");
        return response.json();
      })
      .then(() => setHealth("online"))
      .catch(() => {
        if (!controller.signal.aborted) setHealth("offline");
      });

    return () => controller.abort();
  }, []);

  const statusLabel = {
    checking: "Checking connection",
    online: "API connected",
    offline: "API unavailable",
  }[health];

  return (
    <main className="min-h-screen bg-[#f4f4ef] text-[#17392f]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 md:grid-cols-[minmax(280px,0.82fr)_1.18fr]">
        <aside className="relative flex min-h-[310px] flex-col justify-between overflow-hidden bg-[#17392f] px-8 py-8 text-[#f4f4ef] sm:px-12 sm:py-12 md:min-h-screen md:px-14 md:py-14">
          <div className="absolute -right-24 -top-20 size-72 rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute -right-8 -top-4 size-40 rounded-full border border-white/10" aria-hidden="true" />
          <a className="relative flex w-fit items-center gap-3" href="/" aria-label="Suchi home">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#d6ef79] text-xl font-extrabold text-[#17392f]">S</span>
            <span className="text-[15px] font-bold tracking-[0.16em]">SUCHI</span>
          </a>

          <div className="relative mt-14 md:mt-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#d6ef79]">Campus, in context</p>
            <h1 className="max-w-sm text-4xl font-semibold leading-[1.08] sm:text-5xl">Light up every update.</h1>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/65">A thoughtful home for the things happening in your academic world.</p>
          </div>

          <div className="relative mt-12 flex items-center gap-3 text-xs text-white/55 md:mt-0">
            <span className="size-2 rounded-full bg-[#d6ef79]" aria-hidden="true" />
            Built for your class community
          </div>
        </aside>

        <section className="flex flex-col justify-between px-7 py-9 sm:px-12 sm:py-12 md:px-16 md:py-14 lg:px-20">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#63756d]">Workspace foundation</span>
            <span className="rounded-full border border-[#d8ddd5] px-3 py-1.5 text-[11px] font-medium text-[#63756d]">Phase 01</span>
          </div>

          <div className="my-16 max-w-2xl md:my-24">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-9 bg-[#e77a52]" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">A fresh start</span>
            </div>
            <h2 className="text-5xl font-semibold leading-[0.98] tracking-normal text-[#17392f] sm:text-6xl lg:text-7xl">Good things<br />start together.</h2>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#63756d]">Suchi is taking shape: a clearer, calmer place for class updates to find their people.</p>

            <div className="mt-12 border-t border-[#d8ddd5] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#354f45]">Development services</span>
                <span className="inline-flex items-center gap-2 text-sm text-[#63756d]" role="status" aria-live="polite">
                  <span className={`size-2 rounded-full ${health === "online" ? "bg-[#45835e]" : health === "offline" ? "bg-[#d46a4c]" : "animate-pulse bg-[#c4a34c]"}`} aria-hidden="true" />
                  {statusLabel}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#849189]">The API connection is checked automatically when this page loads.</p>
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-[#d8ddd5] pt-5 text-xs text-[#849189]">
            <span>Suchi</span>
            <span>Light up every update.</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}