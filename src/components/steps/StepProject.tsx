"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NotaChat from "@/components/NotaChat";
import { fragranceState } from "../village/fragrance-state.mjs";
import { completeStep, EMPTY_ANSWER, PRODUCT_TYPES, saveAnswer, saveField, useJourney } from "@/lib/journey";
import { useProfile } from "@/lib/profile";
import StepShell from "./StepShell";
import { Card, ChipGroup, fieldClass, NextBar, SavedBadge, StepHeader } from "./ui";

const STEP = 1;

/** Votre idée */
const IDEA_GROUPS = [
  { title: "Ambiance", options: ["Frais", "Boisé", "Floral", "Gourmand", "Épicé", "Poudré", "Marin"] },
  { title: "Saison & moment", options: ["Été", "Hiver", "Soirée", "Au quotidien"] },
  { title: "Type de produit", options: PRODUCT_TYPES },
];

/** Votre cible */
const TARGET_GROUPS = [
  { title: "Pour qui ?", options: ["Femme", "Homme", "Mixte"] },
  { title: "Tranche d'âge", options: ["18–25 ans", "25–35 ans", "35–50 ans", "50 ans et +"] },
  { title: "Style de vie", options: ["Urbain", "Nature", "Élégant", "Sportif", "Bohème", "Minimaliste"] },
];

const IDEA_OPTIONS = IDEA_GROUPS.flatMap((g) => g.options);
const TARGET_OPTIONS = TARGET_GROUPS.flatMap((g) => g.options);

export default function StepProject() {
  const router = useRouter();
  const { journey } = useJourney();
  const profile = useProfile();
  const answer = journey.answers[STEP] ?? EMPTY_ANSWER;
  const houseName = profile.houseName.trim();
  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { text, tags } = answer;
  const target = answer.fields?.target ?? "";
  const ideaTags = tags.filter((t) => IDEA_OPTIONS.includes(t));
  const targetTags = tags.filter((t) => TARGET_OPTIONS.includes(t));
  const canContinue = text.trim().length >= 10 || ideaTags.length > 0;

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
    ? `Sa maison : ${houseName} (secteur : ${profile.sector || "non précisé"}).`
    : "";
  const targetSummary = `Cible : ${targetTags.join(", ") || "non précisée"}${target.trim() ? ` — "${target.trim()}"` : ""}.`;
  const context = `L'utilisateur est à l'étape 1 « Votre projet ». ${houseContext} Univers olfactif choisi : ${fragranceState(journey).label}. Son idée de parfum : "${
    text.trim() || "(pas encore écrite)"
  }". Mots-clés : ${ideaTags.join(", ") || "aucun"}. ${targetSummary} Aide-le à préciser son idée (ambiance, émotion, occasion, type de produit) et sa cible (à qui s'adresse le parfum). Ne parle pas encore des contraintes ni des familles olfactives : ce sont les étapes suivantes.`;

  return (
    <StepShell step={STEP} tint={["#e9ecd6", "#ebe6ef"]}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div>
          <StepHeader
            eyebrow="Étape 1 · Votre projet"
            title="Votre projet"
            intro={
              <>
                Un souvenir, une émotion, une envie… Décrivez le parfum dont vous rêvez
                {houseName ? <> pour <strong className="font-semibold text-navy">{houseName}</strong></> : null}, puis
                dites-nous à qui il s&apos;adresse.
              </>
            }
          />

          {/* Votre idée */}
          <Card>
            <h2 className="font-display text-lg font-medium">Votre idée</h2>

            <label htmlFor="projet-nom" className="mt-4 block text-sm font-semibold">
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
              rows={5}
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
              {IDEA_GROUPS.map((g) => (
                <ChipGroup key={g.title} title={g.title} options={g.options} selected={tags} onToggle={toggle} />
              ))}
            </div>
          </Card>

          {/* Votre cible */}
          <Card delay={0.32}>
            <h2 className="font-display text-lg font-medium">Votre cible</h2>
            <p className="mt-1 text-sm text-navy/55">À qui s&apos;adresse ce parfum ?</p>

            <div className="mt-5 space-y-5">
              {TARGET_GROUPS.map((g) => (
                <ChipGroup key={g.title} title={g.title} options={g.options} selected={tags} onToggle={toggle} />
              ))}
            </div>

            <label htmlFor="projet-cible" className="mt-6 block text-sm font-semibold">
              Décrivez votre cible en quelques mots <span className="font-normal text-navy/45">(facultatif)</span>
            </label>
            <textarea
              id="projet-cible"
              rows={3}
              value={target}
              onChange={(e) => {
                saveField(STEP, "target", e.target.value);
                setSaved(true);
              }}
              placeholder="Ex. : des jeunes actives qui aiment voyager et cherchent un parfum de tous les jours…"
              className={`mt-3 resize-none ${fieldClass}`}
            />
          </Card>

          <NextBar
            canContinue={canContinue}
            hint="Décrivez votre idée ou choisissez une ambiance pour continuer."
            onNext={next}
          />
        </div>

        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro={`${houseName ? `Ravie de travailler pour ${houseName} ! ` : ""}Décrivez votre idée et votre cible : je vous aiderai à les préciser.`}
            context={context}
            canAsk={canContinue}
            disabledHint="Décrivez votre idée ou choisissez une ambiance, puis demandez-moi."
            firstRequest={() => ({
              content: `Voici mon idée de parfum : "${text.trim() || "pas encore écrite"}". Mots-clés : ${
                ideaTags.join(", ") || "aucun"
              }. ${targetSummary} Qu'en pensez-vous, et que faudrait-il préciser ?`,
              display: "Qu'en pensez-vous ?",
            })}
          />
        </div>
      </motion.div>
    </StepShell>
  );
}
