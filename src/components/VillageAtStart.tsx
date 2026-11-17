"use client";

import { useEffect, useRef, useState } from "react";

/** Illustration 3D de la maison de départ, sans remplacer la carte ni ses sept épingles. */
export default function VillageAtStart({ onReady }: { onReady: (ready: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;
    import("./village/scene.mjs")
      .then(async ({ mount }) => {
        await document.fonts?.ready;
        if (cancelled || !host.current) return;
        destroy = mount(host.current, {
          // Les bâtiments sont décoratifs ici : seule l’épingle 1 ouvre la première étape.
          preview: true,
          completed: Array(7).fill(false),
          unlocked: -1,
          labels: [],
          onSelect: () => {},
          onReady: () => { if (!cancelled) { setReady(true); onReady(true); } },
          onFallback: () => { if (!cancelled) { setReady(false); setFailed(true); onReady(false); } },
        });
      })
      .catch(() => { if (!cancelled) { setReady(false); setFailed(true); onReady(false); } });
    return () => { cancelled = true; destroy?.(); };
  }, [onReady]);

  return (
    <div className={`start-village ${ready || failed ? "is-ready" : ""}`}>
      <div ref={host} className="start-village-canvas" aria-hidden="true" />
      {failed && <p className="village-zoom-fallback" role="status">Le village 3D ne peut pas s’afficher sur ce navigateur. La carte du parcours reste accessible.</p>}
    </div>
  );
}
