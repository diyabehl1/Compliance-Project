import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../components/ui/GlassCard.jsx";
import api from "../lib/api.js";

const starters = [
  "What is GDPR?",
  "Generate SOC2 password policy",
  "What policies are required for DPDP?",
  "Explain ISO 27001 controls",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi — I am CompliNova AI. Ask anything compliance." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(text) {
    const q = text || input;
    if (!q.trim()) return;
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data } = await api.post("/ai/chat", { messages: next.map((m) => ({ role: m.role, content: m.content })) });
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Compliance copilot</h1>
        <p className="text-sm text-slate-500">OpenAI-powered when `OPENAI_API_KEY` is set — otherwise guided offline mode</p>
      </div>
      <GlassCard className="flex h-[min(70vh,560px)] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-nova-600 text-white"
                    : "mr-auto bg-white/50 text-slate-800 dark:bg-white/5 dark:text-slate-100"
                }`}
              >
                {m.content}
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && <p className="text-xs text-slate-500">Thinking…</p>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {starters.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border border-white/30 bg-white/40 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/5"
              onClick={() => send(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            className="flex-1 rounded-xl border border-white/30 bg-white/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
            placeholder="Ask CompliNova AI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="rounded-xl bg-nova-600 px-4 py-2 text-sm font-semibold text-white" disabled={busy}>
            Send
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
