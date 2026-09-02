import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Acknowledgments() {
  const { isManager } = useAuth();
  const [mine, setMine] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [adminPolicy, setAdminPolicy] = useState("");
  const [adminRows, setAdminRows] = useState(null);

  async function load() {
    const [{ data: a }, { data: p }] = await Promise.all([api.get("/acknowledgments/my"), api.get("/policies")]);
    setMine(a.acknowledgments || []);
    setPolicies(p.policies || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function sign(id) {
    try {
      await api.post(`/acknowledgments/sign/${id}`, {});
      toast.success("Acknowledged");
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function loadAdmin() {
    if (!adminPolicy) return;
    try {
      const { data } = await api.get(`/acknowledgments/admin/${adminPolicy}`);
      setAdminRows(data);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function assign() {
    const uid = prompt("User id to assign (from team)");
    if (!uid || !adminPolicy) return;
    try {
      await api.post("/acknowledgments/assign", { policyId: adminPolicy, userIds: [uid] });
      toast.success("Assigned");
      await loadAdmin();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Acknowledgments</h1>
        <p className="text-sm text-slate-500">Read, e-sign, and export audit-grade CSV logs</p>
      </div>
      <GlassCard>
        <h2 className="font-semibold">My pending / signed</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {mine.map((a) => (
            <li key={a._id} className="flex items-center justify-between gap-2 glass-inner rounded-lg px-3 py-2">
              <span>{a.policy?.title || "Policy"}</span>
              <span className="text-xs capitalize text-slate-500">{a.status}</span>
              {a.status === "pending" && (
                <button type="button" className="rounded-lg bg-nova-600 px-3 py-1 text-xs text-white" onClick={() => sign(a._id)}>
                  Sign
                </button>
              )}
            </li>
          ))}
          {!mine.length && <li className="text-slate-500">No assignments.</li>}
        </ul>
      </GlassCard>
      {isManager && (
        <GlassCard>
          <h2 className="font-semibold">Admin — coverage & audit log</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              className="rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              value={adminPolicy}
              onChange={(e) => setAdminPolicy(e.target.value)}
            >
              <option value="">Select policy</option>
              {policies.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            <button type="button" className="rounded-xl bg-nova-600 px-3 py-2 text-xs text-white" onClick={loadAdmin}>
              Load roster
            </button>
            <button type="button" className="rounded-xl border border-white/30 px-3 py-2 text-xs dark:border-white/10" onClick={assign}>
              Assign user
            </button>
            {adminPolicy && (
              <button
                type="button"
                className="rounded-xl border border-white/30 px-3 py-2 text-xs dark:border-white/10"
                onClick={async () => {
                  try {
                    const res = await api.get(`/acknowledgments/admin/${adminPolicy}/export`, { responseType: "blob" });
                    const url = URL.createObjectURL(res.data);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `ack-${adminPolicy}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    toast.error(e.message);
                  }
                }}
              >
                Download CSV
              </button>
            )}
          </div>
          {adminRows && (
            <table className="mt-4 w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500">
                  <th className="pb-2">User</th>
                  <th>Status</th>
                  <th>Signed</th>
                </tr>
              </thead>
              <tbody>
                {adminRows.rows?.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="py-2">
                      {r.user?.name} <span className="text-slate-400">{r.user?.email}</span>
                    </td>
                    <td>{r.status}</td>
                    <td>{r.signedAt ? new Date(r.signedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      )}
    </div>
  );
}
