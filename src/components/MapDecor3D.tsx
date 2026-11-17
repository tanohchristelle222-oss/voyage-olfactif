"use client";

import { useEffect, useRef, useState } from "react";
import VillageAtStart from "./VillageAtStart";
import { saveField, useJourney, type Journey } from "@/lib/journey";
import { FRAGRANCE_THEMES, fragranceState } from "./village/fragrance-state.mjs";

export default function MapDecor3D({ preview, onReady }: { preview: boolean; onReady: (ready: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<{ destroy: () => void; setJourney: (journey: Journey, preview: boolean) => void } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [, setZoomReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [previewCoffret, setPreviewCoffret] = useState(false);
  const { journey } = useJourney();
  const latest = useRef({ journey, previewCoffret });
  useEffect(() => { latest.current = { journey, previewCoffret }; }, [journey, previewCoffret]);
  const fragrance = fragranceState(journey, previewCoffret);

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
      {!preview && (
        <div className="map-decor-controls">
          {status === "ready" ? <>
            <label className="fragrance-world-select">Votre univers
              <select aria-label="Univers olfactif du projet" value={journey.answers[1]?.fields?.scentFamily || "auto"} onChange={event => saveField(1, "scentFamily", event.target.value === "auto" ? "" : event.target.value)}>
                <option value="auto">Selon mon idée</option>
                {FRAGRANCE_THEMES.map(theme => <option key={theme.key} value={theme.key}>{theme.label}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => setExpanded(true)}>Agrandir le village <span aria-hidden="true">↗</span></button>
            {!fragrance.ready && <button type="button" onClick={() => setPreviewCoffret(!previewCoffret)} aria-pressed={previewCoffret} title="Animation de présentation : ne valide pas le brief et ne crée pas de commande.">{previewCoffret ? "Refermer le coffret" : "Aperçu du coffret"}</button>}
            <span className="fragrance-world-caption" role="status">{fragrance.label}</span>
          </> : <span role="status">{status === "loading" ? "Les décors prennent vie…" : "La vue 3D n’est pas disponible sur ce navigateur. Le parcours reste accessible."}</span>}
        </div>
      )}
      <dialog ref={dialog} className="village-dialog" onCancel={() => setExpanded(false)} onClose={() => setExpanded(false)}>
        <div className="village-dialog-heading">
          <div><h2>Votre village des senteurs</h2><p>Les maisons miniatures, les passants et la camionnette prennent vie.</p></div>
          <button type="button" onClick={() => setExpanded(false)} autoFocus aria-label="Fermer le village agrandi">Fermer ×</button>
        </div>
        {expanded && <div className="village-dialog-scene"><VillageAtStart onReady={setZoomReady} /></div>}
      </dialog>
    </>
  );
}
