"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Order } from "@/types/order";

export default function OrderSuccess({ order }: { order: Order }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl bg-white p-6 sm:p-10 shadow-2xl shadow-navy/10 ring-1 ring-navy/5 text-center max-w-3xl mx-auto"
    >
      {/* Sceau de confirmation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 16 }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#eef1e2] text-[#6f8a2a] ring-8 ring-[#eef1e2]/50 text-3xl font-bold shadow-md"
      >
        ✓
      </motion.div>

      <span className="mt-6 inline-block rounded-full bg-[#f6eedc] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#9f6e14]">
        Paiement Confirmé · Commande Validée
      </span>

      <h2 className="mt-3 font-display text-3xl sm:text-4xl font-medium text-navy">
        Vos échantillons sont en route !
      </h2>

      <p className="mt-3 text-sm sm:text-base text-navy/70 max-w-lg mx-auto">
        Merci pour votre confiance. Nos maîtres parfumeurs préparent actuellement votre coffret personnalisé dans nos
        ateliers de Grasse.
      </p>

      {/* Détails de la commande */}
      <div className="mt-8 rounded-2xl bg-cream/50 p-5 text-left ring-1 ring-navy/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy/10 pb-3">
          <div>
            <span className="text-[11px] font-semibold uppercase text-navy/50">Numéro de commande</span>
            <p className="font-mono text-base font-bold text-navy">{order.id}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-navy/50">Suivi Colissimo</span>
            <p className="font-mono text-sm font-semibold text-[#c28921]">{order.trackingNumber}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase text-navy/50">Montant réglé</span>
            <p className="font-display text-base font-bold text-navy">{order.total.toFixed(2)} € TTC</p>
          </div>
        </div>

        <div className="pt-2 text-xs text-navy/75 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-navy">Coffret sélectionné :</p>
            <p>{order.kit.title} (3 déclinaisons sprays 10ml + touches)</p>
          </div>
          <div>
            <p className="font-semibold text-navy">Adresse d&apos;expédition :</p>
            <p>
              {order.shipping.fullName}, {order.shipping.addressLine1}, {order.shipping.postalCode}{" "}
              {order.shipping.city} ({order.shipping.country})
            </p>
          </div>
        </div>
      </div>

      {/* Timeline de livraison */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-navy/60 mb-4">
          Suivi d&apos;expédition en temps réel
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="rounded-xl bg-[#eef1e2] p-3 ring-1 ring-[#6f8a2a]/30">
            <span className="text-xs font-bold text-[#6f8a2a]">✓ 1. Validé</span>
            <p className="mt-1 text-xs font-semibold text-navy">Commande &amp; Paiement</p>
            <p className="text-[10px] text-navy/55">Aujourd&apos;hui</p>
          </div>

          <div className="rounded-xl bg-white p-3 ring-1 ring-navy/10 shadow-xs">
            <span className="text-xs font-bold text-[#c28921]">● 2. En cours</span>
            <p className="mt-1 text-xs font-semibold text-navy">Formulation Grasse</p>
            <p className="text-[10px] text-navy/55">Sous 24h ouvrées</p>
          </div>

          <div className="rounded-xl bg-white/60 p-3 ring-1 ring-navy/5 text-navy/40">
            <span className="text-xs font-medium">3. Expédié</span>
            <p className="mt-1 text-xs font-semibold">Colissimo 48h</p>
            <p className="text-[10px]">Livraison suivie</p>
          </div>

          <div className="rounded-xl bg-white/60 p-3 ring-1 ring-navy/5 text-navy/40">
            <span className="text-xs font-medium">4. Réception</span>
            <p className="mt-1 text-xs font-semibold">Évaluation sensorielle</p>
            <p className="text-[10px]">À votre adresse</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-cream/60 px-6 py-3 text-xs sm:text-sm font-semibold text-navy hover:bg-white transition"
        >
          <span aria-hidden="true">🧾</span>
          <span>Télécharger le reçu / facture</span>
        </button>

        <Link
          href="/projets"
          className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-navy/20 hover:bg-navy/90 transition"
        >
          <span>Voir mes projets</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </motion.div>
  );
}
