import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Library,
  FileEdit,
  Radar,
  ScanSearch,
  ClipboardSignature,
  Newspaper,
  Bot,
  GitBranch,
  CalendarDays,
  Building2,
  ScrollText,
  LineChart,
} from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/generator", label: "AI Generator", icon: Sparkles },
  { to: "/app/templates", label: "Templates", icon: Library },
  { to: "/app/gap", label: "Gap Analyzer", icon: Radar },
  { to: "/app/auditor", label: "Policy Scorer", icon: ScanSearch },
  { to: "/app/acknowledgments", label: "Acknowledgments", icon: ClipboardSignature },
  { to: "/app/regulations", label: "Regulations", icon: Newspaper },
  { to: "/app/chat", label: "Compliance AI", icon: Bot },
  { to: "/app/workflows", label: "Workflows", icon: GitBranch },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/reports", label: "Reports", icon: LineChart },
  { to: "/app/organization", label: "Organization", icon: Building2 },
  { to: "/app/activity", label: "Audit Trail", icon: ScrollText },
];

export default function Sidebar({ variant = "desktop", onNavigate }) {
  const vis = variant === "mobile" ? "flex" : "hidden md:flex";
  return (
    <aside
      className={`${vis} w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white/60 py-6 backdrop-blur-xl dark:border-zinc-700/40 dark:bg-graphite-900/55`}
    >
      <div className="px-5 pb-6">
        <div className="font-display text-lg font-semibold tracking-tight text-graphite-900 dark:text-zinc-50">
          CompliNova<span className="text-accent-500"> AI</span>
        </div>
        <p className="mt-1 text-xs text-graphite-500 dark:text-zinc-400">Intelligent compliance OS</p>
      </div>
      <nav className="scrollbar-thin flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
        {links.map((l, i) => (
          <motion.div key={l.to} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <NavLink
              to={l.to}
              end={l.end}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-accent-600/15 text-accent-700 dark:bg-accent-500/20 dark:text-accent-200"
                    : "text-graphite-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-graphite-800/60"
                }`
              }
            >
              <l.icon className="h-4 w-4 shrink-0 opacity-80" />
              {l.label}
            </NavLink>
          </motion.div>
        ))}
      </nav>
      <div className="mt-auto px-4 pt-4 text-[10px] text-slate-400">© CompliNova AI</div>
    </aside>
  );
}
