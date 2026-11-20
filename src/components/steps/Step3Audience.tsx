"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NotaChat from "@/components/NotaChat";
import { completeStep, EMPTY_ANSWER, saveAnswer, saveField, useJourney } from "@/lib/journey";
import StepShell from "./StepShell";
import { Card, ChipGroup, Field, fieldClass, NextBar, RadioCards, SavedBadge, StepHeader } from "./ui";

const STEP = 3;

const GENDERS = [
  { value: "mixte", label: "Mixte / Non-genré", desc: "Création universelle et contemporaine" },
  { value: "femme", label: "Féminin", desc: "Sensibilité, délicatesse ou puissance féminine" },
  { value: "homme", label: "Masculin", desc: "Élégance, caractère ou fraîcheur masculine" },
  { value: "niche_libre", label: "Libre & Niche", desc: "L'art du sillage sans aucune frontière" },
];

const AGE_RANGES = ["18 - 25 ans", "26 - 35 ans", "36 - 50 ans", "50 ans et plus", "Intergénérationnel"];

const LIFESTYLES = [
  "Urbain & Sophistiqué",
  "Éco-conscient & Engagé",
  "Esthète & Amateur d'art",
  "Minimaliste & Pur",
  "Aventurier & Voyageur",
  "Romantique & Poétique",
  "Hédoniste & Festif",
  "Professionnel exigeant",
];

const PRICE_TIERS = [
  { value: "accessible", label: "Accessible (35 € - 65 €)", desc: "Parfumerie démocratique et grand public" },
  { value: "premium", label: "Premium (70 € - 130 €)", desc: "Standard de la belle parfumerie sélective" },
  { value: "haute_parfumerie", label: "Haute Parfumerie (135 € - 240 €)", desc: "Matières d'exception & flaconnage de luxe" },
  { value: "prestige", label: "Prestige d'Art (250 € +)", desc: "Édition numérotée, ultra-niche et collection" },
];

const CHANNELS = [
  "Site e-commerce D2C",
  "Boutique en propre",
  "Concept stores & Boutiques de créateurs",
  "Grands magasins de luxe (Le Bon Marché, Harrods...)",
  "Hôtels, Spas & Salons exclusifs",
  "Réseaux de parfumerie sélective",
];

export default function Step3Audience() {
  const router = useRouter();
  const { journey } = useJourney();
  const answer = journey.answers[STEP] ?? EMPTY_ANSWER;
  const project = journey.answers[2]?.fields?.name || "votre parfum";

  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { text = "", tags = [], fields = {} } = answer;
  const gender = fields.gender ?? "mixte";
  const priceTier = fields.priceTier ?? "premium";
  const age = fields.age ?? "26 - 35 ans";

  const canContinue = gender.length > 0 && priceTier.length > 0;

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
    setTimeout(() => router.push("/etape/4"), 400);
  }

  const context = `L'utilisateur est à l'étape 3 « Votre cible ». Projet : ${project}. Cible de genre : ${gender}. Tranche d'âge : ${age}. Positionnement prix : ${priceTier}. Style de vie & Canaux : ${
    tags.join(", ") || "Non précisés"
  }. Descriptif : "${
    text.trim() || "(non renseigné)"
  }". Aide-le à affiner le profil de sa clientèle et l'adéquation entre le prix et les ingrédients olfactifs.`;

  return (
    <StepShell step={STEP} tint={["#e9ecd6", "#ebe6ef"]}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="space-y-6">
          <StepHeader
            eyebrow="Étape 3 · Le Public & Le Marché"
            title="À qui s'adresse votre création ?"
            accent="#7f8f2a"
            intro="Comprendre qui portera votre parfum permet à nos parfumeurs d'ajuster le sillage, la rémanence sur peau et le niveau de sophistication des matières premières."
          />

          <Card delay={0.2}>
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                  Profil de votre clientèle
                </h2>
                <p className="text-xs sm:text-sm text-navy/55">
                  Genre, tranches d&apos;âge et univers de consommation.
                </p>
              </div>
              <SavedBadge show={saved} />
            </div>

            <div className="mt-5 space-y-5">
              <RadioCards
                title="Cible de genre privilégiée"
                options={GENDERS}
                selected={gender}
                onSelect={(val) => updateField("gender", val)}
              />

              <ChipGroup
                title="Tranche d'âge principale"
                options={AGE_RANGES}
                selected={age ? [age] : []}
                onToggle={(val) => updateField("age", val)}
              />

              <ChipGroup
                title="Style de vie & Affinités du persona"
                options={LIFESTYLES}
                selected={tags}
                onToggle={toggleTag}
                helper="Sélectionnez plusieurs styles"
              />

              <RadioCards
                title="Positionnement prix au flacon de vente"
                options={PRICE_TIERS}
                selected={priceTier}
                onSelect={(val) => updateField("priceTier", val)}
              />

              <ChipGroup
                title="Canaux de distribution prévus"
                options={CHANNELS}
                selected={tags}
                onToggle={toggleTag}
              />

              <Field
                label="Décrivez en quelques mots votre client idéal (facultatif)"
                htmlFor="cible-persona"
                hint="Ses habitudes, ses marques favorites, sa façon de se parfumer..."
              >
                <textarea
                  id="cible-persona"
                  rows={3}
                  value={text}
                  onChange={(e) => {
                    saveAnswer(STEP, { text: e.target.value });
                    setSaved(true);
                  }}
                  placeholder="Ex. : Une femme active de 32 ans qui cherche un sillage signature élégant pour le bureau, sans être entêtant, sensible aux produits naturels et aux belles matières..."
                  className={`resize-none ${fieldClass}`}
                />
              </Field>
            </div>
          </Card>

          <NextBar
            canContinue={canContinue}
            hint="Sélectionnez votre cible de genre et le positionnement prix pour continuer."
            prevUrl="/etape/2"
            onNext={next}
          />
        </div>

        {/* Colonne latérale Nota IA */}
        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro="Bien cibler son public est la clé du succès d'un parfum ! Dites-moi qui portera ce parfum et dans quel univers de prix vous souhaitez vous inscrire : je vérifierai que votre création s'adresse au bon profil."
            context={context}
            canAsk={canContinue}
            disabledHint="Choisissez un genre et un positionnement pour demander conseil."
            askLabel="Vérifier la cohérence de ma cible avec Nota"
            firstRequest={() => ({
              content: `Ma cible est : genre ${gender}, âge ${age}, positionnement ${priceTier}. Style de vie : ${
                tags.join(", ") || "non précisé"
              }. Est-ce cohérent avec l'idée de mon parfum ?`,
              display: "Nota, mon positionnement cible est-il bien ajusté ?",
            })}
          />
        </div>
      </motion.div>
    </StepShell>
  );
}
