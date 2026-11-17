"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SECTORS, useProjects } from "@/lib/journey";
import { initialsOf, saveProfile, useProfile } from "@/lib/profile";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const inputClass =
  "mt-1.5 w-full rounded-xl bg-[#f2f2f2] px-4 py-3 text-sm text-navy outline-none ring-1 ring-navy/5 transition placeholder:text-navy/35 focus:bg-white focus:ring-2 focus:ring-navy/25";

export default function ProfilePage() {
  const profile = useProfile();
  const { projects } = useProjects();
  const [saved, setSaved] = useState(false);

  // Statistiques sur l'ensemble des projets (étape 4 = brief, étape 5 = échantillons).
  const stats = [
    { value: projects.length, label: "Projets" },
    { value: projects.filter((p) => p.journey.completed.includes(4)).length, label: "Briefs validés" },
    { value: projects.filter((p) => p.journey.completed.includes(5)).length, label: "Échantillons reçus" },
  ];

  function update(patch: Parameters<typeof saveProfile>[0]) {
    saveProfile(patch);
    setSaved(true);
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <motion.h1 {...fadeUp(0)} className="font-display text-[clamp(2.2rem,4vw,3rem)] font-medium leading-tight">
          Mon profil
        </motion.h1>
        <AnimatePresence>
          {saved && (
            <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="pb-2 text-xs text-[#6f8a2a]">
              ✓ Sauvegardé automatiquement
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* items-stretch : les deux cartes ont toujours la même hauteur */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr] lg:items-stretch">
        {/* Carte identité */}
        <motion.section
          {...fadeUp(0.1)}
          className="flex flex-col items-center rounded-3xl bg-white px-6 py-8 text-center shadow-xl shadow-navy/5 ring-1 ring-navy/5"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 16 }}
            className="grid h-28 w-28 place-items-center rounded-full bg-[#ece8e1] font-display text-3xl font-medium text-navy ring-4 ring-white shadow-md shadow-navy/10"
          >
            {initialsOf(profile.firstName)}
          </motion.div>

          <input
            value={profile.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            placeholder="Votre prénom"
            aria-label="Prénom"
            className="mt-5 w-full rounded-lg bg-transparent text-center font-display text-2xl font-medium outline-none placeholder:text-navy/30 hover:bg-[#f2f2f2] focus:bg-[#f2f2f2]"
          />
          <input
            value={profile.role}
            onChange={(e) => update({ role: e.target.value })}
            placeholder="Votre fonction"
            aria-label="Fonction"
            className="mt-1 w-full rounded-lg bg-transparent text-center text-sm text-navy/60 outline-none placeholder:text-navy/30 hover:bg-[#f2f2f2] focus:bg-[#f2f2f2]"
          />

          <div className="mt-7 grid w-full grid-cols-3 gap-2 border-t border-navy/5 pt-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(0.35 + i * 0.08)}>
                <p className="font-display text-2xl font-medium">{s.value}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-navy/55">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Informations de la marque */}
        <motion.section
          {...fadeUp(0.2)}
          className="rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 ring-1 ring-navy/5 sm:p-8"
        >
          <h2 className="font-display text-xl font-medium">Informations de la marque</h2>
          <p className="mt-1 text-sm text-navy/55">
            Votre maison est utilisée dans tous vos projets : Nota en tient compte pour vous conseiller.
          </p>

          <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field label="Nom de la maison" htmlFor="p-maison">
              <input
                id="p-maison"
                value={profile.houseName}
                onChange={(e) => update({ houseName: e.target.value })}
                placeholder="Ex. : Maison Lumière"
                className={inputClass}
              />
            </Field>
            <Field label="Secteur" htmlFor="p-secteur">
              <select
                id="p-secteur"
                value={profile.sector}
                onChange={(e) => update({ sector: e.target.value })}
                className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path d=%22M2 4l4 4 4-4%22 fill=%22none%22 stroke=%22%230b1215%22 stroke-width=%221.5%22/></svg>')] bg-[length:12px] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
              >
                <option value="">Choisir un secteur</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pays" htmlFor="p-pays">
              <input
                id="p-pays"
                value={profile.country}
                onChange={(e) => update({ country: e.target.value })}
                placeholder="Ex. : France"
                autoComplete="country-name"
                className={inputClass}
              />
            </Field>
            <Field label="E-mail" htmlFor="p-email">
              <input
                id="p-email"
                type="email"
                value={profile.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="contact@maison.com"
                autoComplete="email"
                className={inputClass}
              />
            </Field>
            <Field label="Téléphone" htmlFor="p-tel">
              <input
                id="p-tel"
                type="tel"
                value={profile.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
                autoComplete="tel"
                className={inputClass}
              />
            </Field>
            <Field label="Interlocuteur Givaudan" htmlFor="p-interlocuteur">
              <div id="p-interlocuteur" className={`${inputClass} flex items-center gap-2 text-navy/60`}>
                <span className="h-2 w-2 rounded-full bg-[#c28921]" />À attribuer
              </div>
            </Field>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-navy/70">
        {label}
      </label>
      {children}
    </div>
  );
}
