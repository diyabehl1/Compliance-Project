import { useState } from "react";
import toast from "react-hot-toast";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";

export default function GapAnalyzer() {
  const [answers, setAnswers] = useState({
    collectsCustomerData: true,
    processesPayments: false,
    remoteWork: true,
    usesCloud: true,
    healthData: false,
  });
  const [result, setResult] = useState(null);

  async function run() {
    try {
      const { data } = await api.post("/compliance/gap-analyzer", answers);
      setResult(data);
      toast.success("Roadmap generated");
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">AI compliance gap analyzer</h1>
        <p className="text-sm text-slate-500">Business context → applicable frameworks, missing policies, risk score, roadmap</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          {[
            ["collectsCustomerData", "Do you collect customer data?"],
            ["processesPayments", "Do you process payments?"],
            ["remoteWork", "Do employees work remotely?"],
            ["usesCloud", "Do you use cloud infrastructure?"],
            ["healthData", "Do you process health data?"],
          ].map(([key, label]) => (
            <label key={key} className="mb-3 flex items-center justify-between gap-3 text-sm">
              <span>{label}</span>
              <input type="checkbox" checked={answers[key]} onChange={(e) => setAnswers({ ...answers, [key]: e.target.checked })} />
            </label>
          ))}
          <button type="button" onClick={run} className="mt-4 w-full rounded-xl bg-nova-600 py-2 text-sm font-semibold text-white">
            Analyze & build roadmap
          </button>
        </GlassCard>
        <GlassCard>
          {!result ? (
            <p className="text-sm text-slate-500">Results will appear here.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Applicable standards</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {result.applicableStandards.map((s) => (
                    <span key={s} className="rounded-full bg-nova-600/15 px-2 py-0.5 text-xs font-semibold text-nova-800 dark:text-nova-100">
                      {s.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Risk score</p>
                <p className="font-display text-3xl font-bold">{result.riskScore}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Suggested policies</p>
                <ul className="mt-1 list-disc pl-5 text-slate-600 dark:text-slate-300">
                  {result.suggestedPolicies.map((p) => (
                    <li key={p}>{p.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Roadmap</p>
                <ul className="mt-2 space-y-2">
                  {result.roadmap.map((ph) => (
                    <li key={ph.phase} className="glass-inner rounded-lg p-2 text-xs">
                      <p className="font-semibold">{ph.phase}</p>
                      <ul className="mt-1 list-disc pl-4 text-slate-500">
                        {ph.tasks.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
