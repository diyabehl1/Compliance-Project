import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      nav("/app");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">CompliNova AI — secure compliance workspace</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm outline-none ring-nova-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm outline-none ring-nova-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-600/25 transition hover:bg-accent-500 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Continue"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          <Link className="text-accent-600 hover:underline dark:text-accent-400" to="/forgot-password">
            Forgot password?
          </Link>
          {" · "}
          <Link className="text-accent-600 hover:underline dark:text-accent-400" to="/register">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
