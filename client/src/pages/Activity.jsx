import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";

export default function Activity() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api
      .get("/activity")
      .then(({ data }) => setLogs(data.logs || []))
      .catch((e) => toast.error(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Audit trail</h1>
        <p className="text-sm text-slate-500">Immutable-style activity stream for governance</p>
      </div>
      <GlassCard>
        <ul className="space-y-2 text-sm">
          {logs.map((l) => (
            <li key={l._id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 py-2">
              <span className="font-medium text-slate-800 dark:text-slate-100">{l.action}</span>
              <span className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleString()}</span>
              <span className="w-full text-xs text-slate-400">
                {l.user?.name} · {l.entity} {l.entityId ? `· ${l.entityId}` : ""}
              </span>
            </li>
          ))}
          {!logs.length && <li className="text-slate-500">No entries yet.</li>}
        </ul>
      </GlassCard>
    </div>
  );
}
