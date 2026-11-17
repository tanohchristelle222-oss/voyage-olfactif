"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { streamNota, type ChatMessage as Message } from "@/lib/nota";

export function Caret() {
  return <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-navy/60" />;
}

const GREETING = "Bonjour, je suis Nota !\nJe vous guide jusqu'à vos échantillons.";

/** La mascotte : une goutte de parfum qui flotte et cligne des yeux. */
export function Nota({ size = 64, thinking = false }: { size?: number; thinking?: boolean }) {
  const gradientId = `nota-body-${useId()}`;
  return (
    <motion.svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      className="shrink-0"
      animate={thinking ? { y: [0, -12, 0], rotate: [-6, 6, -6] } : { y: [0, -7, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: thinking ? 0.7 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId}x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fbc4b0" />
          <stop offset="1" stopColor="#ef8a86" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="116" rx="26" ry="4" fill="#000" opacity="0.08" />
      {/* feuille */}
      <path d="M52 10 C 58 0, 70 0, 74 4 C 68 10, 60 12, 52 10 Z" fill="#8bb36b" />
      {/* corps */}
      <path
        d="M50 8 C 50 8, 90 56, 90 76 A 40 40 0 0 1 10 76 C 10 56, 50 8, 50 8 Z"
        fill={`url(#${gradientId})`}
      />
      <path d="M30 60 C 26 70, 26 80, 30 88" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.55" fill="none" />
      {/* yeux qui clignent */}
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <ellipse cx="38" cy="76" rx="4.5" ry="5.5" fill="#2a2030" />
        <ellipse cx="62" cy="76" rx="4.5" ry="5.5" fill="#2a2030" />
        <circle cx="39.5" cy="74" r="1.5" fill="#fff" />
        <circle cx="63.5" cy="74" r="1.5" fill="#fff" />
      </motion.g>
      <circle cx="30" cy="86" r="5" fill="#f2697a" opacity="0.4" />
      <circle cx="70" cy="86" r="5" fill="#f2697a" opacity="0.4" />
      <path d="M44 88 Q 50 94 56 88" stroke="#2a2030" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </motion.svg>
  );
}

/** Nota + sa bulle : message d'accueil tapé, puis chat en streaming avec Ollama. */
export default function NotaGreeting({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const greetingDone = count >= GREETING.length;
  const last = messages[messages.length - 1];
  const reply = last?.role === "assistant" ? last.content : "";
  const lastQuestion = [...messages].reverse().find((m) => m.role === "user")?.content;

  useEffect(() => {
    bubbleRef.current?.scrollTo({ top: bubbleRef.current.scrollHeight });
  }, [reply]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    const history: Message[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      await streamNota(history, (text) => setMessages([...history, { role: "assistant", content: text }]));
    } catch {
      setMessages([...history, { role: "assistant", content: "Oups, je n'ai pas réussi à répondre. Réessayez ?" }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const start = setTimeout(() => {
      const id = setInterval(() => {
        setCount((c) => {
          if (c >= GREETING.length) {
            clearInterval(id);
            return c;
          }
          return c + 1;
        });
      }, 28);
    }, 1200);
    return () => clearTimeout(start);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className={`flex items-start gap-3 ${className}`}
    >
      <Nota thinking={loading && !reply} />
      <div className="w-72 max-w-[calc(100vw-7rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, type: "spring", stiffness: 260, damping: 18 }}
          style={{ transformOrigin: "left center" }}
          className="relative mt-1 rounded-2xl bg-white text-[13px] leading-snug text-navy shadow-lg shadow-navy/10"
        >
          <span className="absolute -left-1.5 top-5 h-3 w-3 rotate-45 bg-white" />
          <div ref={bubbleRef} className="relative max-h-36 min-h-[4.25rem] overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <span className="whitespace-pre-line">
                {GREETING.slice(0, count)}
                {!greetingDone && <Caret />}
              </span>
            ) : (
              <>
                {lastQuestion && (
                  <p className="mb-1.5 text-[11px] italic text-navy/50">« {lastQuestion} »</p>
                )}
                {reply ? (
                  <span className="whitespace-pre-line">
                    {reply}
                    {loading && <Caret />}
                  </span>
                ) : (
                  <span className="inline-flex gap-1 py-1" aria-label="Nota réfléchit">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-navy/40"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                )}
              </>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {greetingDone && (
            <motion.form
              onSubmit={ask}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-1 rounded-full bg-white/90 p-1 pl-4 shadow-md shadow-navy/10 ring-1 ring-navy/5 focus-within:ring-navy/30"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question à Nota…"
                aria-label="Question pour Nota"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-navy outline-none placeholder:text-navy/40"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Envoyer"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-white transition hover:scale-105 disabled:opacity-30"
              >
                ↑
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
