"use client";

import { AnimatePresence, motion } from "motion/react";

/* Petits éléments partagés par toutes les pages d'étape. */

export const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function StepHeader({
  eyebrow,
  title,
  intro,
  accent = "#7f8f2a",
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  accent?: string;
}) {
  return (
    <>
      <motion.p {...fadeUp(0)} className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>
        {eyebrow}
      </motion.p>
      <motion.h1 {...fadeUp(0.08)} className="mt-2 font-display text-[clamp(2.2rem,4vw,3.4rem)] font-medium leading-tight">
        {title}
      </motion.h1>
      <motion.p {...fadeUp(0.16)} className="mt-3 max-w-xl text-navy/70">
        {intro}
      </motion.p>
    </>
  );
}

export function Card({ children, delay = 0.26 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="mt-6 rounded-3xl bg-white/85 p-5 shadow-xl shadow-navy/5 ring-1 ring-navy/5 backdrop-blur sm:p-6"
    >
      {children}
    </motion.div>
  );
}

export const fieldClass =
  "w-full rounded-2xl bg-cream/70 p-4 text-[15px] leading-relaxed outline-none ring-1 ring-navy/10 transition placeholder:text-navy/35 focus:bg-white focus:ring-2 focus:ring-navy/30";

export function SavedBadge({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[#6f8a2a]">
          ✓ Sauvegardé automatiquement
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** Groupe de pastilles cliquables (choix multiple, ou unique avec `single`). */
export function ChipGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/55">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <motion.button
              key={opt}
              type="button"
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -2 }}
              onClick={() => onToggle(opt)}
              aria-pressed={on}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                on ? "bg-navy text-white shadow-md shadow-navy/20" : "bg-white text-navy ring-1 ring-navy/15 hover:ring-navy/35"
              }`}
            >
              {on && <span className="mr-1">✓</span>}
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function NextBar({
  canContinue,
  hint,
  onNext,
}: {
  canContinue: boolean;
  hint: string;
  onNext: () => void;
}) {
  return (
    <motion.div {...fadeUp(0.36)} className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-xs text-navy/50">{canContinue ? "Parfait, vous pouvez passer à la suite." : hint}</p>
      <motion.button
        onClick={onNext}
        disabled={!canContinue}
        animate={canContinue ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
        className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-35 disabled:shadow-none"
      >
        Étape suivante
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </motion.button>
    </motion.div>
  );
}
