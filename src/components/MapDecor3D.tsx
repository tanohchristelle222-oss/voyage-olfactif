"use client";

import { useEffect, useRef, useState } from "react";
import DecorExplorer from "./DecorExplorer";
import { EXPLORABLE_DECORS } from "./village/map-layout.mjs";
import { useJourney, type Journey } from "@/lib/journey";


export default function MapDecor3D({ preview, onReady }: { preview: boolean; onReady: (ready: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<{ destroy: () => void; setJourney: (journey: Journey, preview: boolean) => void } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [expanded, setExpanded] = useState<string | null>(null);
  const selected = EXPLORABLE_DECORS.find(area => area.kind === expanded);
  const previewCoffret = false;
  const { journey } = useJourney();
  const latest = useRef({ journey, previewCoffret });
  useEffect(() => { latest.current = { journey, previewCoffret }; }, [journey, previewCoffret]);


  useEffect(() => {
    let cancelled = false;
    import("./village/map-decor.mjs").then(async ({ mountMapDecor }) => {
      await document.fonts?.ready;
      if (cancelled || !host.current) return;
      const result = mountMapDecor(host.current, {
        journey: latest.current.journey,
        previewCoffret: latest.current.previewCoffret,
        onReady: () => { if (!cancelled) { setStatus("ready"); onReady(true); } },
        onFallback: () => { if (!cancelled) { setStatus("fallback"); onReady(false); } },
      });
      if (typeof result !== "function") {
        controls.current = result;
        result.setJourney(latest.current.journey, latest.current.previewCoffret);
      }
    }).catch(() => { if (!cancelled) { setStatus("fallback"); onReady(false); } });
    return () => { cancelled = true; controls.current?.destroy(); controls.current = null; };
  }, [onReady]);

  useEffect(() => { controls.current?.setJourney(journey, previewCoffret); }, [journey, previewCoffret]);

  useEffect(() => {
    if (expanded) dialog.current?.showModal();
    else dialog.current?.close();
  }, [expanded]);

  return (
    <>
      <div ref={host} className={`map-decor-canvas ${status === "ready" ? "is-ready" : ""}`} aria-hidden="true" />
      {!preview && EXPLORABLE_DECORS.filter(area => status === "ready" || area.kind === "laboratory").map(area => <button key={area.kind} type="button" className="decor-explore-hotspot" style={{ left: `${area.x / 1440 * 100}%`, top: `${(area.y - 60) / 900 * 100}%`, width: `${area.width / 1440 * 100}%`, height: `${area.height / 900 * 100}%` }} onClick={() => setExpanded(area.kind)} aria-label={`Explorer : ${area.label}`} aria-haspopup="dialog">
        <span className="decor-explore-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5M10.5 7.5v6M7.5 10.5h6" /></svg></span><span className="decor-explore-label">{area.label}</span>
      </button>)}
      <dialog ref={dialog} className="village-dialog" aria-labelledby="decor-explorer-title" onCancel={() => setExpanded(null)} onClose={() => setExpanded(null)}>
        <div className="village-dialog-heading">
          <div><h2 id="decor-explorer-title">{selected?.label || "Explorer le décor"}</h2><p>Découvrez les détails de votre voyage olfactif.</p></div>
          <button type="button" onClick={() => setExpanded(null)} autoFocus aria-label="Fermer la vue agrandie">Fermer ×</button>
        </div>
        {selected && <div className="village-dialog-scene"><DecorExplorer key={selected.kind} kind={selected.kind} label={selected.label} /></div>}
      </dialog>
    </>
  );
}
