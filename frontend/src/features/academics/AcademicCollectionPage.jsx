import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { WorkspaceLayout } from "../../layouts/WorkspaceLayout.jsx";
import { useAuth } from "../auth/useAuth.js";
import { CommentsPanel } from "../comments/CommentsPanel.jsx";
import { ConfirmDialog } from "../../components/ConfirmDialog.jsx";
import { api } from "../../lib/api.js";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const resources = {
  routines: {
    title: "Class routine",
    description: "Weekly classes, rooms, instructors, and course resources.",
    fields: [
      { name: "courseTitle", label: "Course title", required: true },
      { name: "courseCode", label: "Course code (optional)" },
      { name: "teacher", label: "Teacher", required: true },
      { name: "day", label: "Day", type: "select", options: days, required: true },
      { name: "startTime", label: "Starts", type: "time", required: true },
      { name: "endTime", label: "Ends", type: "time", required: true },
      { name: "room", label: "Room", required: true },
      { name: "topic", label: "Topic or note", type: "textarea" },
      { name: "resourceUrl", label: "Resource URL (optional)", type: "url" },
    ],
    subtitle: (item) => [item.courseCode, item.day, `${item.startTime}–${item.endTime}`, item.room].filter(Boolean).join(" · "),
    detail: (item) => item.topic,
    link: (item) => item.resourceUrl,
    linkLabel: "Open class resource",
  },
  exams: {
    title: "Exam schedule",
    description: "Exam dates, rooms, topics, and study suggestions.",
    fields: [
      { name: "courseTitle", label: "Course title", required: true },
      { name: "courseCode", label: "Course code (optional)" },
      { name: "examType", label: "Exam type", type: "select", options: ["Quiz", "Midterm", "Final", "Presentation", "Other"], required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "startTime", label: "Starts", type: "time", required: true },
      { name: "room", label: "Room", required: true },
      { name: "topics", label: "Topics (one per line)", type: "textarea" },
      { name: "suggestion", label: "Study suggestions", type: "textarea" },
      { name: "resourceUrl", label: "Resource URL (optional)", type: "url" },
    ],
    subtitle: (item) => [item.courseCode, new Date(item.date).toLocaleDateString(), item.startTime, item.room].filter(Boolean).join(" · "),
    detail: (item) => [item.topics?.join(" · "), item.suggestion].filter(Boolean).join("\n"),
    link: (item) => item.resourceUrl,
    linkLabel: "Open exam resource",
  },
  notices: {
    title: "Notice board",
    description: "Published academic notices and class announcements.",
    fields: [
      { name: "title", label: "Notice title", required: true },
      { name: "category", label: "Category", type: "select", options: ["Academic", "Schedule", "Event", "General"], required: true },
      { name: "body", label: "Notice", type: "textarea", required: true },
    ],
    subtitle: (item) => `${item.category} · ${new Date(item.publishedAt).toLocaleDateString()}`,
    detail: (item) => item.body,
  },
};

function emptyValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, ""]));
}

function editValues(fields, item) {
  return Object.fromEntries(fields.map((field) => {
    const value = item[field.name];
    if (field.name === "topics") return [field.name, Array.isArray(value) ? value.join("\n") : ""];
    if (field.type === "date" && value) return [field.name, new Date(value).toISOString().slice(0, 10)];
    return [field.name, value ?? ""];
  }));
}

function submissionValues(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => {
    if (key === "topics") return [key, value.split(/[\n,]+/).map((topic) => topic.trim()).filter(Boolean)];
    return [key, value];
  }));
}

