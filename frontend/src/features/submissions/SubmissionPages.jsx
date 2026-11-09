import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { useAuth } from "../auth/useAuth.js";
import { CommentsPanel } from "../comments/CommentsPanel.jsx";
import { ConfirmDialog } from "../../components/ConfirmDialog.jsx";
import { api } from "../../lib/api.js";

const submissionTypes = ["event", "news", "suggestion"];

function StatusLabel({ status }) {
  const styles = {
    pending: "bg-[#f5edcf] text-[#775d17]",
    approved: "bg-[#dcebdd] text-[#285b3b]",
    rejected: "bg-[#f6e1d9] text-[#8b3c2a]",
  };
  const label = status === "approved" ? "Published" : status[0].toUpperCase() + status.slice(1);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{label}</span>;
}

function SubmissionCard({ item, actions, withComments = false, showContributor = false }) {
  return (
    <article className="border-b border-[#d8ddd5] py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <StatusLabel status={item.status} />
            <span className="text-xs uppercase tracking-[0.12em] text-[#849189]">{item.type}</span>
          </div>
          {showContributor && <p className="mt-1 text-sm text-[#63756d]">Contributor: {item.submittedBy?.name ?? "Unknown contributor"}</p>}
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#354f45]">{item.description}</p>
          {(item.eventDate || item.location) && <p className="mt-3 text-xs text-[#63756d]">{[item.eventDate && new Date(item.eventDate).toLocaleString(), item.location].filter(Boolean).join(" · ")}</p>}
          {item.resourceUrl && <a className="mt-3 inline-block text-sm font-semibold text-[#245444] underline underline-offset-4" href={item.resourceUrl} target="_blank" rel="noreferrer">Open resource</a>}
          {item.status === "rejected" && item.reviewNote && <p className="mt-4 border-l-2 border-[#d46a4c] pl-3 text-sm text-[#8b3c2a]">Review note: {item.reviewNote}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      {withComments && <CommentsPanel contentType="submission" contentId={item._id} />}
    </article>
  );
}

function CollectionState({ loading, error, empty, children }) {
  if (loading) return <p className="py-10 text-sm text-[#63756d]" role="status">Loading...</p>;
  if (error) return <p className="py-6 text-sm text-red-700" role="alert">{error}</p>;
  if (empty) return <p className="border-y border-[#d8ddd5] py-8 text-sm text-[#63756d]">{empty}</p>;
  return children;
}

export function EventsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/submissions/published")
      .then(({ items: published }) => {
        if (active) setItems(published);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Class community</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Events, news & suggestions</h1>
        <p className="mt-2 text-sm text-[#63756d]">Only approved posts appear here.</p>
        <div className="mt-6">
          <CollectionState loading={loading} error={error} empty={items.length === 0 && !loading && !error ? "Nothing has been published yet." : ""}>
            {items.map((item) => <SubmissionCard key={item._id} item={item} withComments showContributor />)}
          </CollectionState>
        </div>
      </main>
    </WorkspaceLayout>
  );
}

export function SubmissionFormPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [values, setValues] = useState({ title: "", type: "event", description: "", eventDate: "", location: "", resourceUrl: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(Boolean(editId));
  const [saving, setSaving] = useState(false);
  const canPublish = user.role === "admin" || user.role === "cr";

  useEffect(() => {
    if (!editId) return undefined;
    let active = true;
    api("/submissions/mine")
      .then(({ items }) => {
        const item = items.find((record) => record._id === editId);
        if (!item) throw new Error("This contribution is no longer available to edit.");
        if (active) setValues({ title: item.title, type: item.type, description: item.description, eventDate: item.eventDate ? new Date(item.eventDate).toISOString().slice(0, 16) : "", location: item.location ?? "", resourceUrl: item.resourceUrl ?? "" });
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editId]);

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { item } = await api(editId ? `/submissions/${editId}` : "/submissions", {
        method: editId ? "PATCH" : "POST",
        body: JSON.stringify({ ...values, eventDate: values.eventDate ? new Date(values.eventDate).toISOString() : "" }),
      });
      setMessage(item.status === "approved" ? "Published successfully." : "Sent for review. You can track its status in My items.");
      if (!editId) setValues({ title: "", type: "event", description: "", eventDate: "", location: "", resourceUrl: "" });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-3xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">{canPublish ? "Publish to class" : "Student contribution"}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">{editId ? "Edit pending submission" : "Share an update"}</h1>
        <p className="mt-2 text-sm leading-6 text-[#63756d]">{canPublish ? "Posts by Admin and CR are published immediately." : "Student posts are reviewed before they appear in the class feed."}</p>
        {loading ? <p className="mt-8 text-sm text-[#63756d]" role="status">Loading submission...</p> : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="submission-title">Title</label>
              <input className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id="submission-title" name="title" minLength={3} maxLength={160} required value={values.title} onChange={updateField} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="submission-type">Type</label>
                <select className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="submission-type" name="type" required value={values.type} onChange={updateField}>{submissionTypes.map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}</select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="submission-date">Event date and time <span className="font-normal text-[#849189]">(optional)</span></label>
                <input className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="submission-date" name="eventDate" type="datetime-local" value={values.eventDate} onChange={updateField} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="submission-description">Description</label>
              <textarea className="min-h-36 w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id="submission-description" name="description" maxLength={10000} required value={values.description} onChange={updateField} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="submission-location">Location <span className="font-normal text-[#849189]">(optional)</span></label>
                <input className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="submission-location" name="location" maxLength={160} value={values.location} onChange={updateField} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="submission-resource">Resource URL <span className="font-normal text-[#849189]">(optional)</span></label>
                <input className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm" id="submission-resource" name="resourceUrl" type="url" maxLength={2048} value={values.resourceUrl} onChange={updateField} />
              </div>
            </div>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            {message && <p className="text-sm text-[#245444]" role="status">{message}</p>}
            <button className="rounded-lg bg-[#17392f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245444] focus:outline-none focus:ring-2 focus:ring-[#a75a3b] disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving..." : editId ? "Save changes" : canPublish ? "Publish" : "Submit for review"}</button>
          </form>
        )}
      </main>
    </WorkspaceLayout>
  );
}

export function MySubmissionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const result = await api("/submissions/mine");
      setItems(result.items);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  async function withdraw(item) {
    try {
      await api(`/submissions/${item._id}`, { method: "DELETE" });
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      setWithdrawTarget(null);
    } catch (withdrawError) {
      setError(withdrawError.message);
      setWithdrawTarget(null);
    }
  }

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Your contributions</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">My submissions</h1>
        <div className="mt-5">
          <CollectionState loading={loading} error={error} empty={items.length === 0 && !loading && !error ? "You haven’t submitted anything yet." : ""}>
            {items.map((item) => <SubmissionCard key={item._id} item={item} actions={<><Link className="rounded-md border border-[#cbd4cb] px-3 py-2 text-xs font-semibold hover:bg-[#eff2e9]" to={`/contribute?edit=${item._id}`}>Edit</Link>{item.status === "pending" && <button className="rounded-md border border-[#d5a899] px-3 py-2 text-xs font-semibold text-[#8b3c2a] hover:bg-[#fbefea]" type="button" onClick={() => setWithdrawTarget(item)}>Withdraw</button>}</>} />)}
          </CollectionState>
        </div>
        {withdrawTarget && <ConfirmDialog title="Withdraw this contribution?" message={`“${withdrawTarget.title}” will be removed from your pending submissions.`} confirmLabel="Withdraw" onCancel={() => setWithdrawTarget(null)} onConfirm={() => withdraw(withdrawTarget)} />}
      </main>
    </WorkspaceLayout>
  );
}

