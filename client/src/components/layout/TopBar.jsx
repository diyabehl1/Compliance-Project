import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useEffect, useState } from "react";
import api from "../../lib/api.js";

export default function TopBar({ onMenu }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const nav = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/notifications");
        const n = data.notifications?.filter((x) => !x.read).length || 0;
        if (!cancelled) setUnread(n);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = () => {
    setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  };

  return (
    <header className="flex items-center justify-between border-b border-zinc-200/80 bg-white/50 px-4 py-3 backdrop-blur-xl dark:border-zinc-700/40 dark:bg-graphite-900/45 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-zinc-300 bg-white/70 p-2 md:hidden dark:border-zinc-600 dark:bg-graphite-800/60"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">Compliance Command</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-zinc-300 bg-white/70 p-2 dark:border-zinc-600 dark:bg-graphite-800/60"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          className="relative rounded-xl border border-white/20 bg-white/40 p-2 dark:border-white/10 dark:bg-white/5"
          onClick={() => nav("/app/regulations")}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        <div className="hidden items-center gap-2 rounded-2xl border border-white/20 bg-white/40 px-3 py-1.5 sm:flex dark:border-white/10 dark:bg-white/5">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-[10px] capitalize text-slate-500">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            nav("/login");
          }}
          className="rounded-xl border border-zinc-300 bg-white/70 p-2 dark:border-zinc-600 dark:bg-graphite-800/60"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
