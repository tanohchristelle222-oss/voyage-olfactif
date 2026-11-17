"use client";

import { useEffect, useRef, useState } from "react";
import { useJourney } from "@/lib/journey";

export default function DecorExplorer({ kind, label }: { kind: string; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<{ destroy: () => void; zoomBy: (factor: number) => void; reset: () => void } | null>(null);
  const { journey } = useJourney();
  const [status, setStatus] = useState("loading");
  const [imageZoom, setImageZoom] = useState(1);
  const image = kind === "laboratory";
  useEffect(() => {
    if (image) return;
    let cancelled = false;
    import("./village/decor-explorer.mjs").then(({ mountDecorExplorer }) => {
      if (cancelled || !host.current) return;
      controls.current = mountDecorExplorer(host.current, {
        kind, journey,
        onReady: () => { if (!cancelled) setStatus("ready"); },
        onFallback: () => { if (!cancelled) setStatus("fallback"); },
      });
    }).catch(() => { if (!cancelled) setStatus("fallback"); });
    return () => { cancelled = true; controls.current?.destroy(); controls.current = null; };
  }, [kind, journey, image]);
  const available = image || status === "ready";
  function zoom(factor: number) {
    if (image) setImageZoom(value => Math.min(3, Math.max(.5, value * factor)));
    else controls.current?.zoomBy(factor);
  }
  return <div className="decor-explorer">
    <div className="decor-explorer-tools" role="group" aria-label="Contrôles de la vue agrandie">
      <button type="button" disabled={!available} aria-label="Réduire le zoom" onClick={() => zoom(1 / 1.2)}>−</button>
      <button type="button" disabled={!available} aria-label="Augmenter le zoom" onClick={() => zoom(1.2)}>+</button>
      <button type="button" disabled={!available} onClick={() => { controls.current?.reset(); setImageZoom(1); }}>Réinitialiser la vue</button>
    </div>
    {image ? <div className="decor-explorer-image"><img src="/atelier.webp" alt={label} style={{ width: `${imageZoom * 100}%`, maxWidth: "none" }} /></div> : <div ref={host} className="decor-explorer-canvas" aria-label={label} />}
    {!image && status !== "ready" && <p className="decor-explorer-message" role="status">{status === "loading" ? "Le décor prend vie…" : "La vue 3D ne peut pas s’afficher dans ce navigateur."}</p>}
    <p className="decor-explorer-hint">{image ? "Utilisez + et − pour explorer les détails de l’atelier." : "Faites glisser pour tourner · Molette ou pincement pour zoomer"}</p>
  </div>;
}
