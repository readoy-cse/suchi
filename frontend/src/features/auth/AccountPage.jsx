import { useState } from "react";
import { Link } from "react-router-dom";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { useAuth } from "./useAuth.js";

export function AccountPage() {
  const { user, updateAccount } = useAuth();
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const details = { currentPassword };
      if (name.trim() !== user.name) details.name = name.trim();
      if (newPassword) details.newPassword = newPassword;
      if (Object.keys(details).length === 1) throw new Error("Change your name or enter a new password.");
      await updateAccount(details);
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Account updated successfully.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-3xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Your account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Account settings</h1>
        <p className="mt-2 text-sm text-[#63756d]">Update your profile name or change your password.</p>

        <form className="mt-8 space-y-5 rounded-2xl border border-[#d8ddd5] bg-[#fbfbf8] p-5 sm:p-7" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="account-email">Email address</label>
            <input className="w-full rounded-lg border border-[#d8ddd5] bg-[#f4f4ef] px-3.5 py-3 text-sm text-[#63756d]" id="account-email" readOnly value={user.email} />
            <p className="mt-1 text-xs text-[#63756d]">Email address cannot be changed here.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="account-name">Display name</label>
            <input autoComplete="name" className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="account-name" maxLength={80} minLength={2} required value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="border-t border-[#e3e6df] pt-5">
            <h2 className="text-base font-semibold">Change password</h2>
            <label className="mb-1.5 mt-4 block text-sm font-semibold" htmlFor="account-new-password">New password</label>
            <input autoComplete="new-password" className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="account-new-password" minLength={8} maxLength={72} placeholder="Leave blank to keep your current password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            <p className="mt-1 text-xs text-[#63756d]">Use at least 8 characters.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="account-current-password">Current password <span className="font-normal text-[#63756d]">(required to save)</span></label>
            <input autoComplete="current-password" className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="account-current-password" maxLength={72} required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </div>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          {message && <p className="text-sm text-[#245444]" role="status">{message}</p>}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button className="rounded-lg bg-[#17392f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#245444] disabled:opacity-60" disabled={saving} type="submit">{saving ? "Saving..." : "Save changes"}</button>
            <Link className="rounded-lg px-4 py-3 text-sm font-semibold text-[#354f45] hover:bg-[#eff2e9]" to="/">Cancel</Link>
          </div>
        </form>
      </main>
    </WorkspaceLayout>
  );
}
