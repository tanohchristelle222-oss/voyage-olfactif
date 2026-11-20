"use client";

import { useState } from "react";
import BriefSummary from "@/components/BriefSummary";
import NotaChat from "@/components/NotaChat";
import OrderSuccess from "@/components/checkout/OrderSuccess";
import PaymentForm from "@/components/checkout/PaymentForm";
import { completeStep, useJourney } from "@/lib/journey";
import { createOrder, getOrderByProjectId } from "@/lib/orders";
import { useProfile } from "@/lib/profile";
import { generateFormulas, SAMPLE_KITS } from "@/lib/samples";
import { Order, PaymentDetails, SampleKitTier, ShippingAddress } from "@/types/order";
import StepShell from "./StepShell";
import { Card, Field, fieldClass, SavedBadge, StepHeader } from "./ui";

const STEP = 6;

export default function Step6SamplesPayment() {
  const profile = useProfile();
  const { journey, projectId } = useJourney();

  const step1 = journey.answers[1]?.fields ?? {};
  const houseName = step1.name || profile.houseName || "Votre Maison";
  const creatorName = step1.firstName || profile.firstName || "Créateur";
  const projectName = journey.answers[2]?.fields?.name || "Votre Parfum";
  const family = journey.answers[4]?.fields?.family || "Boisé";
  const notes = journey.answers[4]?.tags ?? [];

  // Formules olfactives sur-mesure déduites des réponses
  const formulas = generateFormulas(projectName, houseName, family, notes);

  // État local
  const existingOrder = projectId ? getOrderByProjectId(projectId) : undefined;
  const [completedOrder, setCompletedOrder] = useState<Order | undefined>(existingOrder);
  const [selectedKitId, setSelectedKitId] = useState<SampleKitTier>("decouverte");
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>("form-1");
  const [showFullBrief, setShowFullBrief] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Coordonnées de livraison
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: creatorName || "Mme / M. Nom",
    company: houseName,
    addressLine1: "12 rue de la Paix",
    addressLine2: "",
    postalCode: "75002",
    city: "Paris",
    country: step1.country || profile.country || "France",
    phone: step1.phone || profile.phone || "+33 6 12 34 56 78",
  });

  const selectedKit = SAMPLE_KITS.find((k) => k.id === selectedKitId) ?? SAMPLE_KITS[0];
  const recommendationItems = [
    ...SAMPLE_KITS.map((kit) => ({ id: `kit:${kit.id}`, label: kit.title, detail: `${kit.price} € · ${kit.tagline}` })),
    ...formulas.map((formula) => ({ id: `formula:${formula.id}`, label: formula.name, detail: `${formula.code} · ${formula.character}` })),
  ];

  function handlePay(paymentDetails: PaymentDetails, finalTotal: number) {
    if (!projectId) return;
    setIsProcessing(true);

    setTimeout(() => {
      const order = createOrder({
        projectId,
        kit: selectedKit,
        formulas,
        selectedFormulaId,
        shipping,
        payment: paymentDetails,
        total: finalTotal,
      });

      completeStep(STEP);
      setCompletedOrder(order);
      setIsProcessing(false);
    }, 1400);
  }

  // Si la commande est déjà passée, on affiche la confirmation
  if (completedOrder) {
    return (
      <StepShell step={STEP} tint={["#eef1e2", "#f6eedc"]}>
        <div className="py-8">
          <OrderSuccess order={completedOrder} />
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell step={STEP} tint={["#eef1e2", "#e9e0cf"]}>
      <div className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-6">
          <StepHeader
            eyebrow="Étape 6 · L'Apothéose Olfactive"
            title="Vos Échantillons & Votre Commande"
            accent="#0b1215"
            intro="Félicitations ! Votre brief olfactif est complet. Découvrez les 3 formulations composées pour votre projet, choisissez votre coffret d'échantillons et finalisez votre commande en toute sécurité."
          />

          {/* Synthèse du Brief */}
          <Card delay={0.15}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/5 pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6f8a2a]">
                  ✓ Synthèse validée
                </span>
                <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                  Le Brief Olfactif de {projectName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowFullBrief(!showFullBrief)}
                className="text-xs font-semibold text-[#c28921] hover:underline"
              >
                <span>{showFullBrief ? "Masquer les détails ▲" : "Afficher le brief complet ▼"}</span>
              </button>
            </div>

            {showFullBrief ? (
              <div className="mt-4">
                <BriefSummary journey={journey} profile={profile} />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl bg-cream/60 p-3">
                  <p className="font-semibold text-navy">Maison</p>
                  <p className="text-navy/60 truncate">{houseName}</p>
                </div>
                <div className="rounded-xl bg-cream/60 p-3">
                  <p className="font-semibold text-navy">Famille</p>
                  <p className="text-navy/60 truncate">{family}</p>
                </div>
                <div className="rounded-xl bg-cream/60 p-3">
                  <p className="font-semibold text-navy">Notes clés</p>
                  <p className="text-navy/60 truncate">
                    {notes.slice(0, 2).join(", ") || "Équilibrées"}
                  </p>
                </div>
                <div className="rounded-xl bg-cream/60 p-3">
                  <p className="font-semibold text-navy">Harmonie</p>
                  <p className="font-bold text-[#6f8a2a]">98% optimisé</p>
                </div>
              </div>
            )}
          </Card>

          {/* Les 3 pistes de formulations olfactives */}
          <Card delay={0.22}>
            <div className="border-b border-navy/5 pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c28921]">
                Co-Création Parfumeurs Givaudan
              </span>
              <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                3 Pistes de Formulation Incluses dans Votre Coffret
              </h2>
              <p className="text-xs sm:text-sm text-navy/55">
                Chacune explore une facette unique de votre idée pour vous permettre de tester sur peau.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {formulas.map((formula) => {
                const isSelected = selectedFormulaId === formula.id;
                return (
                  <div
                    key={formula.id}
                    onClick={() => setSelectedFormulaId(formula.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all ${
                      isSelected
                        ? "bg-navy text-white shadow-lg ring-2 ring-navy"
                        : "bg-cream/50 text-navy ring-1 ring-navy/10 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#c28921] px-2 py-0.5 text-[10px] font-bold text-white">
                          {formula.code}
                        </span>
                        <h3 className="font-display text-base font-medium">{formula.name}</h3>
                      </div>
                      <span className="text-xs font-semibold">{isSelected ? "● Piste prioritaire" : "○ Sélectionner"}</span>
                    </div>

                    <p className={`mt-1 text-xs ${isSelected ? "text-white/80" : "text-navy/60"}`}>
                      {formula.character}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      <span className={`rounded-full px-2 py-0.5 ${isSelected ? "bg-white/20 text-white" : "bg-white text-navy/70 shadow-xs"}`}>
                        Tête : {formula.head.join(", ")}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 ${isSelected ? "bg-white/20 text-white" : "bg-white text-navy/70 shadow-xs"}`}>
                        Cœur : {formula.heart.join(", ")}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 ${isSelected ? "bg-white/20 text-white" : "bg-white text-navy/70 shadow-xs"}`}>
                        Fond : {formula.base.join(", ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Choix du coffret d'échantillons */}
          <Card delay={0.28}>
            <div className="border-b border-navy/5 pb-3">
              <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                Choisissez votre Coffret d&apos;Échantillons
              </h2>
              <p className="text-xs sm:text-sm text-navy/55">
                Flaconnage de laboratoire préparé sur-mesure dans nos ateliers de Grasse.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {SAMPLE_KITS.map((kit) => {
                const active = selectedKitId === kit.id;
                return (
                  <div
                    key={kit.id}
                    onClick={() => setSelectedKitId(kit.id)}
                    className={`relative cursor-pointer flex flex-col justify-between rounded-2xl p-4 sm:p-5 transition-all ${
                      active
                        ? "bg-navy text-white shadow-xl ring-2 ring-navy scale-[1.02]"
                        : "bg-cream/40 text-navy ring-1 ring-navy/10 hover:bg-white hover:scale-[1.01]"
                    }`}
                  >
                    {kit.popular && (
                      <span className="absolute -top-2.5 right-4 rounded-full bg-[#c28921] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        {kit.badge || "Recommandé"}
                      </span>
                    )}

                    <div>
                      <h3 className="font-display text-lg font-medium">{kit.title}</h3>
                      <p className={`mt-0.5 text-xs ${active ? "text-white/75" : "text-navy/55"}`}>
                        {kit.tagline}
                      </p>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold">{kit.price} €</span>
                        {kit.originalPrice && (
                          <span className={`text-xs line-through ${active ? "text-white/50" : "text-navy/40"}`}>
                            {kit.originalPrice} €
                          </span>
                        )}
                        <span className="text-[10px] font-semibold uppercase">TTC</span>
                      </div>

                      <ul className="mt-4 space-y-2 text-xs">
                        {kit.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#c28921] font-bold">✓</span>
                            <span className={active ? "text-white/90" : "text-navy/70"}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-3 border-t border-navy/10">
                      <span
                        className={`block text-center rounded-full py-2 text-xs font-semibold ${
                          active
                            ? "bg-white text-navy"
                            : "bg-navy/5 text-navy hover:bg-navy hover:text-white"
                        }`}
                      >
                        <span>{active ? "✓ Sélectionné" : "Choisir ce coffret"}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Coordonnées de livraison */}
          <Card delay={0.34}>
            <div className="flex items-center justify-between border-b border-navy/5 pb-3">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                  Adresse de Livraison de Votre Coffret
                </h2>
                <p className="text-xs sm:text-sm text-navy/55">
                  Expédié sous pli confidentiel et sécurisé en 48h.
                </p>
              </div>
              <SavedBadge show={true} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet ou contact">
                <input
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  className={fieldClass}
                  required
                />
              </Field>

              <Field label="Entreprise / Maison">
                <input
                  value={shipping.company || ""}
                  onChange={(e) => setShipping({ ...shipping, company: e.target.value })}
                  className={fieldClass}
                />
              </Field>

              <Field label="Adresse postale">
                <input
                  value={shipping.addressLine1}
                  onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
                  placeholder="Numéro et nom de rue"
                  className={fieldClass}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Code postal">
                  <input
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </Field>

                <Field label="Ville">
                  <input
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className={fieldClass}
                    required
                  />
                </Field>
              </div>

              <Field label="Pays de livraison">
                <input
                  value={shipping.country}
                  onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                  className={fieldClass}
                  required
                />
              </Field>

              <Field label="Téléphone (pour le transporteur)">
                <input
                  type="tel"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className={fieldClass}
                  required
                />
              </Field>
            </div>
          </Card>

          {/* Formulaire de paiement sécurisé */}
          <Card delay={0.4}>
            <div className="border-b border-navy/5 pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6f8a2a]">
                🔒 Règlement Sécurisé Givaudan
              </span>
              <h2 className="font-display text-lg sm:text-xl font-medium text-navy">
                Paiement de votre Coffret d&apos;Échantillons
              </h2>
              <p className="text-xs sm:text-sm text-navy/55">
                Paiement 100% sécurisé et garanti remboursable sur votre future production.
              </p>
            </div>

            <div className="mt-5">
              <PaymentForm
                kit={selectedKit}
                onPay={handlePay}
                isProcessing={isProcessing}
              />
            </div>
          </Card>
        </div>

        {/* Colonne latérale Nota IA */}
        <div className="lg:sticky lg:top-24">
          <NotaChat
            intro="Nous touchons au but ! Recevoir et sentir vos échantillons sur touche et sur peau est l'instant le plus magique de la création. Je suis là si vous avez la moindre question avant de commander votre coffret !"
            context={`L'utilisateur est à l'étape finale 6 « Échantillons & Paiement ». Projet : ${projectName} pour ${houseName}. Famille : ${family}. Coffret sélectionné : ${selectedKit.title} (${selectedKit.price}€). Conseille-le sur l'évaluation à l'aveugle. Catalogue autorisé pour toute recommandation : coffrets ${SAMPLE_KITS.map((kit) => `${kit.title} (${kit.price} €)`).join(" ; ")}; formulations ${formulas.map((formula) => `${formula.name} [${formula.id}] avec tête ${formula.head.join(", ")}, cœur ${formula.heart.join(", ")}, fond ${formula.base.join(", ")}`).join(" ; ")}. Ne recommande aucun autre produit ni aucune formule absente de cette liste.`}
            canAsk={true}
            askLabel="Demander conseil à Nota pour mes tests"
            firstRequest={() => ({
              content: `Je m'apprête à commander le ${selectedKit.title} pour mon parfum ${projectName}. Quels conseils me donnes-tu pour bien évaluer mes 3 pistes d'échantillons dès réception ?`,
              display: "Nota, comment bien tester mes échantillons ?",
            })}
            recommendations={recommendationItems}
            onSelectRecommendation={(id) => {
              const [kind, value] = id.split(":");
              if (kind === "kit" && SAMPLE_KITS.some((kit) => kit.id === value)) setSelectedKitId(value as SampleKitTier);
              if (kind === "formula" && formulas.some((formula) => formula.id === value)) setSelectedFormulaId(value);
            }}
          />
        </div>
      </div>
    </StepShell>
  );
}
