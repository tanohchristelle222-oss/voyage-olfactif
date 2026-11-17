"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { streamNota, type ChatMessage as Message } from "@/lib/nota";

export function Caret() {
  return <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-navy/60" />;
}

const GREETING = "Bonjour, je suis Nota !\nJe vous guide jusqu'à vos échantillons.";

/** Proportions de l'image public/nota.webp (337 × 520). */
const NOTA_RATIO = 337 / 520;

/** Position des yeux dans l'image (en % de 337 × 520) et couleur du verre autour, pour les paupières. */
const EYES = [
  { left: 26.4, top: 38.6, width: 10.4, height: 6.6, lid: ["#f3dcd6", "#e8cfc3"] },
  { left: 52.2, top: 37.3, width: 8.6, height: 6.6, lid: ["#f6ddd5", "#f0d4c9"] },
];

/** Épaule du bras levé (point de rotation), en % de l'image. Calques : nota-body.webp + nota-arm.webp. */
const SHOULDER = `${(231 / 337) * 100}% ${(285 / 520) * 100}%`;

/** Pose du bras : au repos (levé, comme sur l'image) ou main sous le menton (réflexion). */
const ARM_IDLE = "rotate(0deg) scale(1) rotate(-20deg) scaleY(1) rotate(20deg)";
// Le bras pivote vers le visage et se retourne pour que les doigts arrivent sous le menton.
const ARM_CHIN = "rotate(-134deg) scale(0.8) rotate(-20deg) scaleY(-1) rotate(20deg)";

const INK = "#3a2418"; // brun des yeux de la mascotte : traits du nuage et regard

