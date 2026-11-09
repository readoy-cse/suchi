import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { ConfirmDialog } from "../../components/ConfirmDialog.jsx";
import { api } from "../../lib/api.js";

const roles = ["student", "cr", "admin"];

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    api("/users")
      .then(({ users: results }) => { if (active) setUsers(results); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const query = search.trim().toLowerCase();
  const filteredUsers = users.filter((user) => !query || `${user.name} ${user.email}`.toLowerCase().includes(query));

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-5xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Administration</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">User management</h1>
        <p className="mt-2 text-sm leading-6 text-[#63756d]">Search accounts and select a user to manage their details.</p>

        {error && <p className="mt-5 rounded-lg border border-[#e4b7aa] bg-[#fbefea] px-4 py-3 text-sm text-[#8b3c2a]" role="alert">{error}</p>}
        <div className="mt-7 overflow-hidden rounded-2xl border border-[#d8ddd5] bg-[#fbfbf8] shadow-[0_12px_40px_-32px_rgba(23,57,47,0.4)]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e3e6df] p-4 sm:p-5">
            <div><h2 className="text-base font-semibold">All accounts</h2><p className="mt-1 text-xs text-[#63756d]">Choose an account to view or manage it.</p>{!loading && <p className="mt-1 text-xs font-medium text-[#245444]">{filteredUsers.length} {filteredUsers.length === 1 ? "account" : "accounts"}{search && ` matching “${search}”`}</p>}</div>
            <div className="relative w-full sm:max-w-sm">
              <label className="sr-only" htmlFor="user-search">Search users</label>
              <svg aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#849189]" fill="none" height="18" viewBox="0 0 24 24" width="18"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7"/><path d="m16 16 4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7"/></svg>
              <input className="w-full rounded-xl border border-[#cbd4cb] bg-white py-3 pl-10 pr-3.5 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id="user-search" placeholder="Search name or email" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </div>
          {loading ? <p className="p-6 text-sm text-[#63756d]" role="status">Loading users...</p> : filteredUsers.length === 0 ? <p className="p-6 text-sm text-[#63756d]">{users.length ? "No users match that search." : "No user accounts yet."}</p> : (
            <ul className="grid grid-cols-1 gap-3 p-4 sm:p-5">
              {filteredUsers.map((user) => <li key={user.id}>
                <Link className="group flex h-full items-center gap-3 rounded-xl border border-[#e3e6df] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#b9c8bb] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a75a3b]" to={`/users/${user.id}`}>
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e9eee4] font-display text-base font-bold text-[#245444]">{user.name.trim().charAt(0).toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#17392f]">{user.name}</span><span className="mt-1 block truncate text-xs text-[#63756d]">{user.email}</span><span className="mt-2 flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-wide text-[#63756d]">{user.role}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${user.isActive ? "bg-[#e9eee4] text-[#245444]" : "bg-[#fbefea] text-[#8b3c2a]"}`}>{user.isActive ? "Active" : "Inactive"}</span></span></span>
                  <svg aria-hidden="true" className="shrink-0 text-[#849189] transition-transform group-hover:translate-x-0.5 group-hover:text-[#17392f]" fill="none" height="18" viewBox="0 0 24 24" width="18"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"/></svg>
                </Link>
              </li>)}
            </ul>
          )}
        </div>
      </main>
    </WorkspaceLayout>
  );
}

