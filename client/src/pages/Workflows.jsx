import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Workflows() {
  const { isManager } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "Employee onboarding compliance",
    kind: "onboarding",
    description: "Provision access, policies, training",
    steps: [
      { title: "Issue accounts", assigneeRole: "admin", dueInDays: 1 },
      { title: "Assign policy reads", assigneeRole: "compliance_manager", dueInDays: 3 },
      { title: "Collect acknowledgments", assigneeRole: "employee", dueInDays: 7 },
    ],
  });

  async function load() {
    const { data } = await api.get("/workflows");
    setItems(data.workflows || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function create() {
    try {
      await api.post("/workflows", form);
      toast.success("Workflow created");
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function completeStep(id, idx) {
    try {
      await api.post(`/workflows/${id}/run-step`, { stepIndex: idx });
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Workflow automation</h1>
        <p className="text-sm text-slate-500">Onboarding, approvals, renewals, audit reminders, acknowledgment tracking</p>
      </div>
      {isManager && (
        <GlassCard>
          <h2 className="font-semibold">Create playbook</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
            >
              {["onboarding", "approval", "renewal", "audit_reminder", "ack_tracking", "custom"].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <textarea
              className="sm:col-span-2 rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="button" className="mt-3 rounded-xl bg-nova-600 px-4 py-2 text-sm font-semibold text-white" onClick={create}>
            Save workflow
          </button>
        </GlassCard>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((w) => (
          <GlassCard key={w._id}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{w.name}</h3>
              <span className="text-[10px] uppercase text-slate-400">{w.kind}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{w.description}</p>
            <ol className="mt-3 space-y-2 text-xs">
              {(w.steps || []).map((s, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 glass-inner rounded-lg px-2 py-1">
                  <span className={s.completed ? "line-through opacity-60" : ""}>
                    {idx + 1}. {s.title}
                  </span>
                  {!s.completed && (
                    <button type="button" className="text-nova-600 hover:underline" onClick={() => completeStep(w._id, idx)}>
                      Complete
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
