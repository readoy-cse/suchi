import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth.js";
import { api } from "../../lib/api.js";

export function CommentsPanel({ contentType, contentId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return undefined;
    let active = true;
    setLoading(true);
    api(`/content/${contentType}/${contentId}/comments`)
      .then(({ comments: result }) => {
        if (active) {
          setComments(result);
          setLoaded(true);
        }
      })
      .catch((loadError) => { if (active) setError(loadError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, loaded, contentType, contentId]);

  async function addComment(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { comment } = await api(`/content/${contentType}/${contentId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setComments((current) => [...current, comment]);
      setBody("");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(comment) {
    setError("");
    try {
      await api(`/comments/${comment.id}`, { method: "DELETE" });
      setComments((current) => current.filter((entry) => entry.id !== comment.id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="mt-5 border-t border-[#e3e6df] pt-4" aria-label="Comments">
      <button className="text-sm font-semibold text-[#245444] hover:text-[#a75a3b] focus:outline-none focus:underline" type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        {open ? "Hide comments" : `Comments${loaded ? ` (${comments.length})` : ""}`}
      </button>
      {open && (
        <div className="mt-4 max-w-3xl">
          {loading ? <p className="text-sm text-[#63756d]" role="status">Loading comments...</p> : comments.length === 0 ? <p className="text-sm text-[#63756d]">No comments yet.</p> : (
            <ul className="divide-y divide-[#e3e6df]">
              {comments.map((comment) => {
                const canDelete = user.id === comment.author.id || ["admin", "cr"].includes(user.role);
                return (
                  <li className="flex items-start justify-between gap-4 py-3" key={comment.id}>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#354f45]">{comment.author.name}<span className="ml-2 font-normal text-[#849189]">{new Date(comment.createdAt).toLocaleString()}</span></p>
                      <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-[#354f45]">{comment.body}</p>
                    </div>
                    {canDelete && <button className="shrink-0 text-xs font-semibold text-[#8b3c2a] underline underline-offset-2" type="button" onClick={() => deleteComment(comment)}>Delete</button>}
                  </li>
                );
              })}
            </ul>
          )}
          <form className="mt-4" onSubmit={addComment}>
            <label className="mb-1.5 block text-sm font-medium" htmlFor={`comment-${contentType}-${contentId}`}>Add a comment</label>
            <textarea className="min-h-20 w-full rounded-lg border border-[#cbd4cb] bg-white p-3 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id={`comment-${contentType}-${contentId}`} maxLength={2000} required value={body} onChange={(event) => setBody(event.target.value)} />
            {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
            <button className="mt-2 rounded-lg border border-[#cbd4cb] px-3 py-2 text-sm font-semibold hover:bg-[#eff2e9] disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? "Posting..." : "Post comment"}</button>
          </form>
        </div>
      )}
    </section>
  );
}