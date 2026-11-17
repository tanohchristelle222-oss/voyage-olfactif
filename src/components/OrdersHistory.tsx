"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProject, saveAnswer } from "@/lib/journey";
import { useProfile } from "@/lib/profile";
import { useTracking, type TrackingItem } from "@/lib/tracking";

const date = (value: number) => new Intl.DateTimeFormat("fr-FR").format(value);
const price = (value: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
const statuses = ["Confirmée", "En préparation", "En transit", "Livrée"];
// Montants fictifs associés exclusivement aux références de démonstration.
const demoAmounts: Record<string, number> = { "CMD-DEMO-001": 840, "CMD-DEMO-002": 1850, "CMD-DEMO-003": 975 };

function ReorderDialog({ item, onClose }: { item: TrackingItem; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const submitted = useRef(false);
  const router = useRouter();
  const [quantity, setQuantity] = useState(String(parseFloat(item.quantity.replace(",", ".")) || 1));

  useEffect(() => { dialog.current?.showModal(); }, []);

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(quantity);
    if (submitted.current || !Number.isFinite(amount) || amount <= 0) return;
    submitted.current = true;
    createProject();
    saveAnswer(1, {
      text: `Je souhaite commander à nouveau ${item.name}, à partir de ma commande ${item.id}, pour une quantité de ${quantity} kg. ${item.note}`,
      tags: [],
      fields: { name: `Réassort · ${item.name}`, sourceOrderId: item.id, quantity: String(quantity), unit: "kg", requestType: "reorder" },
    });
    router.push("/etape/1");
  }

  return <dialog ref={dialog} className="orders-dialog" onCancel={onClose} onClose={onClose} aria-labelledby="reorder-title">
    <div className="orders-dialog-heading"><h2 id="reorder-title">Préparer un réassort</h2><button type="button" onClick={() => dialog.current?.close()} aria-label="Fermer">×</button></div>
    <p>Reprenez les informations de votre commande pour préparer une nouvelle demande.</p>
    <div className="orders-reorder-summary"><strong>{item.name}</strong><span>Commande d’origine : {item.id}</span><span>{item.note}</span></div>
    <form onSubmit={prepare}>
      <label htmlFor="reorder-quantity">Quantité souhaitée (kg)</label>
      <input id="reorder-quantity" type="number" min="0.1" max="100000" step="0.1" required value={quantity} onChange={event => setQuantity(event.currentTarget.value)} autoFocus />
      <p className="orders-dialog-note">Un nouveau projet sera prérempli pour vérification. Aucune commande ni aucun paiement ne seront exécutés.</p>
      <button className="orders-primary-action" type="submit">Préparer mon réassort <span aria-hidden="true">→</span></button>
    </form>
  </dialog>;
}

export default function OrdersHistory() {
  const { orders } = useTracking();
  const profile = useProfile();
  const [reorder, setReorder] = useState<TrackingItem | null>(null);

  return <div className="orders-history-page">
    <h1>Mes commandes.</h1>
    <p className="orders-history-intro">Retrouvez votre historique et préparez vos réassorts.</p>
    <div className="orders-history-list">
      {orders.map(item => <article key={item.id} className={`order-history-row${item.phase === 3 ? " is-delivered" : ""}`} aria-label={`Commande ${item.id}`}>
        <div className="order-history-visual"><img src={item.image} alt={item.name} width={420} height={210} /><span className={`order-history-status${item.phase === 3 ? " received" : ""}`}>{statuses[item.phase] ?? "Statut à confirmer"}</span></div>
        <div className="order-history-content">
        <h2 className="order-history-product">{item.name}</h2>
        <p className="order-history-reference">{item.id}</p>
        <dl className="order-history-facts"><div><dt>Quantité</dt><dd>{item.quantity}</dd></div><div><dt>Montant HT</dt><dd>{demoAmounts[item.id] !== undefined ? price(demoAmounts[item.id]) : "À confirmer"}</dd></div></dl>
        <p className="order-history-meta">Commandée le {date(item.createdAt)} · Simulation</p>
        <p className="order-history-delivery"><span>{item.phase === 3 ? "Livrée le" : "Livraison estimée le"}</span><time dateTime={new Date(item.estimatedAt).toISOString()}>{date(item.estimatedAt)}</time></p>
        <div className="order-history-actions">
          <details className="order-history-tracking">
            <summary>Suivre la commande <span aria-hidden="true">→</span></summary>
            <div>
              <h3>Suivi de votre commande</h3>
              <ol className="tracking-timeline" aria-label={`Progression de ${item.id}`}>
                {statuses.map((label, index) => <li key={label} className={index <= item.phase ? "reached" : ""} aria-current={index === item.phase ? "step" : undefined}><span>{index < item.phase ? "✓" : index + 1}</span><small>{label}</small></li>)}
              </ol>
              <p>{item.phase === 3 ? "Livrée le" : "Livraison estimée le"} {date(item.estimatedAt)}</p>
              <p>Destination : {profile.companyName || "Votre entreprise"}{profile.country && ` · ${profile.country}`}</p>
              <small>Suivi de démonstration · Dernière mise à jour : {date(item.updatedAt)}.</small>
            </div>
          </details>
          <button type="button" onClick={() => setReorder(item)} aria-label={`Commander à nouveau ${item.name}`}>Commander à nouveau <span aria-hidden="true">↗</span></button>
        </div></div>
      </article>)}
      {orders.length === 0 && <p className="orders-history-empty">Vous n’avez pas encore de commande.</p>}
    </div>
    <p className="orders-history-note">Historique et montants de démonstration. Le réassort prépare un projet à vérifier ; aucune commande réelle n’est envoyée.</p>
    {reorder && <ReorderDialog key={reorder.id} item={reorder} onClose={() => setReorder(null)} />}
  </div>;
}
