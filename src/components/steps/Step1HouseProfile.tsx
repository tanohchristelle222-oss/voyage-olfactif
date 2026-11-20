"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotaChat from "@/components/NotaChat";
import { completeStep, EMPTY_ANSWER, saveAnswer, saveField, SECTORS, useJourney } from "@/lib/journey";
import { saveProfile, useProfile } from "@/lib/profile";
import StepShell from "./StepShell";
import { Card, ChipGroup, Field, fieldClass, NextBar, SavedBadge, StepHeader } from "./ui";

const STEP = 1;

const BRAND_UNIVERSES = [
  "Luxe & Prestige",
  "Naturel & Éco-engagé",
  "Minimaliste & Pur",
  "Audacieux & Niche",
  "Artisanal & Tradition",
  "Contemporain & Urbain",
  "Accessible & Tendance",
  "Sensuel & Solaire",
];

export default function Step1HouseProfile() {
  const router = useRouter();
  const profile = useProfile();
  const { journey } = useJourney();
  const answer = journey.answers[STEP] ?? EMPTY_ANSWER;

  const houseName = answer.fields?.name ?? profile.houseName ?? "";
  const sector = answer.fields?.sector ?? profile.sector ?? "";
  const firstName = answer.fields?.firstName ?? profile.firstName ?? "";
  const role = answer.fields?.role ?? profile.role ?? "";
  const email = answer.fields?.email ?? profile.email ?? "";
  const phone = answer.fields?.phone ?? profile.phone ?? "";
  const country = answer.fields?.country ?? profile.country ?? "";

  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Synchronisation initiale si le profil existait déjà mais pas l'étape
  useEffect(() => {
    if (!answer.fields?.firstName && profile.firstName) {
      saveField(STEP, "firstName", profile.firstName);
    }
    if (!answer.fields?.name && profile.houseName) {
      saveField(STEP, "name", profile.houseName);
    }
  }, [profile, answer.fields]);

  const canContinue = houseName.trim().length >= 2 && firstName.trim().length >= 2;

  function updateField(key: string, value: string) {
    saveField(STEP, key, value);
    if (["firstName", "role", "email", "phone", "country"].includes(key)) {
      saveProfile({ [key]: value });
    }
    if (key === "name") {
      saveProfile({ houseName: value });
    }
    if (key === "sector") {
      saveProfile({ sector: value });
    }
    setSaved(true);
  }

  function toggleTag(tag: string) {
    const currentTags = answer.tags ?? [];
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    saveAnswer(STEP, { tags: nextTags });
    setSaved(true);
  }

  function next() {
    completeStep(STEP);
    setLeaving(true);
    setTimeout(() => router.push("/etape/2"), 400);
  }

  const summary = `Créateur : ${firstName || "(non renseigné)"} (${role || "Fondateur"}), Pays : ${
    country || "France"
  }. Maison : ${houseName.trim() || "(non renseigné)"}. Secteur : ${sector || "(non choisi)"}. Univers : ${
    answer.tags?.join(", ") || "(non choisi)"
  }. Histoire : "${answer.text?.trim() || "(vide)"}".`;

  return (
    <StepShell step={STEP} tint={["#e9e0cf", "#e9ecd6"]}>
      <motion.div
        animate={leaving ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
      >
        <div className="space-y-6">
          <StepHeader
            eyebrow="Étape 1 · Votre Identité & Votre Maison"
            title="Créer votre profil & votre maison"
            accent="#9f6e14"
            intro="Unissons votre vision personnelle et l'univers de votre marque. Ces fondations permettront à nos maîtres parfumeurs de composer un sillage parfaitement sur-mesure."
          />

          {/* Section 1 : Vous, le créateur */}
          <Card delay={0.2}>
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                  1. Votre profil de créateur
                </h2>
                <p className="text-xs sm:text-sm text-navy/55">
                  Qui porte ce projet auprès des équipes Givaudan ?
                </p>
              </div>
              <SavedBadge show={saved} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Votre prénom & nom" htmlFor="profil-prenom">
                <input
                  id="profil-prenom"
                  value={firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Ex. : Sarah Martin"
                  autoComplete="name"
                  className={fieldClass}
                />
              </Field>

              <Field label="Votre rôle ou fonction" htmlFor="profil-role">
                <input
                  id="profil-role"
                  value={role}
                  onChange={(e) => updateField("role", e.target.value)}
                  placeholder="Ex. : Fondatrice, Directeur Artistique..."
                  className={fieldClass}
                />
              </Field>

              <Field label="E-mail professionnel" htmlFor="profil-email">
                <input
                  id="profil-email"
                  type="email"
                  value={email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="contact@maison.com"
                  autoComplete="email"
                  className={fieldClass}
                />
              </Field>

              <Field label="Téléphone & Pays" htmlFor="profil-phone">
                <div className="grid grid-cols-[1fr_1.2fr] gap-2">
                  <input
                    value={country}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="France"
                    className={fieldClass}
                  />
                  <input
                    id="profil-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+33 6..."
                    className={fieldClass}
                  />
                </div>
              </Field>
            </div>
          </Card>

          {/* Section 2 : Votre maison ou marque */}
          <Card delay={0.28}>
            <div className="border-b border-navy/5 pb-3">
              <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                2. Votre Maison ou Marque
              </h2>
              <p className="text-xs sm:text-sm text-navy/55">
                L&apos;identité et l&apos;ADN de la marque pour laquelle vous créez ce parfum.
              </p>
            </div>

            <div className="mt-5 space-y-5">
              <Field label="Nom de la maison ou marque" htmlFor="maison-nom">
                <input
                  id="maison-nom"
                  value={houseName}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex. : Maison Lumière, Atelier Botanique..."
                  className={`${fieldClass} font-medium`}
                />
              </Field>

              <ChipGroup
                title="Secteur d'activité"
                options={SECTORS}
                selected={sector ? [sector] : []}
                onToggle={(s) => updateField("sector", s === sector ? "" : s)}
                helper="Choisissez un secteur"
              />

              <ChipGroup
                title="Univers & Valeurs de la marque"
                options={BRAND_UNIVERSES}
                selected={answer.tags ?? []}
                onToggle={toggleTag}
                helper="Plusieurs choix possibles"
              />

              <Field
                label="Histoire & vision de la maison (facultatif)"
                htmlFor="maison-histoire"
                hint="Quelques lignes pour inspirer le nez"
              >
                <textarea
                  id="maison-histoire"
                  rows={4}
                  value={answer.text ?? ""}
                  onChange={(e) => {
                    saveAnswer(STEP, { text: e.target.value });
                    setSaved(true);
                  }}
                  placeholder="Son origine, sa clientèle, ses codes esthétiques, son positionnement..."
                  className={`resize-none ${fieldClass}`}
                />
              </Field>
            </div>
          </Card>

          <NextBar
            canContinue={canContinue}
            hint="Renseignez au moins votre prénom et le nom de votre maison pour continuer."
            onNext={next}
          />
        </div>

        {/* Colonne latérale Nota IA */}
        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro="Bienvenue dans Le Voyage Olfactif Givaudan ! Je suis Nota, votre guide. Parlez-moi de votre vision et de votre maison : je vous aiderai à cristalliser son identité pour nos parfumeurs."
            context={`L'utilisateur est à l'étape 1 « Profil & Maison ». ${summary} Aide-le à préciser l'identité de sa maison (histoire, valeurs, positionnement).`}
            canAsk={canContinue}
            disabledHint="Indiquez d'abord votre prénom et le nom de votre maison."
            askLabel="Affiner mon identité avec Nota"
            firstRequest={() => ({
              content: `Voici les informations de ma maison : ${summary} Qu'en pensez-vous, et que faudrait-il affiner pour inspirer le brief parfum ?`,
              display: "Voici mon profil et ma maison, qu'en penses-tu Nota ?",
            })}
          />
        </div>
      </motion.div>
    </StepShell>
  );
}
