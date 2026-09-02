import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileCheck2 } from "lucide-react";
import GlassCard from "../components/ui/GlassCard.jsx";
import PolicyScorePanel from "../components/PolicyScorePanel.jsx";
import api from "../lib/api.js";

const STANDARDS = ["GDPR", "ISO_27001", "SOC_2", "HIPAA", "PCI_DSS", "India_DPDP"];

export default function Auditor() {
  const [reports, setReports] = useState([]);
  const [busy, setBusy] = useState(false);
  const [latest, setLatest] = useState(null);
  const [standards, setStandards] = useState(["GDPR", "ISO_27001"]);

  async function refresh() {
    const { data } = await api.get("/uploads/audit/reports");
    setReports(data.reports || []);
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  function toggleStandard(std) {
    setStandards((prev) => (prev.includes(std) ? prev.filter((s) => s !== std) : [...prev, std]));
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setLatest(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("standards", JSON.stringify(standards.length ? standards : ["GDPR"]));
    try {
      const { data } = await api.post("/uploads/audit", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setLatest(data.report);
      toast.success(`Policy scored: ${data.report.complianceScore}% (Grade ${data.report.grade})`);
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-graphite-900 dark:text-zinc-50">Policy compliance scorer</h1>
        <p className="text-sm text-graphite-500 dark:text-zinc-400">
          Upload policies — instant score, passed checks, and mistake breakdown
        </p>
      </div>

      <GlassCard>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-graphite-500">Compliance standards</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {STANDARDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleStandard(s)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                standards.includes(s)
                  ? "border-accent-500/50 bg-accent-600/15 text-accent-700 dark:text-accent-200"
                  : "border-zinc-300 bg-white/50 text-graphite-600 dark:border-zinc-600 dark:bg-graphite-800/50 dark:text-zinc-300"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
            busy
              ? "border-accent-400/40 bg-accent-500/5"
              : "border-zinc-300 bg-zinc-50/50 hover:border-accent-500/50 dark:border-zinc-600 dark:bg-graphite-850/40"
          }`}
        >
          <UploadCloud className={`h-10 w-10 ${busy ? "animate-pulse text-accent-500" : "text-accent-600"}`} />
          <p className="mt-3 text-sm font-semibold text-graphite-800 dark:text-zinc-100">
            {busy ? "Analyzing policy…" : "Upload PDF, DOCX, or TXT"}
          </p>
          <p className="mt-1 text-xs text-graphite-500">Scores purpose, security, breach, retention, vendors & more</p>
          <input type="file" accept=".pdf,.docx,.txt" className="hidden" disabled={busy} onChange={onFile} />
        </label>
      </GlassCard>

      <AnimatePresence mode="wait">
        {latest && (
          <motion.div key={latest._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlassCard className="shadow-glow">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-accent-700 dark:text-accent-300">
                <FileCheck2 className="h-4 w-4" />
                Latest scan result
              </div>
              <PolicyScorePanel report={latest} />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-graphite-900 dark:text-zinc-50">Previous uploads</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((r, i) => (
            <GlassCard key={r._id} delay={i * 0.03}>
              <PolicyScorePanel report={r} compact />
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-accent-600 hover:underline dark:text-accent-400"
                onClick={() => setLatest(r)}
              >
                View full breakdown
              </button>
            </GlassCard>
          ))}
          {!reports.length && (
            <GlassCard>
              <p className="text-sm text-graphite-500">No policies scanned yet. Upload your first document above.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
