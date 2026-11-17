"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NotaChat from "@/components/NotaChat";
import { completeStep, EMPTY_ANSWER, PRODUCT_TYPES, saveAnswer, saveField, useJourney } from "@/lib/journey";
import StepShell from "./StepShell";
import { Card, ChipGroup, fieldClass, NextBar, SavedBadge, StepHeader } from "./ui";

const STEP = 2;

const GROUPS = [
  { title: "Ambiance", options: ["Frais", "Boisé", "Floral", "Gourmand", "Épicé", "Poudré", "Marin"] },
  { title: "Saison & moment", options: ["Été", "Hiver", "Soirée", "Au quotidien"] },
  { title: "Type de produit", options: PRODUCT_TYPES },
];

export default function StepProject() {
  const router = useRouter();
  const { journey } = useJourney();
  const answer = journey.answers[STEP] ?? EMPTY_ANSWER;
  const house = journey.answers[1];
  const houseName = house?.fields?.name?.trim();
  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { text, tags } = answer;
  const canContinue = text.trim().length >= 10 || tags.length > 0;

  function toggle(tag: string) {
    saveAnswer(STEP, { tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] });
    setSaved(true);
  }

  function next() {
    completeStep(STEP);
    setLeaving(true);
    setTimeout(() => router.push("/voyage"), 450);
  }

  const houseContext = houseName
    ? `Sa maison : ${houseName} (secteur : ${house?.fields?.sector || "non précisé"}, univers : ${house?.tags.join(", ") || "non précisé"}).`
    : "";
  const context = `L'utilisateur est à l'étape 2 « Votre projet ». ${houseContext} Son idée de parfum : "${
    text.trim() || "(pas encore écrite)"
  }". Mots-clés : ${tags.join(", ") || "aucun"}. Aide-le à préciser son idée (ambiance, émotion, souvenir, occasion, type de produit) en cohérence avec sa maison. Ne parle pas encore de la cible ni des familles olfactives précises : ce sont les étapes suivantes.`;

  return (
    <StepShell step={STEP} tint={["#ebe6ef", "#e9ecd6"]}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div>
          <StepHeader
            eyebrow="Étape 2 · Votre projet"
            title="Votre projet"
            intro={
              <>
                Un souvenir, une émotion, une envie… Décrivez avec vos mots le parfum dont vous rêvez
                {houseName ? <> pour <strong className="font-semibold text-navy">{houseName}</strong></> : null}. Il
                n&apos;y a pas de mauvaise réponse.
              </>
            }
          />

          <Card>
            <label htmlFor="projet-nom" className="text-sm font-semibold">
              Nom de code du projet <span className="font-normal text-navy/45">(facultatif)</span>
            </label>
            <input
              id="projet-nom"
              value={answer.fields?.name ?? ""}
              onChange={(e) => {
                saveField(STEP, "name", e.target.value);
                setSaved(true);
              }}
              placeholder="Ex. : Aube"
              className={`mt-3 ${fieldClass} py-3`}
            />

            <label htmlFor="projet" className="mt-6 block text-sm font-semibold">
              Racontez-nous votre idée de parfum
            </label>
            <textarea
              id="projet"
              rows={6}
              value={text}
              onChange={(e) => {
                saveAnswer(STEP, { text: e.target.value });
                setSaved(true);
              }}
              placeholder="Ex. : l'odeur d'un jardin après la pluie, quelque chose de lumineux et un peu sucré pour l'été…"
              className={`mt-3 resize-none ${fieldClass}`}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-navy/50">
              <span>{text.length} caractères</span>
              <SavedBadge show={saved} />
            </div>

            <div className="mt-6 space-y-5">
              {GROUPS.map((g) => (
                <ChipGroup key={g.title} title={g.title} options={g.options} selected={tags} onToggle={toggle} />
              ))}
            </div>
          </Card>

          <NextBar
            canContinue={canContinue}
            hint="Écrivez quelques mots ou choisissez une ambiance pour continuer."
            onNext={next}
          />
        </div>

        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro={`${houseName ? `Ravie de travailler pour ${houseName} ! ` : ""}Décrivez une ambiance, un souvenir ou une émotion. Ensuite, je vous aiderai à préciser votre idée.`}
            context={context}
            canAsk={canContinue}
            disabledHint="Écrivez quelques mots ou choisissez une ambiance, puis demandez-moi."
            firstRequest={() => ({
              content: `Voici mon idée de parfum : "${text.trim() || "pas encore écrite"}". Mots-clés : ${
                tags.join(", ") || "aucun"
              }. Qu'en pensez-vous, et que faudrait-il préciser ?`,
              display: "Qu'en pensez-vous ?",
            })}
          />
        </div>
      </motion.div>
    </StepShell>
  );
}
