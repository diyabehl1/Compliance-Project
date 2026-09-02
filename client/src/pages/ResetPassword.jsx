import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../lib/api.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password updated — sign in");
      nav("/login");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold">New password</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            minLength={8}
            required
            className="w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-white/5"
            placeholder="New password (min 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full rounded-xl bg-nova-600 py-2.5 text-sm font-semibold text-white">
            Update password
          </button>
        </form>
        <p className="mt-4 text-center text-xs">
          <Link to="/login" className="text-nova-600 hover:underline dark:text-nova-300">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
