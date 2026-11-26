import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "./useAuth.js";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";

export function TelegramInvitePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const firstSignUp = Boolean(location.state?.firstSignUp);
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    api("/config/public")
      .then(({ telegramChannelUrl }) => {
        if (active) setChannelUrl(telegramChannelUrl || "");
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function copyLink() {
    if (!channelUrl) return;
    try {
      await navigator.clipboard.writeText(channelUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = channelUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
  }

  const content = (
    <main className="relative isolate grid min-h-[calc(100vh-73px)] place-items-center overflow-hidden bg-[#f4f4ef] px-5 py-10 text-[#17392f] sm:px-8">
      <div aria-hidden="true" className="absolute left-[-8rem] top-[-10rem] size-[26rem] rounded-full bg-[#d6ef79]/30 blur-3xl" />
      <div aria-hidden="true" className="absolute bottom-[-12rem] right-[-8rem] size-[28rem] rounded-full bg-[#a75a3b]/10 blur-3xl" />

      <section className="relative w-full max-w-[940px] overflow-hidden rounded-[30px] border border-white/90 bg-[#fbfbf8] shadow-[0_30px_100px_-48px_rgba(23,57,47,0.58)]">
        <div className="grid md:grid-cols-[0.78fr_1.22fr]">
          <aside className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden bg-[#17392f] p-10 text-white md:flex">
            <div aria-hidden="true" className="absolute -right-20 -top-16 size-64 rounded-full border-[36px] border-[#d6ef79]/10" />
            <div aria-hidden="true" className="absolute -bottom-24 -left-20 size-72 rounded-full bg-[#d6ef79]/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <span className="font-bengali text-3xl font-bold">{"\u09b8\u09c2\u099a\u09bf"}</span>
              <span aria-hidden="true" className="flex flex-col gap-[3px]"><i className="h-[2px] w-4 rounded-full bg-[#d6ef79]" /><i className="h-[2px] w-3 rounded-full bg-white/80" /></span>
            </div>
            <div className="relative">
              <div className="grid size-20 place-items-center rounded-[22px] border border-white/15 bg-white/10 shadow-inner backdrop-blur">
                <svg aria-hidden="true" fill="none" height="38" viewBox="0 0 38 38" width="38">
                  <path d="M32.8 7.2 27.7 30c-.4 1.7-1.4 2.1-2.9 1.3l-7.1-5.2-3.4 3.3c-.4.4-.7.7-1.4.7l.5-7.2 13.1-11.8c.6-.5-.1-.8-.9-.3L9.9 21.2l-7-2.2c-1.5-.5-1.5-1.5.3-2.2L30.5 5.2c1.3-.5 2.4.3 2.3 2Z" fill="#d6ef79" />
                </svg>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#d6ef79]">Stay connected</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">Every important update, in one place.</h2>
            </div>
            <p className="relative text-xs text-white/55">Suchi Community</p>
          </aside>

          <div className="flex min-h-[560px] flex-col justify-center p-7 text-left sm:p-10 md:p-12">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-[#d8ddd5] bg-[#f1f4eb] text-[#245444] shadow-sm md:hidden">
              <svg aria-hidden="true" fill="none" height="30" viewBox="0 0 38 38" width="30"><path d="M32.8 7.2 27.7 30c-.4 1.7-1.4 2.1-2.9 1.3l-7.1-5.2-3.4 3.3c-.4.4-.7.7-1.4.7l.5-7.2 13.1-11.8c.6-.5-.1-.8-.9-.3L9.9 21.2l-9.2-2.2c-1.5-.5-1.5-1.5.3-2.2L30.5 5.2c1.3-.5 2.4.3 2.3 2Z" fill="currentColor" /></svg>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b] md:mt-0">{firstSignUp ? "Welcome to Suchi" : `Welcome, ${user.name}`}</p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[42px] tracking-[-0.035em]">Join our Telegram channel</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#63756d]">Get class routines, exam updates, notices, and community announcements directly in Telegram.</p>

            {loading ? (
              <div className="mt-8 rounded-2xl border border-[#e1e5dc] bg-[#f8f9f5] px-5 py-6" role="status">
                <div className="mx-auto size-6 animate-spin rounded-full border-2 border-[#d8ddd5] border-t-[#245444]" />
                <p className="mt-3 text-sm text-[#63756d]">Preparing invite link...</p>
              </div>
            ) : error ? (
              <p className="mt-8 rounded-xl border border-[#edcbbb] bg-[#fff8f5] px-4 py-3 text-sm text-[#8b3c2a]" role="alert">{error}</p>
            ) : channelUrl ? (
              <div className="mt-8 space-y-3">
                <a className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#17392f] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(23,57,47,0.9)] transition hover:-translate-y-0.5 hover:bg-[#245444] focus:outline-none focus:ring-2 focus:ring-[#a75a3b] focus:ring-offset-2" href={channelUrl} target="_blank" rel="noreferrer">
                  <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 20 20" width="18"><path d="M7 4H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3M10 3h7v7M9 11l8-8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7"/></svg>
                  Join Telegram channel
                </a>
                <button className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#cbd4cb] bg-white px-5 py-3.5 text-sm font-semibold text-[#245444] transition hover:bg-[#eff2e9] focus:outline-none focus:ring-2 focus:ring-[#a75a3b]" type="button" onClick={copyLink}>
                  {copied ? (
                    <><svg aria-hidden="true" fill="none" height="18" viewBox="0 0 20 20" width="18"><path d="m4 10 3.5 3.5L16 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"/></svg>Link copied</>
                  ) : (
                    <><svg aria-hidden="true" fill="none" height="18" viewBox="0 0 20 20" width="18"><rect height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" width="10" x="7" y="7"/><path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-7A1.5 1.5 0 0 0 3 5.5v7A1.5 1.5 0 0 0 4.5 14H7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/></svg>Copy invite link</>
                  )}
                </button>
              </div>
            ) : (
              <p className="mt-8 rounded-xl border border-[#e1e5dc] bg-[#f8f9f5] px-4 py-3 text-sm text-[#63756d]">Invite link is not configured yet.</p>
            )}

            <button className="mt-6 rounded-lg px-4 py-2 text-sm font-semibold text-[#63756d] transition hover:bg-[#eff2e9] hover:text-[#17392f]" type="button" onClick={() => navigate("/", { replace: true })}>{firstSignUp ? "Continue to app" : "Back to Suchi"}</button>
          </div>
        </div>
      </section>
    </main>
  );

  if (firstSignUp) return content;

  return <WorkspaceLayout>{content}</WorkspaceLayout>;
}
