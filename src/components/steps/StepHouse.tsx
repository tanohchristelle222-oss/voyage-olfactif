"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NotaChat from "@/components/NotaChat";
import { completeStep, EMPTY_ANSWER, saveAnswer, saveField, SECTORS, useJourney } from "@/lib/journey";
import StepShell from "./StepShell";
import { Card, ChipGroup, fieldClass, NextBar, SavedBadge, StepHeader } from "./ui";

const STEP = 1;

const VALUES = ["Luxe", "Naturel", "Minimaliste", "Audacieux", "Engagé", "Accessible", "Artisanal", "Innovant"];

export default function StepHouse() {
  const router = useRouter();
  const { journey } = useJourney();
  const answer = journey.answers[STEP] ?? EMPTY_ANSWER;
  const name = answer.fields?.name ?? "";
  const sector = answer.fields?.sector ?? "";
  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const canContinue = name.trim().length >= 2;

  function touch() {
    setSaved(true);
  }

  function next() {
    completeStep(STEP);
    setLeaving(true);
    setTimeout(() => router.push("/voyage"), 450);
  }

  const summary = `Nom : ${name.trim() || "(non renseigné)"}. Secteur : ${sector || "(non choisi)"}. Univers : ${
    answer.tags.join(", ") || "(non choisi)"
  }. Présentation : "${answer.text.trim() || "(vide)"}".`;

  return (
    <StepShell step={STEP} tint={["#e9e0cf", "#e9ecd6"]}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div>
          <StepHeader
            eyebrow="Étape 1 · La boutique"
            title="Votre maison"
            accent="#9f6e14"
            intro="Avant de parler parfum, faisons connaissance. Présentez-nous la maison ou la marque pour laquelle vous créez ce parfum."
          />

          <Card>
            <label htmlFor="maison-nom" className="text-sm font-semibold">
              Nom de votre maison ou de votre marque
            </label>
            <input
              id="maison-nom"
              value={name}
              onChange={(e) => {
                saveField(STEP, "name", e.target.value);
                touch();
              }}
              placeholder="Ex. : Maison Lumière"
              className={`mt-3 ${fieldClass} py-3`}
            />

            <div className="mt-6 space-y-5">
              <ChipGroup
                title="Votre secteur"
                options={SECTORS}
                selected={sector ? [sector] : []}
                onToggle={(s) => {
                  saveField(STEP, "sector", s === sector ? "" : s);
                  touch();
                }}
              />
              <ChipGroup
                title="L'univers de votre maison"
                options={VALUES}
                selected={answer.tags}
                onToggle={(v) => {
                  saveAnswer(STEP, {
                    tags: answer.tags.includes(v) ? answer.tags.filter((t) => t !== v) : [...answer.tags, v],
                  });
                  touch();
                }}
              />
            </div>

            <label htmlFor="maison-presentation" className="mt-6 block text-sm font-semibold">
              Présentez votre maison en quelques mots <span className="font-normal text-navy/45">(facultatif)</span>
            </label>
            <textarea
              id="maison-presentation"
              rows={4}
              value={answer.text}
              onChange={(e) => {
                saveAnswer(STEP, { text: e.target.value });
                touch();
              }}
              placeholder="Son histoire, ses valeurs, ses produits phares, sa clientèle…"
              className={`mt-3 resize-none ${fieldClass}`}
            />
            <div className="mt-2 flex justify-end text-xs">
              <SavedBadge show={saved} />
            </div>
          </Card>

          <NextBar canContinue={canContinue} hint="Indiquez au moins le nom de votre maison pour continuer." onNext={next} />
        </div>

        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro="Bienvenue ! Je suis ravie de faire votre connaissance. Parlez-moi de votre maison : je vous aiderai à cerner son identité, ce sera la base de votre parfum."
            context={`L'utilisateur est à l'étape 1 « Votre maison ». ${summary} Aide-le à préciser l'identité de sa maison (histoire, valeurs, clientèle, produits phares). Ne parle pas encore du parfum lui-même : c'est l'étape suivante.`}
            canAsk={canContinue}
            disabledHint="Indiquez d'abord le nom de votre maison."
            askLabel="Présenter ma maison à Nota"
            firstRequest={() => ({
              content: `Voici ma maison. ${summary} Qu'en pensez-vous, et que faudrait-il préciser ?`,
              display: "Voici ma maison, qu'en pensez-vous ?",
            })}
          />
        </div>
      </motion.div>
    </StepShell>
  );
}
