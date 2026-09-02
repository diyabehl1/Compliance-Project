import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import GlassCard from "../components/ui/GlassCard.jsx";
import PolicyScorePanel, { ScoreRing } from "../components/PolicyScorePanel.jsx";
import api from "../lib/api.js";

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [latestUpload, setLatestUpload] = useState(null);

  async function load() {
    const [h, p, pr] = await Promise.all([
      api.get("/dashboard/health"),
      api.get("/policies"),
      api.get("/compliance/score-prediction"),
    ]);
    setHealth(h.data);
    setPolicies(p.data.policies || []);
    setPrediction(pr.data);
    const uploads = h.data.uploadedPolicyScores || [];
    if (uploads[0] && !latestUpload) setLatestUpload(uploads[0]);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function onQuickUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("standards", JSON.stringify(["GDPR", "ISO_27001"]));
    try {
      const { data } = await api.post("/uploads/audit", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setLatestUpload(data.report);
      toast.success(`Scored ${data.report.complianceScore}% — see breakdown below`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadBusy(false);
      e.target.value = "";
    }
  }

  const trend = (health?.recentAuditScores || []).map((x, i) => ({
    name: x.fileName?.slice(0, 12) || `R${i + 1}`,
    score: x.score || 0,
  }));

  const uploads = health?.uploadedPolicyScores || [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-graphite-900 dark:text-zinc-50">
            Compliance Health
          </h1>
          <p className="text-sm text-graphite-500 dark:text-zinc-400">Upload policies for instant scoring & posture analytics</p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/generator" className="btn-primary">
            One-click AI policy
          </Link>
          <Link to="/app/auditor" className="btn-secondary">
            Full auditor
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" delay={0.05}>
          <h2 className="font-display text-lg font-semibold text-graphite-900 dark:text-zinc-50">Upload policy for score</h2>
          <p className="mt-1 text-xs text-graphite-500">PDF · DOCX · TXT — detects correct clauses and mistakes</p>
          <label
            className={`mt-4 flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-5 py-6 transition ${
              uploadBusy
                ? "border-accent-400/50 bg-accent-500/5"
                : "border-zinc-300 hover:border-accent-500/40 dark:border-zinc-600 dark:hover:border-accent-500/30"
            }`}
          >
            <UploadCloud className={`h-8 w-8 shrink-0 ${uploadBusy ? "animate-pulse text-accent-500" : "text-accent-600"}`} />
            <div>
              <p className="text-sm font-semibold text-graphite-800 dark:text-zinc-100">
                {uploadBusy ? "Scanning document…" : "Drop policy or click to upload"}
              </p>
              <p className="text-xs text-graphite-500">Score, grade, passed checks & gap list appear instantly</p>
            </div>
            <input type="file" accept=".pdf,.docx,.txt" className="hidden" disabled={uploadBusy} onChange={onQuickUpload} />
          </label>
          {latestUpload && (
            <div className="mt-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-600/30 dark:bg-graphite-850/50">
              <PolicyScorePanel report={latestUpload} compact />
              <Link to="/app/auditor" className="mt-2 inline-block text-xs font-semibold text-accent-600 hover:underline dark:text-accent-400">
                Open full breakdown →
              </Link>
            </div>
          )}
        </GlassCard>
        <GlassCard delay={0.08}>
          <p className="text-xs font-medium uppercase tracking-wide text-graphite-500">Org compliance score</p>
          <div className="mt-4 flex justify-center">
            <ScoreRing score={health?.complianceScore ?? 0} size={130} />
          </div>
          <p className="mt-3 text-center text-xs text-graphite-500">Blends published policies + uploaded audit scores</p>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Audit readiness" value={`${health?.auditReadinessPercentage ?? "—"}%`} hint="Controls + evidence" delay={0} />
        <Stat label="Policies scanned" value={uploads.length || "0"} hint="Uploaded documents" delay={0.05} />
        <Stat label="Pending acknowledgments" value={health?.pendingAcknowledgments ?? "—"} hint="Employees" delay={0.1} />
        <Stat label="Risk level" value={(health?.riskLevel || "—").toString()} hint="Derived heuristic" delay={0.15} accent />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" delay={0.1}>
          <h2 className="font-display text-lg font-semibold text-graphite-900 dark:text-zinc-50">Uploaded policy scores</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend.length ? trend : [{ name: "—", score: 0 }]}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#71717a" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(161,161,170,0.3)" }} />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#scoreGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard delay={0.15}>
          <h2 className="font-display text-lg font-semibold text-graphite-900 dark:text-zinc-50">Control heatmap</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={health?.heatmap || []}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                <XAxis dataKey="area" stroke="#71717a" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#71717a" fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {(health?.heatmap || []).map((_, i) => (
                    <Cell key={i} fill={["#8b5cf6", "#6366f1", "#14b8a6", "#f59e0b"][i % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {uploads.length > 0 && (
        <GlassCard delay={0.18}>
          <h2 className="font-display text-lg font-semibold">Recent policy scores</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {uploads.slice(0, 4).map((u) => (
              <div key={u.id} className="glass-inner flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-graphite-800 dark:text-zinc-100">{u.fileName}</p>
                  <p className="text-xs text-graphite-500">
                    Grade {u.grade} · {u.passedCount} passed · {u.issueCount} issues
                  </p>
                </div>
                <span className="font-display text-xl font-bold text-accent-600 dark:text-accent-400">{u.score}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard delay={0.22}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Policies</h2>
          <Link to="/app/templates" className="text-xs font-semibold text-accent-600 hover:underline dark:text-accent-400">
            Browse templates
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-graphite-500">
                <th className="pb-2">Title</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Type</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {policies.slice(0, 8).map((p) => (
                <tr key={p._id} className="border-t border-zinc-200/60 dark:border-zinc-700/40">
                  <td className="py-2 font-medium text-graphite-800 dark:text-zinc-100">{p.title}</td>
                  <td className="py-2 capitalize text-graphite-500">{p.status}</td>
                  <td className="py-2 text-graphite-500">{p.type?.replace(/_/g, " ")}</td>
                  <td className="py-2 text-right">
                    <Link className="text-accent-600 hover:underline dark:text-accent-400" to={`/app/editor/${p._id}`}>
                      Open editor
                    </Link>
                  </td>
                </tr>
              ))}
              {!policies.length && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-graphite-500">
                    No policies yet — generate one with AI or upload to score.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function Stat({ label, value, hint, delay, accent }) {
  return (
    <GlassCard delay={delay} className={accent ? "border-teal-500/30" : ""}>
      <p className="text-xs font-medium uppercase tracking-wide text-graphite-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold capitalize text-graphite-900 dark:text-zinc-50">{value}</p>
      <p className="mt-1 text-xs text-graphite-500">{hint}</p>
    </GlassCard>
  );
}
