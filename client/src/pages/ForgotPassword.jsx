import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../lib/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("If an account exists, reset instructions were sent.");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">We will email a secure link when SMTP is configured.</p>
        {sent ? (
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Check your inbox for the next steps.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input
              className="w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
              placeholder="you@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="w-full rounded-xl bg-nova-600 py-2.5 text-sm font-semibold text-white hover:bg-nova-500">
              Send reset link
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-xs">
          <Link to="/login" className="text-nova-600 hover:underline dark:text-nova-300">
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