export function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleDraft, setRoleDraft] = useState("student");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api(`/users/${id}`)
      .then(({ user: result }) => { if (active) { setUser(result); setRoleDraft(result.role); } })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function confirmAction() {
    if (!pendingAction) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (pendingAction.type === "password") {
        await api(`/users/${id}/password`, { method: "PATCH", body: JSON.stringify({ password: pendingAction.password }) });
        setNewPassword("");
        setConfirmPassword("");
        setPasswordOpen(false);
        setPasswordError("");
        setMessage("Password changed successfully.");
      } else {
        const { user: updatedUser } = await api(`/users/${id}/${pendingAction.type}`, {
          method: "PATCH",
          body: JSON.stringify(pendingAction.body),
        });
        setUser(updatedUser);
        if (pendingAction.type === "role") setRoleDraft(updatedUser.role);
        setMessage(pendingAction.type === "role" ? "Role change saved." : `Account ${updatedUser.isActive ? "activated" : "deactivated"}.`);
      }
      setPendingAction(null);
    } catch (actionError) {
      setError(actionError.message);
      if (pendingAction.type === "role") setRoleDraft(user.role);
      setPendingAction(null);
    } finally {
      setSaving(false);
    }
  }

  const confirmation = pendingAction?.type === "role"
    ? { title: "Confirm role change", message: `Change ${user?.name}'s role to ${pendingAction.body.role.toUpperCase()}? This will be saved to the account.`, confirmLabel: "Save role", danger: false }
    : pendingAction?.type === "status"
      ? { title: `Confirm ${pendingAction.body.isActive ? "account activation" : "account deactivation"}`, message: `${pendingAction.body.isActive ? "Activate" : "Deactivate"} ${user?.name}'s account?`, confirmLabel: pendingAction.body.isActive ? "Activate account" : "Deactivate account" }
      : pendingAction?.type === "password"
        ? { title: "Confirm password change", message: `Set a new password for ${user?.name}? They will need to use it the next time they sign in.`, confirmLabel: "Change password" }
        : null;

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-4xl px-5 py-9 sm:px-8 sm:py-12">
        <Link className="text-sm font-semibold text-[#245444] underline underline-offset-4" to="/users">Back to user list</Link>
        {error && <p className="mt-5 rounded-lg border border-[#e4b7aa] bg-[#fbefea] px-4 py-3 text-sm text-[#8b3c2a]" role="alert">{error}</p>}
        {message && <p className="mt-5 rounded-lg border border-[#cbd4cb] bg-[#eff2e9] px-4 py-3 text-sm text-[#245444]" role="status">{message}</p>}
        {loading ? <p className="py-12 text-sm text-[#63756d]" role="status">Loading account...</p> : user && <>
          <header className="mt-6 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#d8ddd5] bg-[#fbfbf8] p-5 sm:p-7">
            <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[#a75a3b]">User details</p><h1 className="mt-1 truncate font-display text-3xl font-semibold">{user.name}</h1><p className="mt-2 break-all text-sm text-[#63756d]">{user.email}</p></div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-[#e9eee4] text-[#245444]" : "bg-[#fbefea] text-[#8b3c2a]"}`}>{user.isActive ? "Active account" : "Inactive account"}</span>
          </header>

          <section className="mt-5 rounded-2xl border border-[#d8ddd5] bg-[#fbfbf8] p-5 sm:p-7" aria-label="Account details and settings">
            <dl className="grid gap-5 border-b border-[#e3e6df] pb-6 sm:grid-cols-2">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-[#63756d]">Role</dt><dd className="mt-1 text-sm font-semibold">{user.role.toUpperCase()}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-[#63756d]">Joined</dt><dd className="mt-1 text-sm">{new Date(user.createdAt).toLocaleString()}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-[#63756d]">Account ID</dt><dd className="mt-1 break-all font-mono text-xs text-[#63756d]">{user.id}</dd></div>
            </dl>

            <div className="grid items-stretch gap-4 py-6 sm:grid-cols-2">
              <div className="flex flex-col rounded-xl border border-[#e3e6df] bg-[#f8f9f5] p-4">
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="user-role">Change role</label>
                <select className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3 py-3 text-sm" id="user-role" value={roleDraft} onChange={(event) => setRoleDraft(event.target.value)}>{roles.map((role) => <option key={role} value={role}>{role.toUpperCase()}</option>)}</select>
                <p className="mt-2 text-xs text-[#63756d]">Choose a role, then save it.</p>
                <button className="mt-auto w-full rounded-lg bg-[#17392f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245444] disabled:cursor-not-allowed disabled:opacity-50" disabled={roleDraft === user.role} onClick={() => { setError(""); setMessage(""); setPendingAction({ type: "role", body: { role: roleDraft } }); }} type="button">Save role</button>
              </div>
              <div className="flex flex-col rounded-xl border border-[#e3e6df] bg-[#f8f9f5] p-4">
                <p className="text-sm font-semibold">Account status</p>
                <p className="mt-2 text-xs leading-5 text-[#63756d]">{user.isActive ? "This user can sign in and use the workspace." : "This account is inactive and cannot sign in."}</p>
                <button className="mt-auto w-full rounded-lg border border-[#cbd4cb] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-[#eff2e9]" onClick={() => setPendingAction({ type: "status", body: { isActive: !user.isActive } })} type="button">{user.isActive ? "Deactivate account" : "Activate account"}</button>
              </div>
            </div>

            <section className="border-t border-[#e3e6df] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Password</h2><p className="mt-1 text-sm text-[#63756d]">Set a new password for this account.</p></div><button className="rounded-lg border border-[#cbd4cb] px-4 py-2.5 text-sm font-semibold hover:bg-[#eff2e9]" onClick={() => { setPasswordOpen((open) => !open); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }} type="button">{passwordOpen ? "Cancel" : "Change password"}</button></div>
              {passwordOpen && <form className="mt-5 rounded-xl bg-[#f8f9f5] p-4" onSubmit={(event) => { event.preventDefault(); setPasswordError(""); if (newPassword !== confirmPassword) { setPasswordError("The passwords do not match."); return; } setPendingAction({ type: "password", password: newPassword }); }}>
                <p className="text-xs text-[#63756d]">Use at least 8 characters.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1.5 block text-sm font-medium" htmlFor="user-new-password">New password</label><input autoComplete="new-password" className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="user-new-password" minLength={8} maxLength={72} required type="password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setPasswordError(""); }} /></div>
                  <div><label className="mb-1.5 block text-sm font-medium" htmlFor="user-confirm-password">Confirm new password</label><input autoComplete="new-password" className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="user-confirm-password" minLength={8} maxLength={72} required type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setPasswordError(""); }} /></div>
                </div>
                {passwordError && <p className="mt-3 text-sm text-red-700" role="alert">{passwordError}</p>}
                <button className="mt-4 rounded-lg bg-[#17392f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245444]" type="submit">Save password</button>
              </form>}
            </section>
          </section>
        </>}
        {pendingAction && confirmation && <ConfirmDialog title={confirmation.title} message={confirmation.message} confirmLabel={confirmation.confirmLabel} danger={confirmation.danger ?? true} busy={saving} onCancel={() => setPendingAction(null)} onConfirm={confirmAction} />}
      </main>
    </WorkspaceLayout>
  );
}
