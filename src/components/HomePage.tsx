"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import JourneyMap from "@/components/JourneyMap";
import { createProject } from "@/lib/journey";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const PHASES = [
  { n: 1, title: "Comprendre", text: "Votre maison, votre projet et votre cible.", color: "#a4b26a" },
  { n: 2, title: "Créer", text: "Familles olfactives et contraintes, guidé par Nota.", color: "#9678b0" },
  { n: 3, title: "Recevoir", text: "Votre brief validé et vos échantillons suivis.", color: "#c28921" },
];

export default function HomePage() {
  const router = useRouter();

  function startNew() {
    createProject();
    router.push("/voyage");
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
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
            Givaudan · Fragrance &amp; Beauty
          </motion.p>
          <motion.h1
            {...fadeUp(0.25)}
            className="mt-4 font-display text-[clamp(2.4rem,4.6vw,3.8rem)] font-medium leading-[1.05]"
          >
            Donnez vie à votre prochain parfum.
          </motion.h1>
          <motion.p {...fadeUp(0.38)} className="mt-5 max-w-lg leading-relaxed text-navy/70">
            Un voyage guidé en 7 étapes à travers la pyramide olfactive : nous comprenons votre besoin, construisons
            votre brief avec vous et vous envoyons vos échantillons.
          </motion.p>
          <motion.div {...fadeUp(0.5)} className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={startNew}
              className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/25 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Commencer un nouveau projet
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <Link
              href="/projets"
              className="rounded-full bg-white/70 px-7 py-3 text-sm font-semibold text-navy ring-1 ring-navy/80 transition hover:-translate-y-0.5 hover:bg-white"
            >
              Mes projets
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
          <JourneyMap preview />
        </motion.div>
      </motion.section>

      {/* Les trois temps du voyage */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {PHASES.map((p, i) => (
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
