"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useJourney } from "@/lib/journey";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero({ className = "" }: { className?: string }) {
  const { journey, current } = useJourney();
  return (
    <div className={className}>
      <motion.p
        {...fade(0.1)}
        className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/60"
      >
        Givaudan · Fragrance &amp; Beauty
      </motion.p>
      <motion.h1
        {...fade(0.2)}
        className="mt-3 font-display text-[2.6rem] sm:text-[3.5rem] font-medium leading-[1.05] text-navy"
      >
        Le Voyage Olfactif
      </motion.h1>
      <motion.p
        {...fade(0.35)}
        className="mt-4 max-w-[34rem] text-base sm:text-[1.05rem] leading-relaxed text-navy/75"
      >
        Cinq étapes à travers la pyramide olfactive pour transformer votre idée en brief parfumé —
        et recevoir vos échantillons.
      </motion.p>
      <motion.div {...fade(0.5)} className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href={`/etape/${current}`}
          className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/25 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          {journey.completed.length > 0 ? `Continuer · étape ${current}` : "Commencer le voyage"}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <span className="text-xs text-navy/60">≈ 5 min · Sauvegarde automatique</span>
      </motion.div>
    </div>
  );
}
