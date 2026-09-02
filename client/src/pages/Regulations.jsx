import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Regulations() {
  const { isManager } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", summary: "", severity: "medium" });

  async function load() {
    const { data } = await api.get("/regulations");
    setItems(data.updates || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function create(e) {
    e.preventDefault();
    try {
      await api.post("/regulations", form);
      toast.success("Published & notified org");
      setForm({ title: "", summary: "", severity: "medium" });
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Regulation update center</h1>
        <p className="text-sm text-slate-500">News, alerts, and dashboard + email fan-out (SMTP)</p>
      </div>
      {isManager && (
        <GlassCard>
          <h2 className="font-semibold">Post internal bulletin</h2>
          <form className="mt-3 grid gap-2 sm:grid-cols-2" onSubmit={create}>
            <input
              className="rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <select
              className="rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
            >
              <option value="info">Info</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <textarea
              className="sm:col-span-2 rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              rows={3}
              placeholder="Summary"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
            <button type="submit" className="sm:col-span-2 rounded-xl bg-nova-600 py-2 text-sm font-semibold text-white">
              Broadcast
            </button>
          </form>
        </GlassCard>
      )}
      <div className="grid gap-3">
        {items.map((u, i) => (
          <GlassCard key={u._id} delay={i * 0.02}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">{u.title}</h3>
              <span className="rounded-full bg-white/40 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-white/10 dark:text-slate-200">
                {u.severity}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{u.summary}</p>
            <p className="mt-2 text-xs text-slate-400">{new Date(u.publishedAt || u.createdAt).toLocaleString()}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
