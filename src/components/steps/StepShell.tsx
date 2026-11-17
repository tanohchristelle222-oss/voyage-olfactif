"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { STEP_LABELS, useJourney } from "@/lib/journey";

/** Cadre commun des pages d'étape : fond, retour à la carte, progression. */
export default function StepShell({
  step,
  tint = ["#e9ecd6", "#f5f3ee"],
  children,
}: {
  step: number;
  tint?: [string, string];
  children: React.ReactNode;
}) {
  const { journey } = useJourney();

  return (
    <div className="relative flex-1 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full blur-3xl" style={{ background: tint[0] }} />
        <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full blur-3xl" style={{ background: tint[1] }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/voyage" className="group inline-flex items-center gap-2 text-sm text-navy/70 transition hover:text-navy">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Retour à la carte
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-navy/55">
              Étape {step} sur {STEP_LABELS.length}
            </span>
            <ol className="flex items-center gap-1.5" aria-label="Progression">
              {STEP_LABELS.map((label, i) => {
                const n = i + 1;
                const done = journey.completed.includes(n);
                const active = n === step;
                return (
                  <li key={n} title={label}>
                    <motion.span
                      initial={false}
                      animate={{ width: active ? 28 : 10 }}
                      className={`block h-2.5 rounded-full ${
                        active ? "bg-navy" : done ? "bg-[#a4b26a]" : "bg-navy/15"
                      }`}
                    />
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
