"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NotaChat from "@/components/NotaChat";
import { completeStep, EMPTY_ANSWER, PRODUCT_TYPES, saveAnswer, saveField, useJourney } from "@/lib/journey";
import StepShell from "./StepShell";
import { Card, ChipGroup, Field, fieldClass, NextBar, RadioCards, SavedBadge, StepHeader } from "./ui";

const STEP = 2;

const MOODS = [
  "Solaire & Lumineux",
  "Frais & Minéral",
  "Boisé & Envoûtant",
  "Floral Délicat",
  "Épicé & Vibrant",
  "Gourmand & Réconfortant",
  "Poudré & Cocon",
  "Marin & Aquatique",
  "Cuiré & Animal",
  "Aromatique & Vert",
];

const MOMENTS = [
  "Au quotidien / Signature",
  "Soirée d'exception",
  "Printemps / Été",
  "Automne / Hiver",
  "Après le sport / Évasion",
  "Nuit & Intimité",
];

const FORMAT_OPTIONS = [
  { value: "50ml", label: "Flacon 50 ml", desc: "Format classique et élégant" },
  { value: "100ml", label: "Flacon 100 ml", desc: "Grand format généreux" },
  { value: "30ml_nomade", label: "30 ml Nomade", desc: "Format sac & voyage" },
  { value: "rechargeable", label: "Flacon Rechargeable", desc: "Conception durable & luxe" },
];

export default function Step2Project() {
  const router = useRouter();
  const { journey } = useJourney();
  const answer = journey.answers[STEP] ?? EMPTY_ANSWER;
  const house = journey.answers[1];
  const houseName = house?.fields?.name?.trim();

  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { text = "", tags = [], fields = {} } = answer;
  const projectName = fields.name ?? "";
  const productType = fields.productType ?? "Eau de parfum";
  const format = fields.format ?? "50ml";

  const canContinue = projectName.trim().length >= 2 || text.trim().length >= 8 || tags.length > 0;

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
    setTimeout(() => router.push("/etape/3"), 400);
  }

  const context = `L'utilisateur est à l'étape 2 « Votre projet ». Maison : ${houseName || "Non précisée"}. Nom du parfum : ${
    projectName || "Sans titre"
  }. Type : ${productType}. Ambiance & Tags : ${tags.join(", ") || "aucun"}. Récit de l'idée : "${
    text.trim() || "(en cours d'écriture)"
  }". Aide-le à préciser son univers sensoriel, les émotions et l'histoire olfactive sans trop aborder les contraintes techniques qui viendront après.`;

  return (
    <StepShell step={STEP} tint={["#ebe6ef", "#e9ecd6"]}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="space-y-6">
          <StepHeader
            eyebrow="Étape 2 · L'Émotion & Le Produit"
            title="Votre projet de parfum"
            accent="#9678b0"
            intro={
              <>
                Un souvenir, un lieu, une émotion… Donnez une âme à cette création
                {houseName ? (
                  <>
                    {" "}
                    pour <strong className="font-semibold text-navy">{houseName}</strong>
                  </>
                ) : null}
                .
              </>
            }
          />

          <Card delay={0.2}>
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                  Définir le projet
                </h2>
                <p className="text-xs sm:text-sm text-navy/55">
                  Nom de code et forme que prendra votre fragrance.
                </p>
              </div>
              <SavedBadge show={saved} />
            </div>

            <div className="mt-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom de code du parfum" htmlFor="projet-nom">
                  <input
                    id="projet-nom"
                    value={projectName}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Ex. : Sillage d'Or, Aube Sauvage..."
                    className={fieldClass}
                  />
                </Field>

                <Field label="Type de produit" htmlFor="projet-type">
                  <select
                    id="projet-type"
                    value={productType}
                    onChange={(e) => updateField("productType", e.target.value)}
                    className={`${fieldClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path d=%22M2 4l4 4 4-4%22 fill=%22none%22 stroke=%22%230b1215%22 stroke-width=%221.5%22/></svg>')] bg-[length:12px] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <RadioCards
                title="Format principal de distribution"
                options={FORMAT_OPTIONS}
                selected={format}
                onSelect={(val) => updateField("format", val)}
              />

              <Field
                label="Racontez l'histoire et l'émotion de ce parfum"
                htmlFor="projet-histoire"
                hint="Qu'évoque-t-il ? (lieu, sensation, lumière...)"
              >
                <textarea
                  id="projet-histoire"
                  rows={5}
                  value={text}
                  onChange={(e) => {
                    saveAnswer(STEP, { text: e.target.value });
                    setSaved(true);
                  }}
                  placeholder="Ex. : L'odeur d'un verger d'agrumes après un orage d'été en Méditerranée, la fraîcheur des feuilles mouillées mêlée à la chaleur de la terre et du bois..."
                  className={`resize-none ${fieldClass}`}
                />
              </Field>

              <ChipGroup
                title="Ambiance & Sensations recherchées"
                options={MOODS}
                selected={tags}
                onToggle={toggleTag}
                helper="Choisissez 1 à 4 adjectifs"
              />

              <ChipGroup
                title="Moments & Saisons idéales"
                options={MOMENTS}
                selected={tags}
                onToggle={toggleTag}
              />
            </div>
          </Card>

          <NextBar
            canContinue={canContinue}
            hint="Donnez un nom, un court descriptif ou choisissez une ambiance pour avancer."
            prevUrl="/etape/1"
            onNext={next}
          />
        </div>

        {/* Colonne latérale Nota IA */}
        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro={`${
              houseName ? `C'est un plaisir de façonner ce projet pour ${houseName} ! ` : ""
            }Décrivez l'émotion, le moment ou l'atmosphère qui vous inspire. Je vous aiderai à traduire ces sensations en pistes olfactives.`}
            context={context}
            canAsk={canContinue}
            disabledHint="Indiquez quelques mots ou une ambiance pour échanger avec Nota."
            askLabel="Affiner mon récit avec Nota"
            firstRequest={() => ({
              content: `Voici mon idée de parfum : "${text.trim() || projectName || "Non renseigné"}". Ambiance : ${
                tags.join(", ") || "à préciser"
              }. Que penses-tu de cette direction et comment puis-je l'enrichir ?`,
              display: "Nota, que penses-tu de mon idée de parfum ?",
            })}
          />
        </div>
      </motion.div>
    </StepShell>
  );
}
