"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NotaChat from "@/components/NotaChat";
import { completeStep, EMPTY_ANSWER, saveAnswer, saveField, useJourney } from "@/lib/journey";
import StepShell from "./StepShell";
import { Card, ChipGroup, Field, fieldClass, NextBar, RadioCards, SavedBadge, StepHeader } from "./ui";

const STEP = 4;

const OLFACTIVE_FAMILIES = [
  { value: "Boisé", label: "Boisé", desc: "Cèdre noble, Santal velouté, Vétiver, Patchouli terreux" },
  { value: "Floral", label: "Floral", desc: "Rose de Mai, Jasmin Sambac, Fleur d'oranger, Iris délicat" },
  { value: "Ambré / Oriental", label: "Ambré / Oriental", desc: "Vanille Bourbon, Fève tonka, Benjoin, Résines chaudes" },
  { value: "Hespéridé", label: "Hespéridé (Agrumes)", desc: "Bergamote de Calabre, Mandarine jaune, Pamplemousse" },
  { value: "Aromatique", label: "Aromatique", desc: "Lavande fine, Sauge sclarée, Romarin, Basilic pourpre" },
  { value: "Gourmand", label: "Gourmand & Réconfortant", desc: "Amande douce, Cacao amer, Praline dorée, Caramel" },
  { value: "Cuiré", label: "Cuiré & Fumé", desc: "Cuir velouté, Bois de bouleau, Tabac blond, Encens noble" },
  { value: "Aquatique", label: "Aquatique & Marin", desc: "Brise d'océan, Accord ozonique, Algues marines, Sel fin" },
];

const HEAD_NOTES = [
  "Bergamote d'Italie",
  "Mandarine d'Italie",
  "Citron de Sicile",
  "Poivre rose",
  "Cardamome verte",
  "Gingembre frais",
  "Baies de genièvre",
  "Menthe froissée",
];

const HEART_NOTES = [
  "Rose de Grasse",
  "Jasmin Sambac",
  "Fleur d'oranger",
  "Iris de Florence",
  "Lavande fine",
  "Thé noir fumé",
  "Géranium d'Égypte",
  "Ylang-Ylang",
];

const BASE_NOTES = [
  "Bois de Cèdre",
  "Santal crémeux",
  "Patchouli d'Indonésie",
  "Vétiver d'Haïti",
  "Vanille Bourbon",
  "Muscs blancs soyeux",
  "Ambre gris",
  "Fève tonka",
];

const INTENSITY_OPTIONS = [
  { value: "intime", label: "Intime & Peau", desc: "Sillage doux et personnel, se découvre de près" },
  { value: "modere", label: "Modéré & Élégant", desc: "Parfait équilibre pour le bureau et les sorties" },
  { value: "intense", label: "Intense & Signature", desc: "Projection remarquable qui marque les esprits" },
  { value: "opulent", label: "Opulent & Impérial", desc: "Sillage magnétique d'une très longue persistance" },
];

