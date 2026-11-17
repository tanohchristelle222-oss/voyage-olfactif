"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { replayIntro } from "@/lib/intro";
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
        Givaudan Horizon
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
        Du produit que vous imaginez aux senteurs qui vous inspirent, construisez votre brief en cinq étapes et suivez vos échantillons.
      </motion.p>
      <motion.div {...fade(0.5)} className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href={`/etape/${current}`}
          className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/25 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          {journey.completed.length > 0 ? `Continuer · étape ${current}` : "Commencer mon voyage"}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <button
          onClick={replayIntro}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9f6e14] underline-offset-4 transition hover:underline"
        >
          <span aria-hidden>▶</span> Revoir l&apos;introduction
        </button>
      </motion.div>
      <motion.div {...fade(0.6)} className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-normal not-italic leading-relaxed text-[#8f1c5b]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#ead3e0] bg-[#faedf5] px-3 py-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
          5 étapes à votre rythme
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#ead3e0] bg-[#faedf5] px-3 py-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z" /><path d="m8 12 3 3 5-6" /></svg>
          Sauvegarde automatique
        </span>
      </motion.div>
    </div>
  );
}
