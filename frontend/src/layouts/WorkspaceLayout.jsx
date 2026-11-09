import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";

export function WorkspaceLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 72, right: 16 });

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (logoutError) {
      setError(logoutError.message);
    }
  }

  const navClass = ({ isActive }) => `shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a75a3b] ${isActive ? "bg-[#17392f] text-white" : "text-[#354f45] hover:bg-[#eff2e9] hover:text-[#17392f]"}`;

  const canManage = user.role === "admin" || user.role === "cr";

  function closeManageMenu() { setManageOpen(false); }

  function positionMenu(event, width, height) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const rightEdge = Math.max(12, Math.min(window.innerWidth - 12, bounds.right));
    setMenuPosition({
      top: Math.max(12, Math.min(bounds.bottom + 8, window.innerHeight - height - 12)),
      right: Math.max(12, Math.min(window.innerWidth - width - 12, window.innerWidth - rightEdge)),
    });
  }

  return (
    <div className="min-h-screen bg-[#f4f4ef] text-[#17392f]">
      <header className="border-b border-[#d8ddd5] bg-[#fbfbf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
          <Link className="flex items-center gap-3" to="/" aria-label="Suchi dashboard">
            <span className="font-bengali text-[29px] font-bold leading-none tracking-tight text-[#17392f]">সূচি</span>
            <span aria-hidden="true" className="flex flex-col gap-[3px] pt-1"><i className="h-[2px] w-4 rounded-full bg-[#a75a3b]"/><i className="h-[2px] w-3 rounded-full bg-[#17392f]"/><i className="h-[2px] w-2 rounded-full bg-[#17392f]"/></span>
          </Link>
          <nav className="ml-auto flex min-w-0 items-center justify-end gap-1 overflow-x-auto" aria-label="Main navigation">
            <NavLink className={navClass} end to="/">Home</NavLink>
            <NavLink className={navClass} to="/routines">Classes</NavLink>
            <NavLink className={navClass} to="/exams">Exams</NavLink>
            <NavLink className={navClass} to="/notices">Notices</NavLink>
            <NavLink className={navClass} to="/events">Events</NavLink>
            {canManage && (
              <>
                <button aria-expanded={manageOpen} aria-haspopup="true" className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#eff2e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a75a3b] ${manageOpen ? "bg-[#eff2e9] text-[#17392f]" : "text-[#354f45]"}`} onClick={(event) => { positionMenu(event, 224, user.role === "admin" ? 230 : 170); setManageOpen((open) => !open); setProfileOpen(false); }} type="button">
                  {user.role === "admin" ? "Admin tools" : "CR tools"} <svg aria-hidden="true" className={`transition-transform ${manageOpen ? "rotate-180" : ""}`} fill="none" height="12" viewBox="0 0 12 12" width="12"><path d="m2.5 4.5 3.5 3 3.5-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
                </button>
                {manageOpen && <div className="fixed z-[100] w-56 rounded-xl border border-[#d8ddd5] bg-[#fbfbf8] p-2 shadow-xl" style={menuPosition}>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-[#63756d]">Create new</p>
                  <NavLink onClick={closeManageMenu} className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#eff2e9] ${isActive ? "bg-[#eff2e9] text-[#17392f]" : "text-[#354f45]"}`} to="/routines/create">Class routine</NavLink>
                  <NavLink onClick={closeManageMenu} className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#eff2e9] ${isActive ? "bg-[#eff2e9] text-[#17392f]" : "text-[#354f45]"}`} to="/exams/create">Exam schedule</NavLink>
                  <NavLink onClick={closeManageMenu} className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-[#eff2e9] ${isActive ? "bg-[#eff2e9] text-[#17392f]" : "text-[#354f45]"}`} to="/notices/create">Notice</NavLink>
                  {user.role === "admin" && <NavLink onClick={closeManageMenu} className={({ isActive }) => `mt-2 block border-t border-[#e3e6df] px-3 py-3 text-sm font-semibold hover:bg-[#eff2e9] ${isActive ? "text-[#17392f]" : "text-[#354f45]"}`} to="/users">Manage users</NavLink>}
                </div>}
              </>
            )}
            <button aria-label="Open profile menu" aria-expanded={profileOpen} aria-haspopup="true" className="grid size-10 shrink-0 place-items-center rounded-full border border-[#cbd4cb] bg-white text-[#17392f] hover:bg-[#eff2e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a75a3b]" type="button" onClick={(event) => { positionMenu(event, 240, 150); setProfileOpen((open) => !open); setManageOpen(false); }}>
              <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/><path d="M4.5 20c.8-3.6 3.4-5.5 7.5-5.5s6.7 1.9 7.5 5.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>
            </button>
            {profileOpen && <div className="fixed z-[100] w-60 rounded-xl border border-[#d8ddd5] bg-[#fbfbf8] p-2 shadow-xl" style={menuPosition}>
              <div className="border-b border-[#e3e6df] px-3 py-2"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-[#63756d]">{user.email}</p></div>
              <Link className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#354f45] hover:bg-[#eff2e9]" onClick={() => setProfileOpen(false)} to="/account">Account & password</Link>
              <Link className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#354f45] hover:bg-[#eff2e9]" onClick={() => setProfileOpen(false)} to="/submissions/mine">My contributions</Link>
              <button className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#8b3c2a] hover:bg-[#fbefea]" type="button" onClick={() => { setProfileOpen(false); handleLogout(); }}>Sign out</button>
            </div>}
          </nav>
        </div>
      </header>
      {error && <p className="mx-auto max-w-7xl px-5 pt-4 text-sm text-red-700 sm:px-8" role="alert">{error}</p>}
      {children}
    </div>
  );
}