export function AcademicCollectionPage({ type, mode = "list" }) {
  const resource = resources[type];
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const canManage = user.role === "admin" || user.role === "cr";
  const formMode = mode === "create" || mode === "edit";
  const [items, setItems] = useState([]);
  const [values, setValues] = useState(() => emptyValues(resource.fields));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let active = true;
    api(`/${type}`)
      .then(({ items: records }) => {
        if (active) setItems(records);
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
  }, [type]);

  useEffect(() => {
    if (mode !== "edit" || loading) return;
    const item = items.find((record) => record._id === id);
    if (!item) {
      setError("This item could not be found.");
      return;
    }
    setEditingId(item._id);
    setValues(editValues(resource.fields, item));
  }, [id, items, loading, mode, resource.fields]);

  function resetForm() {
    setValues(emptyValues(resource.fields));
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    const path = editingId ? `/${type}/${editingId}` : `/${type}`;

    try {
      const { item } = await api(path, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(submissionValues(values)),
      });
      setItems((current) => editingId ? current.map((record) => record._id === item._id ? item : record) : [item, ...current]);
      setNotice(editingId ? "Update saved." : "Published successfully.");
      resetForm();
      navigate(`/${type}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item) {
    setError("");
    setNotice("");
    try {
      await api(`/${type}/${item._id}`, { method: "DELETE" });
      setItems((current) => current.filter((record) => record._id !== item._id));
      if (editingId === item._id) resetForm();
      setNotice("Item deleted.");
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError.message);
      setDeleteTarget(null);
    }
  }

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">Academic information</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">{resource.title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#63756d]">{resource.description}</p>
          </div>
          <span className="text-sm text-[#63756d]">{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>

        {canManage && formMode && (
          <form className="mt-8 border-y border-[#d8ddd5] py-6" onSubmit={handleSubmit}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{mode === "edit" ? "Edit item" : `Create ${type === "routines" ? "class" : type === "exams" ? "exam" : "notice"}`}</h2>
              <Link className="text-sm font-semibold text-[#245444] underline underline-offset-4" to={`/${type}`}>Back to {resource.title.toLowerCase()}</Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resource.fields.map((field) => (
                <div className={field.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""} key={field.name}>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor={`${type}-${field.name}`}>{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea className="min-h-24 w-full rounded-lg border border-[#cbd4cb] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id={`${type}-${field.name}`} name={field.name} required={field.required} maxLength={field.name === "body" ? 10000 : 2000} value={values[field.name]} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />
                  ) : field.type === "select" ? (
                    <select className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3 py-3 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id={`${type}-${field.name}`} name={field.name} required={field.required} value={values[field.name]} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}>
                      <option value="">Select {field.label.toLowerCase()}</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3 py-3 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id={`${type}-${field.name}`} name={field.name} type={field.type ?? "text"} required={field.required} maxLength={field.type === "url" ? 2048 : undefined} value={values[field.name]} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
            {notice && <p className="mt-4 text-sm text-[#245444]" role="status">{notice}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-lg bg-[#17392f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245444] focus:outline-none focus:ring-2 focus:ring-[#a75a3b] disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Publish"}</button>
              {mode === "edit" && <Link className="rounded-lg border border-[#cbd4cb] px-4 py-2.5 text-sm font-semibold hover:bg-[#eff2e9]" to={`/${type}`}>Cancel edit</Link>}
            </div>
          </form>
        )}

        {error && !canManage && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}
        {!formMode && (loading ? (
          <p className="py-10 text-sm text-[#63756d]" role="status">Loading {resource.title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p className="border-b border-[#d8ddd5] py-8 text-sm text-[#63756d]">No published items yet.</p>
        ) : type === "routines" || type === "exams" ? (
          <div className="mt-6 overflow-x-auto rounded-xl border border-[#d8ddd5] bg-[#fbfbf8]">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <caption className="sr-only">{resource.title} in table format</caption>
              <thead className="bg-[#e9eee4] text-xs uppercase tracking-wide text-[#354f45]">
                <tr><th className="px-4 py-3 font-semibold">Course</th><th className="px-4 py-3 font-semibold">{type === "routines" ? "Day & time" : "Exam date & time"}</th><th className="px-4 py-3 font-semibold">Room</th>{canManage && <th className="px-4 py-3 font-semibold">Actions</th>}</tr>
              </thead>
              {items.map((item) => (
                <tbody className="border-t border-[#d8ddd5]" key={item._id}>
                  <tr className="cursor-pointer align-middle hover:bg-[#f4f6f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#a75a3b]" onClick={() => navigate(`/${type}/${item._id}`)} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); navigate(`/${type}/${item._id}`); } }} tabIndex={0}>
                    <td className="px-4 py-4"><span className="font-semibold text-[#17392f]">{item.courseTitle}</span></td>
                    <td className="whitespace-nowrap px-4 py-4">{type === "routines" ? <><span>{item.day}</span><span className="mt-1 block text-xs text-[#63756d]">{item.startTime} - {item.endTime}</span></> : <><span>{new Date(item.date).toLocaleDateString()}</span><span className="mt-1 block text-xs text-[#63756d]">{item.startTime}</span></>}</td>
                    <td className="px-4 py-4">{item.room}</td>
                    {canManage && <td className="px-4 py-4"><div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}><Link aria-label={`Edit ${item.courseTitle}`} className="rounded-md border border-[#cbd4cb] px-2.5 py-1.5 text-xs font-semibold hover:bg-[#eff2e9]" to={`/${type}/edit/${item._id}`}>Edit</Link><button aria-label={`Delete ${item.courseTitle}`} className="rounded-md border border-[#d5a899] px-2.5 py-1.5 text-xs font-semibold text-[#8b3c2a] hover:bg-[#fbefea]" type="button" onClick={() => setDeleteTarget(item)}>Delete</button></div></td>}
                  </tr>
                </tbody>
              ))}
            </table>
          </div>
        ) : (
          <div className="divide-y divide-[#d8ddd5]">
            {items.map((item) => (
              <article className="py-6" key={item._id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="mt-1 text-xs font-medium text-[#849189]">{resource.subtitle(item)}</p>
                    {resource.detail(item) && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#354f45]">{resource.detail(item)}</p>}
                    {resource.link?.(item) && <a className="mt-3 inline-block text-sm font-semibold text-[#245444] underline underline-offset-4" href={resource.link(item)} target="_blank" rel="noreferrer">{resource.linkLabel}</a>}
                  </div>
                  {canManage && <div className="flex shrink-0 gap-2"><Link className="rounded-md border border-[#cbd4cb] px-3 py-2 text-xs font-semibold hover:bg-[#eff2e9]" to={`/${type}/edit/${item._id}`}>Edit</Link><button className="rounded-md border border-[#d5a899] px-3 py-2 text-xs font-semibold text-[#8b3c2a] hover:bg-[#fbefea]" type="button" onClick={() => setDeleteTarget(item)}>Delete</button></div>}
                </div>
                <CommentsPanel contentType="notice" contentId={item._id} />
              </article>
            ))}
          </div>
        ))}
        {deleteTarget && <ConfirmDialog title="Delete this item?" message={`“${deleteTarget.courseTitle ?? deleteTarget.title}” will be permanently deleted.`} confirmLabel="Delete" onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteItem(deleteTarget)} />}
      </main>
    </WorkspaceLayout>
  );
}

export function AcademicDetailPage({ type }) {
  const resource = resources[type];
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canManage = user.role === "admin" || user.role === "cr";

  useEffect(() => {
    let active = true;
    api(`/${type}/${id}`)
      .then(({ item: record }) => { if (active) setItem(record); })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, type]);

  async function deleteItem() {
    setDeleting(true);
    setError("");
    try {
      await api(`/${type}/${item._id}`, { method: "DELETE" });
      navigate(`/${type}`, { replace: true });
    } catch (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-4xl px-5 py-9 sm:px-8 sm:py-12">
        <Link className="text-sm font-semibold text-[#245444] underline underline-offset-4" to={`/${type}`}>Back to {resource.title.toLowerCase()}</Link>
        {loading ? <p className="py-12 text-sm text-[#63756d]" role="status">Loading details...</p> : error && !item ? <p className="mt-6 text-sm text-red-700" role="alert">{error}</p> : item && <>
          <header className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#d8ddd5] pb-6">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a75a3b]">{resource.title}</p><h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{item.courseTitle}</h1><p className="mt-2 text-sm text-[#63756d]">{resource.subtitle(item)}</p></div>
            {canManage && <div className="flex gap-2"><Link className="rounded-lg border border-[#cbd4cb] px-3 py-2 text-sm font-semibold hover:bg-[#eff2e9]" to={`/${type}/edit/${item._id}`}>Edit</Link><button className="rounded-lg border border-[#d5a899] px-3 py-2 text-sm font-semibold text-[#8b3c2a] hover:bg-[#fbefea] disabled:opacity-60" disabled={deleting} onClick={() => setConfirmDelete(true)} type="button">Delete</button></div>}
          </header>

          <section className="mt-6 rounded-2xl border border-[#d8ddd5] bg-[#fbfbf8] p-5 sm:p-7" aria-label="Full details">
            <h2 className="text-lg font-semibold">Full details</h2>
            <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {resource.fields.filter((field) => field.name !== "courseTitle").map((field) => {
                const rawValue = item[field.name];
                if (rawValue === undefined || rawValue === null || rawValue === "" || (Array.isArray(rawValue) && rawValue.length === 0)) return null;
                const value = Array.isArray(rawValue) ? rawValue.join("\n") : rawValue;
                return <div className={field.type === "textarea" ? "sm:col-span-2" : ""} key={field.name}><dt className="text-xs font-semibold uppercase tracking-wide text-[#63756d]">{field.label}</dt><dd className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-[#17392f]">{field.type === "url" ? <a className="font-semibold text-[#245444] underline underline-offset-4" href={value} target="_blank" rel="noreferrer">{value}</a> : field.type === "date" ? new Date(value).toLocaleDateString() : value}</dd></div>;
              })}
            </dl>
          </section>

          {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
          <section className="mt-8" aria-label="Comments"><h2 className="font-display text-2xl font-semibold">Comments</h2><CommentsPanel key={item._id} contentType={type === "routines" ? "routine" : "exam"} contentId={item._id} initiallyOpen /></section>
        </>}
        {confirmDelete && item && <ConfirmDialog title="Delete this item?" message={`“${item.courseTitle}” will be permanently deleted.`} confirmLabel="Delete" busy={deleting} onCancel={() => setConfirmDelete(false)} onConfirm={deleteItem} />}
      </main>
    </WorkspaceLayout>
  );
}
