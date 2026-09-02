import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Star, Copy, FileDown } from "lucide-react";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";

export default function Templates() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ category: "", industry: "", country: "", complianceType: "", department: "" });
  const [preview, setPreview] = useState(null);
  const nav = useNavigate();

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    const { data } = await api.get(`/templates?${params.toString()}`);
    setItems(data.templates || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function search(e) {
    e.preventDefault();
    await load();
  }

  async function favorite(id) {
    try {
      await api.post(`/templates/${id}/favorite`);
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function duplicate(id) {
    try {
      const { data } = await api.post(`/templates/${id}/duplicate`);
      toast.success("Duplicated");
      setPreview(data.template);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function saveToOrg(id) {
    try {
      const { data } = await api.post(`/policies/from-template/${id}`);
      nav(`/app/editor/${data.policy._id}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Template marketplace</h1>
        <p className="text-sm text-slate-500">Search, preview, duplicate, export via policy editor</p>
      </div>
      <GlassCard>
        <form onSubmit={search} className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="text-xs text-slate-500">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="w-full rounded-xl border border-white/30 bg-white/50 py-2 pl-9 pr-3 text-sm dark:border-white/10 dark:bg-white/5"
                placeholder="Search title or description"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          {["category", "industry", "country", "complianceType", "department"].map((k) => (
            <div key={k} className="w-full lg:w-36">
              <label className="text-xs capitalize text-slate-500">{k.replace(/([A-Z])/g, " $1")}</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/30 bg-white/50 px-2 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                value={filters[k]}
                onChange={(e) => setFilters({ ...filters, [k]: e.target.value })}
              />
            </div>
          ))}
          <button type="submit" className="rounded-xl bg-nova-600 px-4 py-2 text-sm font-semibold text-white">
            Apply
          </button>
        </form>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((t, i) => (
          <GlassCard key={t._id} delay={i * 0.02} className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{t.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{t.description}</p>
              </div>
              <button type="button" onClick={() => favorite(t._id)} className="rounded-lg p-2 hover:bg-white/30">
                <Star className={`h-4 w-4 ${t.isFavorite ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1 text-[10px] uppercase tracking-wide text-slate-500">
              {[t.category, t.industry, t.country, t.complianceType, t.department].filter(Boolean).map((x) => (
                <span key={x} className="rounded-full bg-white/40 px-2 py-0.5 dark:bg-white/5">
                  {x}
                </span>
              ))}
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <button type="button" className="text-xs font-semibold text-nova-600 hover:underline" onClick={() => setPreview(t)}>
                Preview
              </button>
              <button type="button" className="text-xs font-semibold text-slate-600 hover:underline dark:text-slate-300" onClick={() => duplicate(t._id)}>
                <span className="inline-flex items-center gap-1">
                  <Copy className="h-3 w-3" /> Duplicate
                </span>
              </button>
              <button type="button" className="text-xs font-semibold text-emerald-600 hover:underline" onClick={() => saveToOrg(t._id)}>
                Save to org
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-slate-600 hover:underline dark:text-slate-300"
                onClick={() => saveToOrg(t._id)}
                title="Open in editor, then use Reports to export PDF/DOCX"
              >
                <span className="inline-flex items-center gap-1">
                  <FileDown className="h-3 w-3" /> Open → export
                </span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div className="glass max-h-[85vh] w-full max-w-2xl overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold">{preview.title}</h3>
            <pre className="mt-4 max-h-[60vh] overflow-auto rounded-xl bg-black/40 p-3 text-xs text-slate-100">
              {JSON.stringify(preview.content, null, 2)}
            </pre>
            <button type="button" className="mt-4 rounded-xl bg-nova-600 px-4 py-2 text-sm text-white" onClick={() => setPreview(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
