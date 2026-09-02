import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";

export default function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api
      .get("/dashboard/calendar")
      .then(({ data }) => setEvents(data.events || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Compliance calendar</h1>
        <p className="text-sm text-slate-500">Renewals and automated workflow checkpoints</p>
      </div>
      <GlassCard>
        <ul className="divide-y divide-white/10 text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{e.title}</p>
                <p className="text-xs capitalize text-slate-500">{e.type}</p>
              </div>
              <p className="text-xs text-slate-400">{e.date ? new Date(e.date).toLocaleDateString() : "—"}</p>
            </li>
          ))}
          {!events.length && <li className="py-6 text-center text-slate-500">No dated items — add policy expirations or workflows.</li>}
        </ul>
      </GlassCard>
    </div>
  );
}
