import { useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";

export default function Reports() {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    api
      .get("/policies")
      .then(({ data }) => setPolicies(data.policies || []))
      .catch(() => {});
  }, []);

  function download(id, title, format) {
    const token = localStorage.getItem("cn_token");
    const url = `/api/export/policy/${id}/${format}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${title.replace(/[^\w.-]/g, "_")}.${format}`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Exports & reports</h1>
        <p className="text-sm text-slate-500">Server-side DOCX/PDF via `docx` + `pdfkit`</p>
      </div>
      <GlassCard>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-slate-500">
              <th className="pb-2">Policy</th>
              <th className="pb-2">DOCX</th>
              <th className="pb-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p._id} className="border-t border-white/10">
                <td className="py-2 font-medium">{p.title}</td>
                <td>
                  <button type="button" className="text-nova-600 hover:underline" onClick={() => download(p._id, p.title, "docx")}>
                    Download
                  </button>
                </td>
                <td>
                  <button type="button" className="text-nova-600 hover:underline" onClick={() => download(p._id, p.title, "pdf")}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
