import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";

export function scoreColor(score) {
  if (score >= 80) return { ring: "#10b981", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/15" };
  if (score >= 60) return { ring: "#f59e0b", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/15" };
  return { ring: "#ef4444", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/15" };
}

export function ScoreRing({ score = 0, grade, size = 120 }) {
  const colors = scoreColor(score);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={8} className="text-zinc-200 dark:text-zinc-700" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.ring}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className={`font-display text-2xl font-bold ${colors.text}`}>{score}%</p>
        {grade && <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{grade}</p>}
      </div>
    </div>
  );
}

function SeverityIcon({ severity }) {
  if (severity === "critical") return <XCircle className="h-4 w-4 shrink-0 text-rose-500" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />;
  return <Info className="h-4 w-4 shrink-0 text-sky-500" />;
}

export default function PolicyScorePanel({ report, compact = false }) {
  if (!report) return null;
  const score = report.complianceScore ?? 0;
  const passed = report.passedChecks || [];
  const issues = report.issues || [];
  const colors = scoreColor(score);

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <ScoreRing score={score} grade={report.grade} size={88} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{report.fileName}</p>
          <p className="mt-1 text-xs text-zinc-500">{report.summary || "Policy compliance scan"}</p>
          <div className="mt-2 flex gap-3 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400">{passed.length} passed</span>
            <span className="text-rose-600 dark:text-rose-400">{issues.length} issues</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <ScoreRing score={score} grade={report.grade} size={140} />
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">{report.fileName}</h3>
          <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
            Grade {report.grade || "—"} · {score >= 80 ? "Mostly compliant" : score >= 60 ? "Needs improvement" : "Critical gaps"}
          </p>
          {report.summary && <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{report.summary}</p>}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
            {(report.standardsUsed || []).map((s) => (
              <span key={s} className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 dark:border-zinc-600 dark:bg-zinc-800">
                {String(s).replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:bg-emerald-500/10">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Passed checks ({passed.length})
          </div>
          <ul className="max-h-52 space-y-2 overflow-y-auto text-xs">
            {passed.length ? (
              passed.map((p, i) => (
                <li key={i} className="flex gap-2 rounded-lg bg-white/60 px-2 py-1.5 dark:bg-zinc-800/60">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-100">{p.label}</span>
                    {p.detail && <span className="block text-zinc-500">{p.detail}</span>}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-zinc-500">No clauses confidently matched — upload a fuller policy document.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 dark:bg-rose-500/10">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-200">
            <AlertTriangle className="h-4 w-4" />
            Mistakes & gaps ({issues.length})
          </div>
          <ul className="max-h-52 space-y-2 overflow-y-auto text-xs">
            {issues.length ? (
              issues.map((issue, i) => (
                <li key={i} className="rounded-lg bg-white/60 px-2 py-1.5 dark:bg-zinc-800/60">
                  <div className="flex gap-2">
                    <SeverityIcon severity={issue.severity} />
                    <div>
                      <p className="font-medium capitalize text-zinc-800 dark:text-zinc-100">{issue.category || "Issue"}</p>
                      <p className="text-zinc-600 dark:text-zinc-300">{issue.message}</p>
                      {issue.fix && <p className="mt-1 text-zinc-500">Fix: {issue.fix}</p>}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-zinc-500">No critical issues detected.</li>
            )}
          </ul>
        </div>
      </div>

      {(report.suggestions?.length > 0 || report.outdatedReferences?.length > 0) && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-600/40 dark:bg-zinc-800/40">
          {report.outdatedReferences?.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Outdated references</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-zinc-600 dark:text-zinc-300">
                {report.outdatedReferences.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
          {report.suggestions?.length > 0 && (
            <>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Recommendations</p>
              <ul className="mt-2 list-disc pl-4 text-xs text-zinc-600 dark:text-zinc-300">
                {report.suggestions.slice(0, 5).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