export function ReviewQueuePage() {
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api("/submissions/pending")
      .then(({ items: pending }) => { if (active) setItems(pending); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function review(item, decision) {
    setError("");
    try {
      await api(`/submissions/${item._id}/review`, { method: "PATCH", body: JSON.stringify({ decision, reviewNote: notes[item._id] ?? "" }) });
      setItems((current) => current.filter((entry) => entry._id !== item._id));
    } catch (reviewError) {
      setError(reviewError.message);
    }
  }

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Moderation</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Review queue</h1>
        <p className="mt-2 text-sm text-[#63756d]">Approving a post makes it visible in the class feed.</p>
        <CollectionState loading={loading} error={error} empty={items.length === 0 && !loading && !error ? "The review queue is clear." : ""}>
          {items.map((item) => (
            <article className="border-b border-[#d8ddd5] py-6" key={item._id}>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <span className="text-xs uppercase tracking-[0.12em] text-[#849189]">{item.type}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#354f45]">{item.description}</p>
              {(item.eventDate || item.location) && <p className="mt-3 text-xs text-[#63756d]">{[item.eventDate && new Date(item.eventDate).toLocaleString(), item.location].filter(Boolean).join(" · ")}</p>}
              <label className="mb-2 mt-5 block text-sm font-medium" htmlFor={`review-note-${item._id}`}>Review note <span className="font-normal text-[#849189]">(optional)</span></label>
              <textarea className="min-h-20 w-full max-w-2xl rounded-lg border border-[#cbd4cb] bg-white p-3 text-sm" id={`review-note-${item._id}`} maxLength={500} value={notes[item._id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [item._id]: event.target.value }))} />
              <div className="mt-3 flex gap-2">
                <button className="rounded-lg bg-[#245444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17392f]" type="button" onClick={() => review(item, "approved")}>Approve</button>
                <button className="rounded-lg border border-[#d5a899] px-4 py-2 text-sm font-semibold text-[#8b3c2a] hover:bg-[#fbefea]" type="button" onClick={() => review(item, "rejected")}>Reject</button>
              </div>
            </article>
          ))}
        </CollectionState>
      </main>
    </WorkspaceLayout>
  );
}
