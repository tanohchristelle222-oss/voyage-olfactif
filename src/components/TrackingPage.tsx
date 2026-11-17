"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@/lib/profile";
import { isDelivered, isShipping, remainingTime, saveSampleReview, useTracking, VERDICTS, type TrackingItem, type TrackingKind } from "@/lib/tracking";

const date = (at: number) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(at);
const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const stepsOf = (kind: TrackingKind) => kind === "samples" ? ["En préparation", "Expédié", "Reçu"] : ["Confirmée", "En préparation", "Expédiée", "Livrée"];
function statusOf(item: TrackingItem, kind: TrackingKind) {
  return kind === "samples" && item.phase === 0 ? "En préparation au laboratoire" : stepsOf(kind)[item.phase];
}

function Timeline({ item, kind }: { item: TrackingItem; kind: TrackingKind }) {
  return <ol className={`tracking-timeline${isDelivered(item, kind) ? " is-delivered" : ""}`} aria-label="Progression du suivi">
    {stepsOf(kind).map((label, index) => <li key={label} className={index <= item.phase ? "reached" : ""} aria-current={index === item.phase ? "step" : undefined}>
      <span aria-hidden="true">{index < item.phase ? "✓" : index + 1}</span><small>{label}</small>
    </li>)}
  </ol>;
}

function ReviewForm({ item }: { item: TrackingItem }) {
  const [message, setMessage] = useState("");
  return <details className="tracking-review">
    <summary>{item.review ? "Consulter ou modifier mon avis" : "Donner mon avis"}</summary>
    <form onSubmit={event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const result = saveSampleReview(item.id, String(data.get("verdict")), String(data.get("comment") || ""));
      setMessage(!result.accepted ? "Cet avis ne peut pas être enregistré." : result.persisted ? "Votre avis est enregistré." : "Votre avis est conservé pour cette session uniquement.");
    }}>
      <label htmlFor={`${item.id}-verdict`}>Votre retour</label>
      <select id={`${item.id}-verdict`} name="verdict" defaultValue={item.review?.verdict || ""} required>
        <option value="" disabled>Choisir un retour</option>{VERDICTS.map(verdict => <option key={verdict}>{verdict}</option>)}
      </select>
      <label htmlFor={`${item.id}-comment`}>Commentaire (facultatif)</label>
      <textarea id={`${item.id}-comment`} name="comment" maxLength={1500} rows={3} defaultValue={item.review?.comment || ""} placeholder="Partagez vos impressions…" />
      <button type="submit">Enregistrer mon avis</button>
      {message && <p role="status">{message}</p>}
    </form>
  </details>;
}

export default function TrackingPage({ kind }: { kind: TrackingKind }) {
  const store = useTracking();
  const profile = useProfile();
  const items = store[kind];
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { const update = () => setNow(Date.now()); update(); const timer = setInterval(update, 1000); return () => clearInterval(timer); }, []);
  const samples = kind === "samples";
  const delivered = items.filter(item => isDelivered(item, kind)).length;
  const shipping = items.filter(item => isShipping(item, kind)).length;
  const visible = items.filter(item => (
    filter === "all" || filter === "active" && !isDelivered(item, kind) || filter === "shipping" && isShipping(item, kind) || filter === "delivered" && isDelivered(item, kind)
  ) && normalized(`${item.name} ${item.id} ${item.note}`).includes(normalized(query.trim())));
  const filters = [["all", "Tous", items.length], ["active", "En cours", items.length - delivered], ["shipping", "En livraison", shipping], ["delivered", samples ? "Reçus" : "Livrées", delivered]] as const;

  return <div className={`tracking-page${samples ? " tracking-samples" : ""}`}>
    <div className="tracking-page-heading"><div><p className="tracking-eyebrow">VOTRE VOYAGE SE POURSUIT</p><h1>{samples ? "Mes échantillons" : "Mes commandes"}</h1><p>{samples ? "De la préparation à vos premières impressions, retrouvez tout votre suivi ici." : "Retrouvez vos commandes et suivez leur préparation, leur expédition et leur livraison."}</p></div>
      <Link href={samples ? "/commandes" : "/echantillons"}>{samples ? "Voir mes commandes" : "Voir mes échantillons"} →</Link>
    </div>
    <div className="tracking-stats"><div><strong>{items.length}</strong><span>{samples ? "Échantillons" : "Commandes"}</span></div><div><strong>{items.length - delivered}</strong><span>En cours</span></div><div><strong>{delivered}</strong><span>{samples ? "Reçus" : "Livrées"}</span></div></div>
    <div className="tracking-toolbar"><div role="group" aria-label="Filtrer le suivi">{filters.map(([value, label, count]) => <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}>{label} <small>{count}</small></button>)}</div>
      <input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={samples ? "Rechercher un échantillon" : "Rechercher une commande"} placeholder={samples ? "Rechercher un échantillon…" : "Rechercher une commande…"} />
    </div>
    <div className="tracking-list">
      {visible.map(item => <article key={item.id} className="tracking-card">
        <div className="tracking-card-identity"><img src={item.image} width={140} height={140} alt={item.name} /><div><small>{item.id}</small><h2>{item.name}</h2><p>{item.note}</p><b>{item.quantity}</b><small>{samples ? "Demandé" : "Commandée"} le {date(item.createdAt)}</small></div></div>
        <div className="tracking-card-state"><span className={`tracking-status ${isDelivered(item, kind) ? "received" : "pending"}`}>{statusOf(item, kind)}</span><Timeline item={item} kind={kind} />
          {!isDelivered(item, kind) ? <div className="tracking-estimate"><b>{isShipping(item, kind) ? "Réception estimée" : samples ? "Fin de préparation estimée" : "Expédition estimée"}</b><p className="tracking-estimated-date"><time dateTime={new Date(item.estimatedAt).toISOString()}>{date(item.estimatedAt)}</time></p><p className="tracking-countdown" role="timer" aria-live="off">{now === null ? "Calcul du délai…" : remainingTime(item.estimatedAt, now)}</p></div> : <p className="tracking-delivered">✓ {samples ? "Reçu" : "Livrée"} le {date(item.estimatedAt)}{item.review ? " · Avis enregistré" : ""}</p>}
        </div>
        <div className="tracking-card-actions">{samples && isDelivered(item, kind) && <ReviewForm item={item} />}
          <details className="tracking-detail"><summary>Voir le suivi →</summary><div><h3>Votre suivi en détail</h3><p>{item.id} · {item.quantity}</p><ol>{stepsOf(kind).slice(0, item.phase + 1).map((label, index) => <li key={label}><span aria-hidden="true">✓</span> {label}{index === 0 ? ` · ${date(item.createdAt)}` : ""}</li>)}</ol><p>Dernière mise à jour : {date(item.updatedAt)}</p><p>Destination : {profile.companyName || "Votre entreprise"} · {profile.country || "Pays à préciser"}</p><small>Historique de démonstration.</small></div></details>
        </div>
      </article>)}
      {visible.length === 0 && <div className="tracking-empty"><h2>Aucun résultat</h2><p>Essayez un autre nom, une référence ou un autre filtre.</p><button type="button" onClick={() => { setFilter("all"); setQuery(""); }}>Afficher tout</button></div>}
    </div>
    <p className="tracking-disclaimer">Statuts, références et délais de démonstration. Aucun transporteur ni système de commande n’est connecté. Vos avis sont conservés dans ce navigateur.</p>
  </div>;
}
