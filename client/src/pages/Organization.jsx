import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Organization() {
  const { organization, refresh } = useAuth();
  const [form, setForm] = useState({ name: "", industry: "", country: "", companyType: "" });

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name || "",
        industry: organization.industry || "",
        country: organization.country || "",
        companyType: organization.companyType || "",
      });
    }
  }, [organization]);

  async function save(e) {
    e.preventDefault();
    try {
      await api.patch("/organizations", form);
      toast.success("Organization updated");
      await refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Organization</h1>
        <p className="text-sm text-slate-500">Multi-tenant profile, notification defaults, collaboration context</p>
      </div>
      <GlassCard>
        <form className="space-y-3" onSubmit={save}>
          {["name", "industry", "country", "companyType"].map((k) => (
            <div key={k}>
              <label className="text-xs capitalize text-slate-500">{k.replace(/([A-Z])/g, " $1")}</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </div>
          ))}
          <button type="submit" className="w-full rounded-xl bg-nova-600 py-2 text-sm font-semibold text-white">
            Save
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
