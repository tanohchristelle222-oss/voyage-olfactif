"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Nota } from "@/components/Nota";
import { STEP_LABELS } from "@/lib/journey";
import StepShell from "./StepShell";

/** Page temporaire pour les étapes pas encore codées. */
export default function StepComingSoon({ step }: { step: number }) {
  return (
    <StepShell step={step} tint={["#ebe6ef", "#e9e0cf"]}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mt-16 flex max-w-md flex-col items-center text-center"
      >
        <Nota size={80} />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy/55">Étape {step}</p>
        <h1 className="mt-2 font-display text-4xl font-medium">{STEP_LABELS[step - 1]}</h1>
        <p className="mt-3 text-navy/70">Cette étape du voyage est encore en préparation. Revenez bientôt !</p>
        <Link
          href="/voyage"
          className="mt-8 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/25 transition hover:-translate-y-0.5"
        >
          Retour à la carte
        </Link>
      </motion.div>
    </StepShell>
  );
}