export default function Step4FragranceFamily() {
  const router = useRouter();
  const { journey } = useJourney();
  const answer = journey.answers[STEP] ?? EMPTY_ANSWER;
  const project = journey.answers[2]?.fields?.name || "votre création";

  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { text = "", tags = [], fields = {} } = answer;
  const family = fields.family ?? "Boisé";
  const intensity = fields.intensity ?? "modere";

  const canContinue = family.length > 0;

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
    setTimeout(() => router.push("/etape/5"), 400);
  }

  const context = `L'utilisateur est à l'étape 4 « Famille olfactive ». Projet : ${project}. Famille principale : ${family}. Intensité souhaitée : ${intensity}. Notes sélectionnées : ${
    tags.join(", ") || "aucune note encore choisie"
  }. Notes libres de l'utilisateur : "${
    text.trim() || "(vide)"
  }". Agis en tant qu'expert parfumeur Givaudan : donne-lui des conseils d'accords harmonieux entre ses notes de tête, cœur et fond.`;

  return (
    <StepShell step={STEP} tint={["#ebe6ef", "#e9e0cf"]}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="space-y-6">
          <StepHeader
            eyebrow="Étape 4 · La Pyramide Olfactive"
            title="Quelle est sa famille olfactive ?"
            accent="#9678b0"
            intro="Explorez les 8 grandes familles de la parfumerie mondiale et composez les accords qui donneront toute son identité à votre fragrance."
          />

          <Card delay={0.2}>
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                  1. Famille olfactive maîtresse
                </h2>
                <p className="text-xs sm:text-sm text-navy/55">
                  L&apos;ossature dominante de votre parfum.
                </p>
              </div>
              <SavedBadge show={saved} />
            </div>

            <div className="mt-5">
              <RadioCards
                title="Famille olfactive principale"
                options={OLFACTIVE_FAMILIES}
                selected={family}
                onSelect={(val) => updateField("family", val)}
              />
            </div>
          </Card>

          {/* Pyramide des notes */}
          <Card delay={0.28}>
            <div className="border-b border-navy/5 pb-3">
              <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                2. Les notes de la pyramide
              </h2>
              <p className="text-xs sm:text-sm text-navy/55">
                Sélectionnez les matières qui vous inspirent pour chaque étape de l&apos;évaporation.
              </p>
            </div>

            <div className="mt-5 space-y-6">
              <div className="rounded-2xl bg-cream/50 p-4 ring-1 ring-navy/10">
                <ChipGroup
                  title="Notes de tête (les premières impressions · 15 min)"
                  options={HEAD_NOTES}
                  selected={tags}
                  onToggle={toggleTag}
                  helper="Fraîcheur & Envolée"
                />
              </div>

              <div className="rounded-2xl bg-cream/50 p-4 ring-1 ring-navy/10">
                <ChipGroup
                  title="Notes de cœur (l'âme et la signature · 2 à 6 heures)"
                  options={HEART_NOTES}
                  selected={tags}
                  onToggle={toggleTag}
                  helper="Corps & Rayonnement"
                />
              </div>

              <div className="rounded-2xl bg-cream/50 p-4 ring-1 ring-navy/10">
                <ChipGroup
                  title="Notes de fond (la persistance et la rémanence · 8h+)"
                  options={BASE_NOTES}
                  selected={tags}
                  onToggle={toggleTag}
                  helper="Profondeur & Sillage"
                />
              </div>

              <RadioCards
                title="Intensité et projection du sillage"
                options={INTENSITY_OPTIONS}
                selected={intensity}
                onSelect={(val) => updateField("intensity", val)}
              />

              <Field
                label="Matières précieuses ou inspirations olfactives libres (facultatif)"
                htmlFor="famille-libres"
                hint="Une épice rare, un souvenir de voyage, une fleur particulière..."
              >
                <textarea
                  id="famille-libres"
                  rows={3}
                  value={text}
                  onChange={(e) => {
                    saveAnswer(STEP, { text: e.target.value });
                    setSaved(true);
                  }}
                  placeholder="Ex. : J'aimerais beaucoup une touche de figue verte sauvage et un fond ambré très chaud..."
                  className={`resize-none ${fieldClass}`}
                />
              </Field>
            </div>
          </Card>

          <NextBar
            canContinue={canContinue}
            hint="Choisissez au moins une famille olfactive principale pour poursuivre."
            prevUrl="/etape/3"
            onNext={next}
          />
        </div>

        {/* Colonne latérale Nota IA */}
        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro="Nous entrons dans le saint des saints de la parfumerie ! La pyramide olfactive raconte l'histoire du parfum sur la peau. Choisissez vos accords et demandez-moi conseil pour équilibrer tête, cœur et fond."
            context={context}
            canAsk={canContinue}
            disabledHint="Choisissez une famille olfactive pour demander conseil à Nota."
            askLabel="Consulter Nota sur l'harmonie des notes"
            firstRequest={() => ({
              content: `J'ai choisi la famille ${family} avec les notes : ${
                tags.join(", ") || "pas encore de notes choisies"
              }. Intensité souhaitée : ${intensity}. Que penses-tu de cette formule et quelles notes suggères-tu d'associer ?`,
              display: "Nota, que penses-tu de l'accord de mes notes ?",
            })}
          />
        </div>
      </motion.div>
    </StepShell>
  );
}
