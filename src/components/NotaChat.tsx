"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { streamNota, type ChatMessage } from "@/lib/nota";
import { Caret, Nota } from "./Nota";

type Props = {
  /** Premier message de Nota, affiché d'emblée. */
  intro: string;
  /** Ce que Nota doit savoir de l'étape en cours (envoyé avec chaque question). */
  context: string;
  /** Construit la première demande à partir des réponses de l'utilisateur. */
  firstRequest: () => { content: string; display: string };
  canAsk: boolean;
  askLabel?: string;
  disabledHint?: string;
};

export default function NotaChat({
  intro,
  context,
  firstRequest,
  canAsk,
  askLabel = "Demander l'avis de Nota",
  disabledHint = "Écrivez d'abord quelques mots.",
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const last = messages[messages.length - 1];
  const waiting = loading && last?.role === "assistant" && !last.content;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(message: ChatMessage) {
    if (loading) return;
    const history = [...messages, message];
    setMessages([...history, { role: "assistant", content: "" }]);
    setLoading(true);
    try {
      await streamNota(history, (text) => setMessages([...history, { role: "assistant", content: text }]), context);
    } catch {
      setMessages([...history, { role: "assistant", content: "Oups, je n'ai pas réussi à répondre. Réessayez ?" }]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    send({ role: "user", content: text });
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="flex flex-col rounded-3xl bg-white/90 p-5 shadow-xl shadow-navy/10 ring-1 ring-navy/5 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <Nota size={58} thinking={waiting} />
        <div>
          <p className="font-display text-lg font-medium leading-tight">Nota</p>
          <p className="text-xs text-navy/55">{loading ? "Nota écrit…" : "Votre guide olfactive"}</p>
        </div>
      </div>

      <div ref={listRef} className="mt-4 flex max-h-[22rem] min-h-28 flex-col gap-3 overflow-y-auto pr-1 text-[13.5px] leading-snug">
        <Bubble role="assistant">{intro}</Bubble>
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>
              {m.role === "assistant" && !m.content ? (
                <span className="inline-flex gap-1 py-1" aria-label="Nota réfléchit">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-navy/40"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </span>
              ) : (
                <>
                  {m.display ?? m.content}
                  {loading && i === messages.length - 1 && <Caret />}
                </>
              )}
            </Bubble>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4">
        {messages.length === 0 ? (
          <>
            <button
              onClick={() => send({ role: "user", ...firstRequest() })}
              disabled={!canAsk}
              className="w-full rounded-full bg-[#ebe6ef] px-4 py-3 text-sm font-semibold text-navy transition hover:-translate-y-0.5 hover:bg-[#e1d9e8] disabled:translate-y-0 disabled:opacity-40"
            >
              ✨ {askLabel}
            </button>
            {!canAsk && <p className="mt-2 text-center text-xs text-navy/45">{disabledHint}</p>}
          </>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-1 rounded-full bg-cream p-1 pl-4 ring-1 ring-navy/10 focus-within:ring-navy/30"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Répondre à Nota…"
              aria-label="Répondre à Nota"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-navy/40"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Envoyer"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-white transition hover:scale-105 disabled:opacity-30"
            >
              ↑
            </button>
          </form>
        )}
      </div>
    </motion.aside>
  );
}

function Bubble({ role, children }: { role: ChatMessage["role"]; children: React.ReactNode }) {
  const mine = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 ${
        mine ? "self-end rounded-br-md bg-navy text-white" : "self-start rounded-bl-md bg-cream text-navy"
      }`}
    >
      {children}
    </motion.div>
  );
}
