import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    role: "admin",
  });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      toast.success("Account created");
      nav("/app");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-lg p-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Create your workspace</h1>
        <p className="mt-1 text-sm text-slate-500">JWT-secured roles: Admin, Compliance Manager, Employee</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Full name</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Work email</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Password (min 8)</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Organization name</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.organizationName}
              onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
              placeholder="Acme Cybersecurity Ltd"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Your role</label>
            <select
              className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="compliance_manager">Compliance Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-nova-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nova-600/25 hover:bg-nova-500 disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link className="text-nova-600 hover:underline dark:text-nova-300" to="/login">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
