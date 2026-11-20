"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NotaChat from "@/components/NotaChat";
import { completeStep, EMPTY_ANSWER, saveAnswer, saveField, useJourney } from "@/lib/journey";
import StepShell from "./StepShell";
import { Card, ChipGroup, Field, fieldClass, NextBar, RadioCards, SavedBadge, StepHeader } from "./ui";

const STEP = 5;

const BUDGET_RANGES = [
  { value: "eco", label: "Accessible (< 60 € / kg)", desc: "Parfumerie optimisée à coût maîtrisé" },
  { value: "standard", label: "Équilibré (60 € - 120 € / kg)", desc: "Standard sélectif avec belles matières naturelles" },
  { value: "luxe", label: "Haute Parfumerie (125 € - 240 € / kg)", desc: "Absolus rares, extractions CO2 et fleurs nobles" },
  { value: "prestige", label: "Prestige Illimité (250 € + / kg)", desc: "Création d'art sans aucune contrainte de coût" },
];

const VOLUMES = [
  { value: "pilote", label: "Édition Pilote (300 à 1 000 flacons)", desc: "Test marché & précommandes exclusives" },
  { value: "standard", label: "Lancement Standard (1 000 à 5 000 flacons)", desc: "Production idéale pour boutique & web" },
  { value: "grand", label: "Déploiement Envergure (5 000 à 20 000+ flacons)", desc: "Réseau national ou international" },
];

const TIMELINES = [
  "Lancement express (3 mois)",
  "Rythme standard recommandé (6 mois)",
  "Développement approfondi (12 mois)",
  "À planifier avec mon chargé Givaudan",
];

const ECO_LABELS = [
  "Norme IFRA 51e amendement (sécurité mondiale)",
  "Clean Beauty (sans phtalates, parabènes, BHT)",
  "100% Végane & Cruelty-Free",
  "Matières d'origine naturelle > 90%",
  "Alcool bio de betterave française",
  "Programme éthique Givaudan Sourcing durable",
  "Flaconnage & pompe recyclables",
];

export default function Step5Constraints() {
  const router = useRouter();
  const { journey } = useJourney();
  const answer = journey.answers[STEP] ?? EMPTY_ANSWER;
  const projectName = journey.answers[2]?.fields?.name || "votre parfum";

  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { text = "", tags = [], fields = {} } = answer;
  const budget = fields.budgetPerKg ?? "standard";
  const volume = fields.volume ?? "standard";
  const timeline = fields.timeline ?? "Rythme standard recommandé (6 mois)";

  const canContinue = budget.length > 0 && volume.length > 0;

  function updateField(key: string, value: string) {
    saveField(STEP, key, value);
    setSaved(true);
  }

  function toggleTag(tag: string) {
    const nextTags = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    saveAnswer(STEP, { tags: nextTags });
    setSaved(true);
  }

  function next() {
    completeStep(STEP);
    setLeaving(true);
    setTimeout(() => router.push("/etape/6"), 400);
  }

  const context = `L'utilisateur est à l'étape 5 « Les contraintes ». Projet : ${projectName}. Budget concentré : ${budget}. Volume de production : ${volume}. Calendrier : ${timeline}. Engagements et normes : ${
    tags.join(", ") || "Conformité IFRA standard"
  }. Notes spécifiques : "${
    text.trim() || "(aucune note particulière)"
  }". Rassure l'utilisateur sur la faisabilité technique chez Givaudan, l'excellence de la conformité IFRA et la qualité de notre sourcing éthique.`;

  return (
    <StepShell step={STEP} tint={["#e9e0cf", "#e9ecd6"]}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="space-y-6">
          <StepHeader
            eyebrow="Étape 5 · Le Cadre Technique & Réglementaire"
            title="Les contraintes de votre projet"
            accent="#c28921"
            intro="Donnez le cadre économique, environnemental et temporel de votre création. Givaudan s'assure du strict respect de la sécurité cutanée et des normes internationales."
          />

          <Card delay={0.2}>
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                  1. Budget & Volumes prévisionnels
                </h2>
                <p className="text-xs sm:text-sm text-navy/55">
                  Échelle de production et niveau de coût matière.
                </p>
              </div>
              <SavedBadge show={saved} />
            </div>

            <div className="mt-5 space-y-5">
              <RadioCards
                title="Budget du concentré de parfum (par kg)"
                options={BUDGET_RANGES}
                selected={budget}
                onSelect={(val) => updateField("budgetPerKg", val)}
              />

              <RadioCards
                title="Taille de la première production"
                options={VOLUMES}
                selected={volume}
                onSelect={(val) => updateField("volume", val)}
              />

              <ChipGroup
                title="Calendrier envisagé pour la mise en marché"
                options={TIMELINES}
                selected={timeline ? [timeline] : []}
                onToggle={(val) => updateField("timeline", val)}
              />
            </div>
          </Card>

          <Card delay={0.28}>
            <div className="border-b border-navy/5 pb-3">
              <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                2. Engagements, Clean & Réglementation
              </h2>
              <p className="text-xs sm:text-sm text-navy/55">
                Exigences de formulation pour votre marché cible.
              </p>
            </div>

            <div className="mt-5 space-y-5">
              <ChipGroup
                title="Normes et labels souhaités"
                options={ECO_LABELS}
                selected={tags}
                onToggle={toggleTag}
                helper="Cochez vos priorités"
              />

              <Field
                label="Contraintes particulières ou ingrédients à proscrire (facultatif)"
                htmlFor="contraintes-allergènes"
                hint="Allergènes particuliers, pays aux réglementations spécifiques..."
              >
                <textarea
                  id="contraintes-allergènes"
                  rows={3}
                  value={text}
                  onChange={(e) => {
                    saveAnswer(STEP, { text: e.target.value });
                    setSaved(true);
                  }}
                  placeholder="Ex. : Formule sans colorants artificiels, adaptée pour une distribution aux USA (FDA) et au Moyen-Orient..."
                  className={`resize-none ${fieldClass}`}
                />
              </Field>
            </div>
          </Card>

          <NextBar
            canContinue={canContinue}
            hint="Sélectionnez un budget et un volume pour accéder à vos échantillons et au paiement."
            prevUrl="/etape/4"
            nextLabel="Voir mes échantillons & Valider mon brief"
            onNext={next}
          />
        </div>

        {/* Colonne latérale Nota IA */}
        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro="La technique au service de l'émotion ! Chez Givaudan, nous conjuguons haute naturalité et tenue irréprochable tout en respectant scrupuleusement la réglementation IFRA mondiale. Avez-vous une question sur la faisabilité de votre projet ?"
            context={context}
            canAsk={canContinue}
            disabledHint="Choisissez un budget et un volume pour échanger avec Nota."
            askLabel="Vérifier la faisabilité avec Nota"
            firstRequest={() => ({
              content: `Mes contraintes sont : budget ${budget}, volume ${volume}, calendrier ${timeline}. Normes : ${
                tags.join(", ") || "IFRA standard"
              }. Est-ce que cette configuration est réaliste pour Givaudan ?`,
              display: "Nota, ce cadre de production est-il réaliste ?",
            })}
          />
        </div>
      </motion.div>
    </StepShell>
  );
}
