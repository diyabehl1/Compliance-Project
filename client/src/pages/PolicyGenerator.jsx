import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";

const standards = ["GDPR", "ISO_27001", "SOC_2", "HIPAA", "PCI_DSS", "India_DPDP"];
const policyTypes = [
  ["privacy_policy", "Privacy Policy"],
  ["password_policy", "Password Policy"],
  ["incident_response", "Incident Response"],
  ["cybersecurity", "Cybersecurity Policy"],
  ["hr_policy", "HR Policy"],
  ["data_retention", "Data Retention"],
  ["acceptable_use", "Acceptable Use"],
];
const tones = [
  ["professional", "Professional"],
  ["startup_friendly", "Startup friendly"],
  ["legal", "Legal"],
  ["technical", "Technical"],
];

export default function PolicyGenerator() {
  const [form, setForm] = useState({
    industry: "Technology",
    country: "EU",
    companyType: "SaaS startup",
    standard: "GDPR",
    policyType: "privacy_policy",
    tone: "professional",
    language: "en",
  });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      const { data } = await api.post("/ai/generate-policy", form);
      setResult(data);
      toast.success("Policy draft ready");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function rewrite() {
    if (!result?.content) return;
    setBusy(true);
    try {
      const { data } = await api.post("/ai/rewrite-policy", { content: result.content, tone: form.tone });
      setResult((r) => ({ ...r, content: data.content }));
      toast.success(data.note || "Rewritten");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!result) return;
    setBusy(true);
    try {
      const { data } = await api.post("/ai/save-generated", {
        title: result.title,
        content: result.content,
        type: form.policyType,
        complianceStandards: [form.standard],
        tone: form.tone,
        language: form.language,
      });
      toast.success("Saved to workspace");
      window.location.href = `/app/editor/${data.policy._id}`;
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">AI Policy Generator</h1>
        <p className="text-sm text-slate-500">Standards-aware drafts with tone control and multi-language metadata</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
            <Field label="Country / region" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
            <Field label="Company type" value={form.companyType} onChange={(v) => setForm({ ...form, companyType: v })} />
            <div>
              <label className="text-xs font-medium text-slate-500">Language</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Compliance standard</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                value={form.standard}
                onChange={(e) => setForm({ ...form, standard: e.target.value })}
              >
                {standards.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Policy type</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                value={form.policyType}
                onChange={(e) => setForm({ ...form, policyType: e.target.value })}
              >
                {policyTypes.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500">Tone</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tones.map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({ ...form, tone: v })}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      form.tone === v
                        ? "border-nova-500 bg-nova-600/15 text-nova-700 dark:text-nova-200"
                        : "border-white/20 bg-white/30 dark:border-white/10 dark:bg-white/5"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={generate}
              className="rounded-xl bg-nova-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nova-600/25 hover:bg-nova-500 disabled:opacity-60"
            >
              Generate with AI
            </button>
            <button
              type="button"
              disabled={busy || !result}
              onClick={rewrite}
              className="rounded-xl border border-white/30 bg-white/40 px-4 py-2 text-sm font-semibold dark:border-white/10 dark:bg-white/5"
            >
              AI rewrite
            </button>
            <button
              type="button"
              disabled={busy || !result}
              onClick={save}
              className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200"
            >
              Save to organization
            </button>
          </div>
          {result?.disclaimer && <p className="mt-3 text-xs text-slate-500">{result.disclaimer}</p>}
        </GlassCard>
        <GlassCard>
          <h2 className="font-display text-lg font-semibold">Live preview</h2>
          <motion.pre
            key={JSON.stringify(result?.content).slice(0, 80)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 max-h-[480px] overflow-auto rounded-xl bg-black/40 p-3 text-xs text-emerald-100/90"
          >
            {result ? JSON.stringify(result.content, null, 2) : "// Run generate to see structured TipTap JSON"}
          </motion.pre>
        </GlassCard>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input
        className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
