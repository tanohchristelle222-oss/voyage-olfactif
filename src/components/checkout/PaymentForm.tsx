"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { PROMO_CODES } from "@/lib/orders";
import { PaymentDetails, PaymentMethod, SampleKit } from "@/types/order";
import { Field, fieldClass } from "../steps/ui";

export default function PaymentForm({
  kit,
  onPay,
  isProcessing = false,
}: {
  kit: SampleKit;
  onPay: (details: PaymentDetails, finalTotal: number) => void;
  isProcessing?: boolean;
}) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8912");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("842");
  const [cardHolder, setCardHolder] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Détection du réseau de carte
  const cardBrand = cardNumber.startsWith("4")
    ? "VISA"
    : cardNumber.startsWith("5")
    ? "MASTERCARD"
    : cardNumber.startsWith("3")
    ? "AMEX"
    : "CB";

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setDiscountPercent(PROMO_CODES[code]);
    } else {
      alert("Code promotionnel non valide. Essayez le code 'GIVAUDAN2026' ou 'HETIC' !");
    }
  }

  const basePrice = kit.price;
  const discountAmount = Math.round(basePrice * discountPercent * 100) / 100;
  const finalTotal = Math.max(0, basePrice - discountAmount);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onPay(
      {
        method,
        cardNumber: method === "card" ? cardNumber : undefined,
        cardExp: method === "card" ? cardExp : undefined,
        cardCvc: method === "card" ? cardCvc : undefined,
        cardHolder: cardHolder || "Titulaire de carte",
        promoCode: appliedPromo || undefined,
        discountAmount: discountAmount || undefined,
      },
      finalTotal
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sélecteur de méthode */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all ${
            method === "card"
              ? "bg-navy text-white shadow-md ring-2 ring-navy"
              : "bg-cream/60 text-navy ring-1 ring-navy/10 hover:bg-white"
          }`}
        >
          <span className="text-xl">💳</span>
          <span className="mt-1 text-xs font-semibold">Carte bancaire</span>
        </button>

        <button
          type="button"
          onClick={() => setMethod("apple_pay")}
          className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all ${
            method === "apple_pay"
              ? "bg-navy text-white shadow-md ring-2 ring-navy"
              : "bg-cream/60 text-navy ring-1 ring-navy/10 hover:bg-white"
          }`}
        >
          <span className="text-xl"> / G</span>
          <span className="mt-1 text-xs font-semibold">Apple / Google Pay</span>
        </button>

        <button
          type="button"
          onClick={() => setMethod("invoice")}
          className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all ${
            method === "invoice"
              ? "bg-navy text-white shadow-md ring-2 ring-navy"
              : "bg-cream/60 text-navy ring-1 ring-navy/10 hover:bg-white"
          }`}
        >
          <span className="text-xl">📄</span>
          <span className="mt-1 text-xs font-semibold">Facture Pro 30j</span>
        </button>
      </div>

      {/* Détails Carte Bancaire */}
      {method === "card" && (
        <div className="space-y-4 rounded-2xl bg-cream/35 p-4 sm:p-5 ring-1 ring-navy/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-navy/60">
              Paiement Sécurisé SSL 256-Bit
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy/70">
              <span className="rounded bg-navy/10 px-1.5 py-0.5">{cardBrand}</span>
              <span>🔒 3D-Secure</span>
            </div>
          </div>

          <Field label="Numéro de carte bancaire">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4532 •••• •••• ••••"
              className={fieldClass}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Expiration">
              <input
                type="text"
                value={cardExp}
                onChange={(e) => setCardExp(e.target.value)}
                placeholder="MM/AA"
                maxLength={5}
                className={fieldClass}
                required
              />
            </Field>

            <Field label="CVC / Cryptogramme">
              <input
                type="text"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                placeholder="123"
                maxLength={4}
                className={fieldClass}
                required
              />
            </Field>

            <div className="col-span-2 sm:col-span-1">
              <Field label="Nom sur la carte">
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Mme / M. Nom"
                  className={fieldClass}
                />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Détails Apple Pay */}
      {method === "apple_pay" && (
        <div className="rounded-2xl bg-black p-6 text-center text-white">
          <p className="text-xs text-white/70">Paiement ultra-rapide par authentification biométrique (Face ID / Touch ID)</p>
          <p className="mt-2 font-display text-lg font-medium">Apple Pay / Google Pay prêt</p>
        </div>
      )}

      {/* Détails Facture Pro */}
      {method === "invoice" && (
        <div className="rounded-2xl bg-[#efeaf4] p-5 text-xs text-navy/80 ring-1 ring-[#9678b0]/30">
          <p className="font-semibold text-navy">Compte Entreprise Givaudan · Paiement différé à 30 jours</p>
          <p className="mt-1">
            Une facture proforma avec TVA déductible sera générée immédiatement et adressée à votre service comptabilité.
          </p>
        </div>
      )}

      {/* Code promo */}
      <div className="rounded-2xl bg-cream/40 p-4 ring-1 ring-navy/5">
        <div className="flex gap-2">
          <input
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="Code promo (ex: GIVAUDAN2026, HETIC)"
            className={`${fieldClass} text-xs py-2`}
          />
          <button
            type="button"
            onClick={applyPromo}
            className="rounded-xl bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy/90 transition shrink-0"
          >
            <span>Appliquer</span>
          </button>
        </div>
        {appliedPromo && (
          <p className="mt-2 text-xs font-medium text-[#6f8a2a]">
            <span>✓ Code {appliedPromo} appliqué (-{discountPercent * 100}%)</span>
          </p>
        )}
      </div>

      {/* Récapitulatif du total */}
      <div className="border-t border-navy/10 pt-4 space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between text-navy/70">
          <span>{kit.title}</span>
          <span>{kit.price.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-navy/70">
          <span>Livraison Colissimo Express 48h</span>
          <span className="font-medium text-[#6f8a2a]">Offerte par Givaudan</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-[#6f8a2a] font-medium">
            <span>Remise privilège ({appliedPromo})</span>
            <span>-{discountAmount.toFixed(2)} €</span>
          </div>
        )}
        <div className="flex justify-between text-base sm:text-lg font-display font-medium text-navy border-t border-navy/5 pt-2">
          <span>Total TTC à régler</span>
          <span className="text-[#c28921] font-bold">{finalTotal.toFixed(2)} €</span>
        </div>
        <p className="text-[11px] text-navy/50">
          <span>* Les {finalTotal.toFixed(2)} € sont 100% remboursés sous forme d&apos;avoir lors du lancement de votre production.</span>
        </p>
      </div>

      {/* Bouton de paiement */}
      <motion.button
        type="submit"
        disabled={isProcessing}
        whileHover={{ scale: isProcessing ? 1 : 1.02 }}
        whileTap={{ scale: isProcessing ? 1 : 0.98 }}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-navy py-4 text-sm sm:text-base font-semibold text-white shadow-xl shadow-navy/20 hover:bg-navy/90 transition disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Validation bancaire 3D-Secure en cours...</span>
          </>
        ) : (
          <>
            <span>🔒 Régler {finalTotal.toFixed(2)} € &amp; Commander mon coffret</span>
            <span aria-hidden="true">→</span>
          </>
        )}
      </motion.button>
    </form>
  );
}
