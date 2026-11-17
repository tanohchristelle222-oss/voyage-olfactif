"use client";

import { useEffect, useRef, useState } from "react";
import { useJourney } from "@/lib/journey";
import { fragranceState } from "./village/fragrance-state.mjs";

export default function ProjectVillageView() {
  const host = useRef<HTMLDivElement>(null);
  const { journey } = useJourney();
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;
    import("./village/project-village.mjs").then(({ mountProjectVillageView }) => {
      if (cancelled || !host.current) return;
      destroy = mountProjectVillageView(host.current, {
        state: fragranceState(journey),
        onReady: () => { if (!cancelled) setStatus("ready"); },
        onFallback: () => { if (!cancelled) setStatus("fallback"); },
      });
    }).catch(() => { if (!cancelled) setStatus("fallback"); });
    return () => { cancelled = true; destroy?.(); };
  }, [journey]);
  return <div className="project-village-view" role="img" aria-label="Village des fragrances animé : ateliers, personnes au travail, vanille, pistache et échantillons">
    <div ref={host} className="project-village-view-canvas" aria-hidden="true" />
    {status !== "ready" && <p role="status">{status === "loading" ? "Les ateliers prennent vie…" : "La vue 3D ne peut pas s’afficher dans ce navigateur."}</p>}
  </div>;
}
