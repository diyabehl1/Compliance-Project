import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import GlassCard from "../components/ui/GlassCard.jsx";
import PolicyEditor from "../components/PolicyEditor.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function PolicyEditorPage() {
  const { id } = useParams();
  const { isManager } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [versions, setVersions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [missing, setMissing] = useState([]);
  const dirty = useRef(false);

  const load = useCallback(async () => {
    const { data } = await api.get(`/policies/${id}`);
    setPolicy(data.policy);
    setTitle(data.policy.title);
    setContent(data.policy.content || { type: "doc", content: [] });
    setComments(data.policy.comments || []);
    setVersions(data.policy.versions || []);
    dirty.current = false;
  }, [id]);

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, [load]);

  async function savePatch(partial) {
    try {
      const { data } = await api.patch(`/policies/${id}`, partial);
      setPolicy(data.policy);
      dirty.current = false;
      toast.success("Saved", { id: "autosave" });
    } catch (e) {
      toast.error(e.message);
    }
  }

  useEffect(() => {
    if (!content || !dirty.current) return;
    const t = setTimeout(() => savePatch({ content, title }), 1800);
    return () => clearTimeout(t);
  }, [content, title]);

  async function snapshot() {
    const label = prompt("Version label", `v${(versions?.length || 0) + 1}`);
    if (!label) return;
    try {
      const { data } = await api.post(`/policies/${id}/snapshot`, { label });
      setVersions(data.policy.versions || []);
      toast.success("Version saved");
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function restoreVersion(vid) {
    try {
      const { data } = await api.post(`/policies/${id}/restore/${vid}`);
      setContent(data.policy.content);
      setPolicy(data.policy);
      setVersions(data.policy.versions || []);
      toast.success("Restored");
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function addComment() {
    const body = prompt("Comment");
    if (!body) return;
    try {
      const { data } = await api.post(`/policies/${id}/comment`, { body });
      setComments(data.policy.comments || []);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function loadAi() {
    try {
      const [s, m] = await Promise.all([
        api.get(`/policies/${id}/clause-suggestions`),
        api.post("/ai/missing-clauses", { content, standard: policy?.complianceStandards?.[0] || "GDPR" }),
      ]);
      setSuggestions(s.data.suggestions || []);
      setMissing(m.data.missing || []);
    } catch {
      /* ignore */
    }
  }

  if (!policy || !content) return <div className="p-8 text-sm text-slate-500">Loading editor…</div>;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/app" className="text-xs font-semibold text-nova-600 hover:underline dark:text-nova-300">
              ← Back
            </Link>
            <input
              className="mt-2 w-full max-w-xl rounded-xl border border-white/30 bg-white/50 px-3 py-2 font-display text-2xl font-bold outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={title}
              onChange={(e) => {
                dirty.current = true;
                setTitle(e.target.value);
              }}
            />
            <p className="mt-1 text-xs text-slate-500">
              Auto-save · Collaborative sessions: wire WebSockets/Yjs for live co-editing
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={snapshot} className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
              Save version
            </button>
            <button type="button" onClick={loadAi} className="rounded-xl bg-nova-600 px-3 py-2 text-xs font-semibold text-white">
              Refresh AI insights
            </button>
          </div>
        </div>
        <PolicyEditor
          key={id}
          value={content}
          onChange={(c) => {
            dirty.current = true;
            setContent(c);
          }}
        />
      </div>
      <div className="space-y-4">
        <GlassCard>
          <h3 className="font-display font-semibold">Inline AI</h3>
          <p className="mt-1 text-xs text-slate-500">Clause recommendations & missing language</p>
          <button type="button" className="mt-3 w-full rounded-lg bg-white/40 py-2 text-xs font-semibold dark:bg-white/5" onClick={loadAi}>
            Analyze document
          </button>
          <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {suggestions.map((s) => (
              <li key={s} className="glass-inner rounded-lg p-2">
                {s}
              </li>
            ))}
            {!suggestions.length && <li className="text-slate-400">No suggestions yet.</li>}
          </ul>
          {missing.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-900 dark:text-amber-100">
              <p className="font-semibold">Missing clauses</p>
              <ul className="mt-1 list-disc pl-4">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>
        <GlassCard>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Comments</h3>
            <button type="button" className="text-xs text-nova-600 hover:underline" onClick={addComment}>
              Add
            </button>
          </div>
          <ul className="mt-2 max-h-48 space-y-2 overflow-auto text-xs">
            {comments.map((c) => (
              <li key={c._id} className="glass-inner rounded-lg p-2 text-slate-600 dark:text-slate-300">
                {c.body}
              </li>
            ))}
            {!comments.length && <li className="text-slate-400">No comments</li>}
          </ul>
        </GlassCard>
        <GlassCard>
          <h3 className="font-display font-semibold">Version history</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {versions.map((v) => (
              <li key={v._id} className="flex items-center justify-between gap-2 glass-inner rounded-lg px-2 py-1">
                <span>
                  {v.label}{" "}
                  <span className="text-slate-400">{v.createdAt ? new Date(v.createdAt).toLocaleString() : ""}</span>
                </span>
                {isManager && (
                  <button type="button" className="text-nova-600 hover:underline" onClick={() => restoreVersion(v._id)}>
                    Rollback
                  </button>
                )}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
