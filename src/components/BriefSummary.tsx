"use client";

import { useMemo } from "react";
import { Journey } from "@/types/journey";
import { Profile } from "@/lib/profile";

export default function BriefSummary({
  journey,
  profile,
  onPrint,
}: {
  journey: Journey;
  profile: Profile;
  onPrint?: () => void;
}) {
  const step1 = journey.answers[1]?.fields ?? {};
  const houseName = step1.name || profile.houseName || "Votre Maison";
  const creatorName = step1.firstName || profile.firstName || "Créateur";
  const sector = step1.sector || profile.sector || "Parfumerie";
  const universes = journey.answers[1]?.tags ?? [];

  const step2 = journey.answers[2]?.fields ?? {};
  const projectName = step2.name || "Projet Sans Titre";
  const productType = step2.productType || "Eau de parfum";
  const format = step2.format || "50ml";
  const moods = journey.answers[2]?.tags ?? [];
  const projectStory = journey.answers[2]?.text || "";

  const step3 = journey.answers[3]?.fields ?? {};
  const gender = step3.gender || "Mixte";
  const age = step3.age || "Tous publics";
  const priceTier = step3.priceTier || "Premium";
  const targetTags = journey.answers[3]?.tags ?? [];

  const step4 = journey.answers[4]?.fields ?? {};
  const family = step4.family || "Boisé";
  const intensity = step4.intensity || "Modéré";
  const notes = journey.answers[4]?.tags ?? [];

  const step5 = journey.answers[5]?.fields ?? {};
  const budget = step5.budgetPerKg || "Standard";
  const volume = step5.volume || "Standard";
  const timeline = step5.timeline || "6 mois";
  const ecoLabels = journey.answers[5]?.tags ?? [];

  const referenceCode = useMemo(() => {
    const seed = (projectName + houseName).split("").reduce((acc, c) => acc + c.charCodeAt(0), 4000);
    return `BO-${seed.toString(36).toUpperCase()}`;
  }, [projectName, houseName]);

  return (
    <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-xl shadow-navy/5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 pb-5">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-[#c28921] uppercase">
            Document Officiel de Co-Création
          </span>
          <h3 className="font-display text-2xl font-medium text-navy mt-1">
            Brief Olfactif Givaudan · {projectName}
          </h3>
          <p className="text-xs text-navy/50 mt-0.5">
            Maison {houseName} · Par {creatorName} · Réf. {referenceCode}
          </p>
        </div>

        <button
          onClick={onPrint || (() => window.print())}
          className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-cream/50 px-4 py-2 text-xs font-semibold text-navy transition hover:bg-navy hover:text-white"
        >
          <span aria-hidden="true">📄</span>
          <span>Imprimer / Exporter le Brief</span>
        </button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-xs sm:text-sm">
        {/* Identité & Maison */}
        <div className="rounded-2xl bg-cream/40 p-4 ring-1 ring-navy/5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/60">
            1. Maison &amp; Créateur
          </p>
          <p className="mt-2 font-display text-base font-medium text-navy">{houseName}</p>
          <p className="text-navy/65">Créateur : {creatorName}</p>
          <p className="text-navy/65">Secteur : {sector}</p>
          {universes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {universes.map((u) => (
                <span key={u} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-navy/70 shadow-xs">
                  {u}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Projet & Concept */}
        <div className="rounded-2xl bg-cream/40 p-4 ring-1 ring-navy/5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/60">
            2. Produit &amp; Concept
          </p>
          <p className="mt-2 font-display text-base font-medium text-navy">{projectName}</p>
          <p className="text-navy/65">{productType} · {format}</p>
          {projectStory && (
            <p className="mt-2 text-xs italic text-navy/70 line-clamp-3">« {projectStory} »</p>
          )}
          {moods.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {moods.slice(0, 3).map((m) => (
                <span key={m} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-navy/70 shadow-xs">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cible & Positionnement */}
        <div className="rounded-2xl bg-cream/40 p-4 ring-1 ring-navy/5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/60">
            3. Marché &amp; Cible
          </p>
          <p className="mt-2 font-display text-base font-medium text-navy">{gender}</p>
          <p className="text-navy/65">{age} · Prix : {priceTier}</p>
          {targetTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {targetTags.slice(0, 3).map((t) => (
                <span key={t} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-navy/70 shadow-xs">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Famille Olfactive & Notes */}
        <div className="rounded-2xl bg-cream/40 p-4 ring-1 ring-navy/5 sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/60">
            4. Signature Olfactive
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-lg font-medium text-navy">{family}</span>
            <span className="text-xs text-[#c28921] font-semibold uppercase tracking-wider">
              Sillage : {intensity}
            </span>
          </div>
          {notes.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {notes.map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy ring-1 ring-navy/10 shadow-xs"
                >
                  🌿 {n}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-navy/50 mt-1">Pyramide olfactive en cours d&apos;affinage avec le parfumeur.</p>
          )}
        </div>

        {/* Spécifications Techniques */}
        <div className="rounded-2xl bg-cream/40 p-4 ring-1 ring-navy/5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/60">
            5. Faisabilité &amp; Normes
          </p>
          <p className="mt-2 font-medium text-navy">Budget : {budget}</p>
          <p className="text-navy/65">Volume : {volume}</p>
          <p className="text-navy/65">Délai : {timeline}</p>
          {ecoLabels.length > 0 && (
            <p className="text-navy/55 text-[11px] mt-1 line-clamp-1">{ecoLabels[0]}</p>
          )}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6f8a2a] font-medium">
            <span aria-hidden="true">✓</span>
            <span>Conformité IFRA garantie Givaudan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