/** Yeux dessinés qui regardent en l'air vers le nuage (posés sur les yeux de l'image). */
function LookUpEyes({ blur }: { blur: number }) {
  return (
    <>
      {EYES.map((eye) => (
        <motion.span
          key={eye.left}
          className="absolute overflow-hidden rounded-[50%]"
          style={{
            left: `${eye.left - 0.6}%`,
            top: `${eye.top - 0.4}%`,
            width: `${eye.width + 1.2}%`,
            height: `${eye.height + 0.8}%`,
            background: `linear-gradient(180deg, ${eye.lid[0]} 0%, ${eye.lid[1]} 100%)`,
            filter: `blur(${blur}px)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.span
            className="absolute rounded-full"
            style={{
              left: "2%",
              top: "-2%",
              width: "64%",
              height: "74%",
              background: `radial-gradient(circle at 40% 35%, #5c3a26 0%, ${INK} 55%, #1c0f08 100%)`,
            }}
            initial={{ x: "22%", y: "22%" }}
            animate={{ x: "0%", y: "0%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="absolute rounded-full bg-white" style={{ left: "18%", top: "14%", width: "30%", height: "30%" }} />
            <span className="absolute rounded-full bg-white/80" style={{ left: "58%", top: "55%", width: "14%", height: "14%" }} />
          </motion.span>
        </motion.span>
      ))}
    </>
  );
}

/** Nuage de pensée avec « ? », relié à la tête par deux petites bulles. */
function ThoughtCloud({ width, height }: { width: number; height: number }) {
  const w = width * 0.95;
  const pop = (delay: number) => ({
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring" as const, stiffness: 320, damping: 16, delay },
    style: { transformBox: "fill-box" as const, transformOrigin: "center" },
  });
  const circles: [number, number, number][] = [
    [32, 50, 19], [52, 32, 23], [80, 34, 20], [95, 54, 16], [64, 60, 21], [38, 63, 14],
  ];
  return (
    <motion.svg
      viewBox="0 0 130 110"
      width={w}
      height={(w * 110) / 130}
      className="pointer-events-none absolute overflow-visible"
      style={{ left: -width * 0.66, top: -height * 0.5 }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* petites bulles : de la tête vers le nuage */}
      <motion.circle cx="117" cy="98" r="4" fill="#fff" stroke={INK} strokeWidth="2.2" {...pop(0)} />
      <motion.circle cx="105" cy="84" r="6.5" fill="#fff" stroke={INK} strokeWidth="2.2" {...pop(0.15)} />
      {/* nuage (contour = cercles bruns, remplissage = cercles blancs par-dessus) */}
      <motion.g {...pop(0.3)}>
        <motion.g animate={{ y: [0, -2.5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
          {circles.map(([cx, cy, r]) => (
            <circle key={`o${cx}`} cx={cx} cy={cy} r={r + 2.4} fill={INK} />
          ))}
          {circles.map(([cx, cy, r]) => (
            <circle key={`i${cx}`} cx={cx} cy={cy} r={r} fill="#fff" />
          ))}
          <motion.text
            x="63"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-jost)"
            fontWeight="600"
            fontSize="38"
            fill={INK}
            style={{ transformBox: "fill-box", transformOrigin: "50% 80%" }}
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            ?
          </motion.text>
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

/**
 * La mascotte : un petit flacon d'échantillon qui flotte doucement.
 * Quand elle réfléchit : main sous le menton, regard vers le haut et nuage « ? ».
 * `size` règle la largeur de référence ; la hauteur suit les proportions du flacon.
 */
export function Nota({ size = 64, thinking = false }: { size?: number; thinking?: boolean }) {
  const height = Math.round(size * 1.45);
  const width = Math.round(height * NOTA_RATIO);
  return (
    <div className="relative shrink-0" style={{ width, height: height + 6 }} aria-hidden>
      {/* ombre au sol : rétrécit quand le flacon s'élève */}
      <motion.span
        className="absolute bottom-0 left-1/2 h-1.5 -translate-x-1/2 rounded-[50%] bg-black/15 blur-[1px]"
        style={{ width: width * 0.8 }}
        animate={{ scaleX: [1, thinking ? 0.94 : 0.8, 1] }}
        transition={{ duration: thinking ? 2.6 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-0 top-0"
        style={{ transformOrigin: "50% 100%" }}
        animate={
          thinking
            ? // réflexion : la tête penche vers le nuage, presque immobile
              { y: [0, -2, 0], rotate: [-5, -7, -5], scaleY: 1 }
            : { y: [0, -6, 0], rotate: [-2, 2, -2], scaleY: [1, 1.02, 1] }
        }
        transition={{ duration: thinking ? 2.6 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/nota-body.webp" alt="" width={width} height={height} priority draggable={false} />

        {/* regard vers le haut pendant la réflexion */}
        <AnimatePresence>{thinking && <LookUpEyes key="regard" blur={width > 70 ? 0.3 : 0} />}</AnimatePresence>

        {/* paupières posées sur les yeux : elles se ferment brièvement pour cligner */}
        {EYES.map((eye) => (
          <motion.span
            key={eye.left}
            className="absolute rounded-[50%]"
            style={{
              left: `${eye.left}%`,
              top: `${eye.top}%`,
              width: `${eye.width}%`,
              height: `${eye.height}%`,
              background: `linear-gradient(180deg, ${eye.lid[0]} 0%, ${eye.lid[1]} 100%)`,
              borderBottom: `${Math.max(1.5, width / 70)}px solid ${INK}`,
              transformOrigin: "50% 0%",
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 1, 0, 0, 1, 0, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              // un clignement, puis un double clignement de temps en temps
              times: [0, 0.42, 0.45, 0.48, 0.9, 0.93, 0.96, 1],
              ease: "easeInOut",
            }}
          />
        ))}

        {/* bras : levé au repos, main sous le menton pendant la réflexion */}
        <div
          className="absolute inset-0"
          style={{
            transformOrigin: SHOULDER,
            transform: thinking ? ARM_CHIN : ARM_IDLE,
            transition: "transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1)",
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ transformOrigin: SHOULDER }}
            animate={
              thinking
                ? // le doigt tapote doucement le menton
                  { rotate: [0, 0, -5, 0, -5, 0, 0] }
                : // au repos : un petit salut de temps en temps
                  { rotate: [0, 0, -12, 2, -8, 0, 0] }
            }
            transition={
              thinking
                ? { duration: 2.4, repeat: Infinity, times: [0, 0.4, 0.5, 0.6, 0.7, 0.8, 1], ease: "easeInOut" }
                : { duration: 6, repeat: Infinity, times: [0, 0.55, 0.65, 0.72, 0.8, 0.88, 1], ease: "easeInOut" }
            }
          >
            <Image src="/nota-arm.webp" alt="" width={width} height={height} draggable={false} />
          </motion.div>
        </div>
      </motion.div>

      {/* nuage de pensée */}
      <AnimatePresence>{thinking && <ThoughtCloud key="nuage" width={width} height={height} />}</AnimatePresence>
    </div>
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
      <Nota size={84} thinking={loading && !reply} />
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
