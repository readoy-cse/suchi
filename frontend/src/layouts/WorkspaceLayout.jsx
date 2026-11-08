import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth.js";

export function WorkspaceLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (logoutError) {
      setError(logoutError.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4ef] text-[#17392f]">
      <header className="border-b border-[#d8ddd5] bg-[#fbfbf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link className="flex items-center gap-3" to="/" aria-label="Suchi dashboard">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#17392f] text-lg font-extrabold text-[#d6ef79]">S</span>
            <span className="text-sm font-bold tracking-[0.16em]">SUCHI</span>
          </Link>
          <nav className="flex max-w-[75%] items-center gap-2 overflow-x-auto sm:max-w-none sm:gap-4" aria-label="Main navigation">
            <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/">Dashboard</Link>
            <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/routines">Routine</Link>
            <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/exams">Exams</Link>
            <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/notices">Notices</Link>
            <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/events">Events</Link>
            <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/contribute">Submit</Link>
            <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/submissions/mine">My items</Link>
            {(user.role === "admin" || user.role === "cr") && <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/submissions/review">Review</Link>}
            {(user.role === "admin" || user.role === "cr") && <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/notifications">Delivery</Link>}
            {user.role === "admin" && <Link className="whitespace-nowrap text-sm font-medium text-[#354f45] hover:text-[#a75a3b]" to="/users">Users</Link>}
            <span className="hidden border-l border-[#d8ddd5] pl-4 text-sm text-[#63756d] lg:inline">{user.name}</span>
            <button className="rounded-lg border border-[#cbd4cb] px-3 py-2 text-sm font-semibold text-[#17392f] hover:bg-[#eff2e9] focus:outline-none focus:ring-2 focus:ring-[#a75a3b]" type="button" onClick={handleLogout}>Sign out</button>
          </nav>
        </div>
      </header>
      {error && <p className="mx-auto max-w-7xl px-5 pt-4 text-sm text-red-700 sm:px-8" role="alert">{error}</p>}
      {children}
    </div>
  );
}