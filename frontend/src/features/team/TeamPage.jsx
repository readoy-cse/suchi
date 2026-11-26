import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";

const socialLabels = { linkedin: "LinkedIn", github: "GitHub", website: "Website", portfolio: "Personal portfolio", facebook: "Facebook", email: "Email" };

function SocialIcon({ platform }) {
  const common = { "aria-hidden": true, className: "size-[18px]", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.8, viewBox: "0 0 24 24" };
  if (platform === "linkedin") return <svg aria-hidden="true" className="size-[18px] fill-current" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.23 0Z" /></svg>;
  if (platform === "facebook") return <svg {...common}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
  if (platform === "github") return <svg {...common}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
  if (platform === "email") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3.6 9h16.8M3.6 15h16.8M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" /></svg>;
}

function getSocialLinks(socials = {}) {
  return Object.entries(socials)
    .filter(([platform, url]) => socialLabels[platform] && typeof url === "string" && url.trim())
    .map(([platform, url]) => ({ platform, label: socialLabels[platform], url: url.trim() }));
}

function getSocialHref(platform, url) {
  if (platform === "email") return url.startsWith("mailto:") ? url : `mailto:${url}`;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function PersonCard({ person, index }) {
  const [photoOpen, setPhotoOpen] = useState(false);

  useEffect(() => {
    if (!photoOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setPhotoOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photoOpen]);

  return (
    <>
      <article className="group overflow-hidden rounded-[20px] border border-white/70 bg-white/80 shadow-[0_24px_50px_-40px_rgba(23,57,47,0.5)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#d6ef79] hover:shadow-[0_30px_60px_-36px_rgba(23,57,47,0.55)]">
        <div className="relative aspect-square overflow-hidden bg-[#f1f4ea] p-2">
          <button aria-label={`View ${person.name}'s photo full screen`} className="absolute inset-2 z-0 cursor-zoom-in overflow-hidden rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a75a3b]" onClick={() => setPhotoOpen(true)} type="button">
            <img
              alt={`${person.name}, ${person.role}`}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
              loading="lazy"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
              src={person.photo}
            />
          </button>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-2 bottom-2 z-[1] h-20 rounded-b-[14px] bg-gradient-to-t from-[#17392f]/25 to-transparent" />
          <span className="pointer-events-none absolute left-4 top-4 z-[1] grid size-8 place-items-center rounded-xl bg-[#17392f] font-display text-[10px] font-bold text-[#d6ef79] shadow-sm">{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 z-[1] rounded-full bg-[#d6ef79] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#17392f]">Suchi team</span>
        </div>
        <div className="px-5 pb-5 pt-4 sm:px-5">
          <h2 className="font-display text-[1.3rem] font-bold tracking-[-0.045em] text-[#17392f]">{person.name}</h2>
          <p className="mt-1 min-h-6 text-[13px] leading-snug text-[#63756d]">{person.role}</p>
          {getSocialLinks(person.socials).length > 0 && (
            <nav aria-label={`${person.name}'s social links`} className="mt-[2px] flex gap-1">
              {getSocialLinks(person.socials).map(({ platform, label, url }) => (
                <a
                  aria-label={`${person.name} on ${label}`}
                  className="grid size-7 place-items-center rounded-md text-[#63756d] transition-colors hover:bg-[#edf1e7] hover:text-[#17392f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a75a3b]"
                  href={getSocialHref(platform, url)}
                  key={platform}
                  rel="noreferrer"
                  target="_blank"
                  title={label}
                >
                  <SocialIcon platform={platform} />
                </a>
              ))}
            </nav>
          )}
          <div className="mt-[7px] flex items-center gap-2 border-t border-[#e8ebe4] pt-3">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#a75a3b] ring-2 ring-[#a75a3b]/10" />
            <span className="font-mono text-[10px] tracking-[0.08em] text-[#839087]">{person.id}</span>
          </div>
        </div>
      </article>
      {photoOpen && (
        <div
          aria-label={`${person.name}'s photo`}
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07130f]/95 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setPhotoOpen(false)}
          role="dialog"
        >
          <button aria-label="Close photo" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-white/15 bg-[#17392f]/70 text-white shadow-lg backdrop-blur-md transition duration-200 hover:rotate-90 hover:border-[#d6ef79] hover:bg-[#d6ef79] hover:text-[#17392f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6ef79] sm:right-6 sm:top-6" onClick={() => setPhotoOpen(false)} type="button">
            <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
          <img alt={`${person.name}, ${person.role}`} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} src={person.photo} />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">{person.name} <span className="text-white/60">· {person.role}</span></p>
        </div>
      )}
    </>
  );
}

export function TeamPage() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetch("/team/team-members.json")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load team members");
        return response.json();
      })
      .then((members) => setPeople(Array.isArray(members) ? members : []))
      .catch((error) => console.error("Failed to load team members:", error));
  }, []);

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-8 sm:pt-12">
        <section className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-[#e0e5da] bg-[#fbfbf8] px-6 py-7 sm:px-9 sm:py-8">
          <div aria-hidden="true" className="absolute -right-14 -top-24 size-64 rounded-full border-[24px] border-[#edf1e7]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a75a3b]">A team project · Built together</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.055em] text-[#17392f] sm:text-4xl">The people behind Suchi</h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#63756d]">{people.length} teammates, one shared goal: making class updates easier to find, share, and trust.</p>
            </div>
            <div className="relative inline-flex w-fit items-center gap-3 rounded-xl bg-[#17392f] px-4 py-3 text-white shadow-sm">
              <span className="font-display text-2xl font-bold text-[#d6ef79]">{String(people.length).padStart(2, "0")}</span>
              <span className="text-xs leading-tight text-white/75">people<br />behind Suchi</span>
            </div>
          </div>
        </section>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a75a3b]">Meet the team</p>
            <p className="mt-1 text-sm text-[#63756d]">The people and roles that bring Suchi together.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {people.map((person, index) => <PersonCard index={index} key={person.id} person={person} />)}
        </div>
        <div className="mt-8 flex justify-center">
          <Link className="rounded-full border border-[#d8ddd5] bg-white/70 px-4 py-2 text-sm font-semibold text-[#245444] transition hover:border-[#17392f] hover:bg-[#17392f] hover:text-white" to="/">Back to Suchi</Link>
        </div>
      </main>
    </WorkspaceLayout>
  );
}
