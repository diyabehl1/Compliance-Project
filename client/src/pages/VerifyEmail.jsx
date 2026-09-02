import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api.js";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState("Verifying…");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setMsg("Missing token");
      return;
    }
    api
      .get("/auth/verify-email", { params: { token } })
      .then(() => setMsg("Email verified. You can sign in."))
      .catch(() => setMsg("Invalid or expired link."));
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass max-w-md p-8 text-center">
        <p className="text-sm text-slate-700 dark:text-slate-200">{msg}</p>
        <Link className="mt-4 inline-block text-sm text-nova-600 hover:underline dark:text-nova-300" to="/login">
          Go to login
        </Link>
      </div>
    </div>
  );
}
