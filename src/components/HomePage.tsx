"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JourneyMap from "@/components/JourneyMap";
import { useLocale } from "@/lib/locale";
import { HOME_COPY } from "@/lib/home-copy";
import { TOTAL_STEPS, createProject } from "@/lib/journey";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function ProgressiveTitle({ text }: { text: string }) {
  const [length, setLength] = useState(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    let current = 0;
    const delay = setTimeout(() => {
      interval = setInterval(() => {
        current = Math.min(current + 1, text.length);
        setLength(current);
        if (current === text.length) clearInterval(interval);
      }, 55);
    }, 350);
    return () => { clearTimeout(delay); clearInterval(interval); };
  }, [text, reducedMotion]);
  return <span className="relative block">
    <span className="sr-only">{text}</span>
    <span className="invisible" aria-hidden="true">{text}</span>
    <span className="absolute inset-0" aria-hidden="true">{reducedMotion ? text : text.slice(0, length)}</span>
  </span>;
}



export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();
  const text = HOME_COPY[locale];

  function startNew() {
    createProject();
    router.push("/voyage");
  }

  return (
    <div lang={locale} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
      {/* Bandeau principal */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="grid items-center gap-8 overflow-hidden rounded-[2rem] p-6 shadow-xl shadow-navy/5 ring-1 ring-navy/5 sm:p-10 lg:grid-cols-[1.05fr_1fr]"
        style={{ background: "linear-gradient(100deg, #e9ecd6 0%, #f1eff0 42%, #ebe6ef 62%, #e9e0cf 100%)" }}
      >
        <div>
          <motion.p {...fadeUp(0.15)} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/60">
            Givaudan Horizon
          </motion.p>
          <motion.h1
            {...fadeUp(0.25)}
            className="mt-4 font-display text-[clamp(2.4rem,4.6vw,3.8rem)] font-medium leading-[1.05]"
          >
            <ProgressiveTitle key={text.title} text={text.title} />
          </motion.h1>
          <motion.p {...fadeUp(0.38)} className="mt-5 max-w-lg leading-relaxed text-navy/70">
            {text.intro(TOTAL_STEPS)}
          </motion.p>
          <motion.p {...fadeUp(0.42)} className="mt-3 max-w-lg text-sm leading-relaxed text-navy/70">{text.scope}</motion.p>
          <motion.div {...fadeUp(0.5)} className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={startNew}
              className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/25 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {text.start}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <Link
              href="/projets"
              className="rounded-full bg-white/70 px-7 py-3 text-sm font-semibold text-navy ring-1 ring-navy/80 transition hover:-translate-y-0.5 hover:bg-white"
            >
              {text.projects}
            </Link>
          </motion.div>
        </div>

        {/* Aperçu animé de la roadmap */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl bg-white/50 shadow-lg shadow-navy/5 ring-1 ring-white"
        >
          <h2 className="px-6 pt-5 font-display text-xl font-medium">{text.journeyTitle}</h2>
          <JourneyMap preview />
        </motion.div>
      </motion.section>

      {/* Les trois temps du voyage */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {text.phases.map((p, i) => (
          <motion.div
            key={p.n}
            {...fadeUp(0.6 + i * 0.1)}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 ring-1 ring-navy/5"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 300, damping: 15 }}
              className="grid h-10 w-10 place-items-center rounded-full font-display text-base font-semibold text-white"
              style={{ background: p.color }}
            >
              {p.n}
            </motion.span>
            <h2 className="mt-5 font-display text-xl font-medium">{p.title}</h2>
            <p className="mt-1 text-sm text-navy/60">{p.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
