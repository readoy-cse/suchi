import { useEffect, useState } from "react";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { api } from "../../lib/api.js";

const roles = ["student", "cr", "admin"];

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordUpdatedUserId, setPasswordUpdatedUserId] = useState(null);

  useEffect(() => {
    let active = true;
    api("/users")
      .then(({ users: results }) => {
        if (active) setUsers(results);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function updateUser(userId, path, body) {
    setError("");
    try {
      const { user } = await api(`/users/${userId}/${path}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setUsers((current) => current.map((item) => item.id === userId ? user : item));
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function updatePassword(event, userId) {
    event.preventDefault();
    setError("");
    setPasswordMessage("");
    try {
      await api(`/users/${userId}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      });
      setPasswordMessage("Password updated.");
      setPasswordUpdatedUserId(userId);
      setNewPassword("");
      setPasswordUserId(null);
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Administration</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">User management</h1>
        <p className="mt-3 text-sm leading-6 text-[#63756d]">Assign account roles and manage access. Public registration always creates student accounts.</p>

        {error && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}
        {loading ? (
          <p className="mt-8 text-sm text-[#63756d]" role="status">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="mt-8 border-y border-[#d8ddd5] py-6 text-sm text-[#63756d]">No user accounts yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto border-y border-[#d8ddd5]">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-[#d8ddd5] text-xs uppercase tracking-[0.12em] text-[#849189]">
                <tr><th className="py-3 pr-4 font-medium">Account</th><th className="py-3 pr-4 font-medium">Role</th><th className="py-3 pr-4 font-medium">Status</th><th className="py-3 font-medium">Account actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#e3e6df]">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 pr-4"><p className="font-medium">{user.name}</p><p className="mt-1 text-xs text-[#849189]">{user.email}</p></td>
                    <td className="py-4 pr-4">
                      <label className="sr-only" htmlFor={`role-${user.id}`}>Role for {user.name}</label>
                      <select className="rounded-md border border-[#cbd4cb] bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#45835e]" id={`role-${user.id}`} value={user.role} onChange={(event) => updateUser(user.id, "role", { role: event.target.value })}>
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="py-4 pr-4">{user.isActive ? "Active" : "Inactive"}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap items-start gap-2">
                        <button className="rounded-md border border-[#cbd4cb] px-3 py-2 text-xs font-semibold hover:bg-[#eff2e9] focus:outline-none focus:ring-2 focus:ring-[#a75a3b]" type="button" onClick={() => updateUser(user.id, "status", { isActive: !user.isActive })}>
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button className="rounded-md border border-[#cbd4cb] px-3 py-2 text-xs font-semibold hover:bg-[#eff2e9] focus:outline-none focus:ring-2 focus:ring-[#a75a3b]" type="button" onClick={() => { setPasswordUserId((current) => current === user.id ? null : user.id); setNewPassword(""); setPasswordMessage(""); setPasswordUpdatedUserId(null); }}>
                          Change password
                        </button>
                      </div>
                      {passwordUserId === user.id && <form className="mt-3 flex max-w-sm flex-wrap items-end gap-2" onSubmit={(event) => updatePassword(event, user.id)}>
                        <div className="min-w-48 flex-1"><label className="mb-1 block text-xs font-medium" htmlFor={`new-password-${user.id}`}>New password</label><input autoComplete="new-password" className="w-full rounded-md border border-[#cbd4cb] bg-white px-3 py-2 text-sm" id={`new-password-${user.id}`} minLength={8} maxLength={72} required type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div>
                        <button className="rounded-md bg-[#17392f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#245444]" type="submit">Save password</button>
                      </form>}
                      {passwordMessage && passwordUpdatedUserId === user.id && <p className="mt-2 text-xs text-[#245444]" role="status">{passwordMessage}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </WorkspaceLayout>
  );
}
