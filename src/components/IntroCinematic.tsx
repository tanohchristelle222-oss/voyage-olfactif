"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { POSITIONS } from "@/components/JourneyMap";
import { Nota } from "@/components/Nota";
import { STEP_LABELS } from "@/lib/journey";
import {
  introMuted,
  introSeen,
  markIntroSeen,
  REPLAY_EVENT,
  saveIntroMuted,
  SCENES,
} from "@/lib/intro";

/*
 * Introduction de Nota, posée sur la vraie page du voyage :
 * 1. un voile blanc léger, Nota s'avance au centre et se présente ;
 * 2. le voile disparaît, Nota se range dans un coin et présente brièvement chaque étape
 *    en faisant briller l'épingle correspondante sur la carte.
 */

const STEP_COLORS = ["#a4b26a", "#a4b26a", "#9678b0", "#c28921", "#0b1215"];

/** Voix utilisée pour les fichiers public/voix/ (à changer avec celle de scripts/generate-intro-voice.mjs). */
const VOICE_ID = "upmc-jessica";

/** Petite empreinte d'un texte (pour éviter de rejouer une ancienne voix restée en cache). */
function textHash(text: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Texte de la bulle, écrit lettre par lettre (la place finale est réservée pour éviter les sauts). */
function TypedText({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 30);
    return () => clearInterval(id);
  }, [text]);
  return (
    <>
      {text.slice(0, count)}
      <span className="invisible">{text.slice(count)}</span>
    </>
  );
}

const ZOOM = 1.6; // grossissement sur une étape
const ZOOM_MS = 1100; // durée du mouvement de caméra
const RECENTER = 0.75; // part du chemin parcouru vers le centre de l'écran (1 = pile au centre)

type Halo = { x: number; y: number; size: number };

/**
 * Zoome la carte (la scène 1440×900 de JourneyMap) sur l'épingle d'une étape,
 * ou revient à la vue normale si `step` est indéfini. Le titre de la page s'efface pendant le zoom.
 * Renvoie l'endroit exact où se trouvera la tête de l'épingle une fois le zoom terminé (pour le halo).
 */
function zoomOn(step: number | undefined): Halo | null {
  const frame = document.getElementById("voyage");
  const stage = frame?.firstElementChild as HTMLElement | null;
  if (!frame || !stage) return null;
  const edge = document.querySelector<HTMLElement>("[data-voyage-edge]");

  stage.style.transformOrigin = "0 0";
  stage.style.transition = `transform ${ZOOM_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
  if (edge) edge.style.transition = "opacity 500ms ease";

  if (step === undefined) {
    stage.style.transform = "translate(0px, 0px) scale(1)";
    if (edge) edge.style.opacity = "";
    return null;
  }

  // Sur petit écran, la carte peut être en partie hors de l'écran : on la centre d'abord.
  const before = frame.getBoundingClientRect();
  if (before.top < 0 || before.bottom > window.innerHeight) frame.scrollIntoView({ block: "center" });

  // Position de l'épingle dans la scène, sans zoom (offsetWidth ignore les transformations).
  const p = POSITIONS[step - 1];
  const W = stage.offsetWidth;
  const H = stage.offsetHeight;
  const lx = (p.x / 1440) * W;
  const ly = ((p.y - 60 - 35) / 900) * H;
  const fr = frame.getBoundingClientRect();
  const stageLeft = fr.left + (fr.width - stage.offsetWidth) / 2;
  const stageTop = fr.top + (fr.height - stage.offsetHeight) / 2;

  // Centre de la partie visible de la carte.
  const cx = (Math.max(fr.left, 0) + Math.min(fr.right, window.innerWidth)) / 2;
  const cy = (Math.max(fr.top, 0) + Math.min(fr.bottom, window.innerHeight)) / 2;
  const dx = (cx - (stageLeft + lx)) * RECENTER;
  const dy = (cy - (stageTop + ly)) * RECENTER;

  // Avec l'origine en (0,0) : le point (lx, ly) arrive à sa place + (dx, dy) après le zoom.
  const tx = dx - (ZOOM - 1) * lx;
  const ty = dy - (ZOOM - 1) * ly;
  stage.style.transform = `translate(${tx}px, ${ty}px) scale(${ZOOM})`;
  if (edge) edge.style.opacity = "0";

  // Tête de l'épingle (cercle de 24 unités de rayon, 52 unités au-dessus de la pointe) après le zoom.
  const headY = ((p.y - 52 - 60) / 900) * H;
  return {
    x: stageLeft + tx + ZOOM * lx,
    y: stageTop + ty + ZOOM * headY,
    size: (48 / 1440) * W * ZOOM * 1.75,
  };
}

function Intro({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(introMuted);
  const [speaking, setSpeaking] = useState(false);
  // Halo de l'étape présentée : affiché seulement s'il correspond à l'étape en cours (donc caché pendant le trajet).
  const [halo, setHalo] = useState<(Halo & { step: number }) | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Son bloqué par le navigateur (aucun clic sur la page) : un clic sur 🔊 relance la phrase.
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [retry, setRetry] = useState(0);

  const scene = SCENES[index];
  const presenting = scene.step === undefined; // phase 1 : voile blanc, Nota au centre
  const last = index === SCENES.length - 1;

  const go = useCallback((delta: number) => {
    setIndex((i) => Math.max(0, Math.min(SCENES.length - 1, i + delta)));
  }, []);

  const close = useCallback(() => {
    markIntroSeen();
    audioRef.current?.pause();
    // Dès la fermeture : la carte dézoome et la Nota de la page réapparaît (sans attendre la fin du fondu).
    zoomOn(undefined);
    document.querySelectorAll<HTMLElement>(".nota-greeting").forEach((g) => (g.style.visibility = ""));
    onClose();
  }, [onClose]);

  // Zoom de la carte sur l'épingle présentée (vue d'ensemble pendant la présentation).
  // Le halo n'apparaît qu'une fois la caméra arrêtée, directement à la bonne place.
  useLayoutEffect(() => {
    const step = scene.step;
    let timer = 0;
    const move = () => {
      const target = zoomOn(step);
      clearTimeout(timer);
      if (step !== undefined && target) {
        timer = window.setTimeout(() => setHalo({ ...target, step }), ZOOM_MS);
      }
    };
    move();
    window.addEventListener("resize", move);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", move);
    };
  }, [scene.step]);

  // À la fermeture : la carte revient à sa taille normale et le titre réapparaît.
  useEffect(() => () => void zoomOn(undefined), []);

  // Voix de Nota + passage automatique à la scène suivante.
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const next = () => {
      if (!cancelled && !last) setIndex((i) => Math.min(i + 1, SCENES.length - 1));
    };
    // La toute première phrase attend que Nota soit arrivée au centre.
    const startDelay = index === 0 ? 1100 : 250;
    const readingTime = 1400 + scene.text.length * 55;
    // Voix enregistrée (générée avec Piper : scripts/generate-intro-voice.mjs).
    // L'empreinte (voix + texte) force le navigateur à recharger le son quand la voix ou la phrase change.
    const audio = new Audio(`/voix/intro-${index + 1}.wav?t=${textHash(VOICE_ID + scene.text)}`);
    audio.preload = "auto";
    audioRef.current = audio;

    timers.push(
      window.setTimeout(() => {
        if (cancelled) return;
        if (muted) {
          timers.push(window.setTimeout(next, readingTime));
          return;
        }
        audio.onplaying = () => !cancelled && setSpeaking(true);
        audio.onended = () => {
          if (cancelled) return;
          setSpeaking(false);
          timers.push(window.setTimeout(next, 600));
        };
        audio.onerror = () => {
          if (cancelled) return;
          setSpeaking(false);
          timers.push(window.setTimeout(next, readingTime));
        };
        audio.play().catch(() => {
          // Le navigateur bloque le son tant qu'on n'a pas cliqué sur la page : on continue sans voix.
          if (cancelled) return;
          setSoundBlocked(true);
          timers.push(window.setTimeout(next, readingTime));
        });
        // Sécurité : si le son ne se termine jamais, on avance quand même.
        timers.push(window.setTimeout(next, readingTime * 2 + 3000));
      }, startDelay),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      audio.pause();
      setSpeaking(false);
    };
  }, [index, muted, last, scene.text, retry]);

  // Clavier, défilement bloqué, et la Nota de la page masquée pendant l'intro.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // La Nota de la page s'efface : c'est la Nota présentatrice qui parle.
    const greetings = [...document.querySelectorAll<HTMLElement>(".nota-greeting")];
    greetings.forEach((g) => (g.style.visibility = "hidden"));
    nextRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      greetings.forEach((g) => (g.style.visibility = ""));
    };
  }, [close, go]);

  function toggleMute() {
    if (soundBlocked || muted) {
      // Ce clic autorise le son : on (ré)active la voix et on relance la phrase en cours.
      setSoundBlocked(false);
      setMuted(false);
      saveIntroMuted(false);
      setRetry((r) => r + 1);
      return;
    }
    setMuted(true);
    saveIntroMuted(true);
  }

  const step = scene.step;
  const color = step ? STEP_COLORS[step - 1] : undefined;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Présentation du parcours par Nota"
      className="fixed inset-0 z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      {/* voile blanc léger : présent pendant la présentation, retiré pour les étapes */}
      <motion.div
        className="absolute inset-0 bg-white/75 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: presenting ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* halo doré autour de l'épingle présentée */}
      <AnimatePresence>
        {halo && halo.step === step && (
          <motion.span
            key={`${halo.step}-${Math.round(halo.x)}-${Math.round(halo.y)}`}
            className="pointer-events-none fixed rounded-full border-[3px] border-[#c28921] shadow-[0_0_24px_rgba(194,137,33,0.45)]"
            style={{ left: halo.x - halo.size / 2, top: halo.y - halo.size / 2, width: halo.size, height: halo.size }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: [1, 1.15, 1] }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ opacity: { duration: 0.3 }, scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } }}
          />
        )}
      </AnimatePresence>

      {/* commandes discrètes */}
      <div className="absolute right-4 top-20 flex gap-2 sm:right-8">
        <motion.button
          onClick={toggleMute}
          aria-label={muted || soundBlocked ? "Activer la voix de Nota" : "Couper la voix de Nota"}
          animate={soundBlocked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={soundBlocked ? { duration: 1, repeat: Infinity } : undefined}
          className={`flex h-9 items-center gap-2 rounded-full bg-white/90 px-2.5 text-sm shadow-md shadow-navy/10 ring-1 transition hover:bg-white ${
            soundBlocked ? "ring-[#c28921]" : "ring-navy/10"
          }`}
        >
          <span aria-hidden>{muted || soundBlocked ? "🔇" : "🔊"}</span>
          {soundBlocked && <span className="pr-1 text-xs text-navy/70">Activer le son</span>}
        </motion.button>
        <button
          onClick={close}
          className="rounded-full bg-white/90 px-4 py-2 text-sm text-navy/70 shadow-md shadow-navy/10 ring-1 ring-navy/10 transition hover:bg-white hover:text-navy"
        >
          Passer ✕
        </button>
      </div>

      {/* Nota et sa bulle : au centre pendant la présentation, puis en bas à gauche pour les étapes */}
      <motion.div
        className="absolute flex items-end gap-3 sm:gap-4"
        initial={{ left: "50%", bottom: "24%", x: "-50%" }}
        animate={presenting ? { left: "50%", bottom: "24%", x: "-50%" } : { left: "2%", bottom: "3%", x: "0%" }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
      >
        {/* Nota s'avance depuis la gauche de l'écran */}
        <motion.div
          className="shrink-0"
          style={{ transformOrigin: "50% 100%" }}
          initial={{ x: "-60vw" }}
          animate={{ x: 0, scale: presenting ? 1 : 0.75 }}
          transition={{ x: { duration: 1, ease: [0.22, 1, 0.36, 1] }, scale: { duration: 0.9 } }}
        >
          <Nota size={130} talking={muted || speaking} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 220, damping: 20 }}
          style={{ transformOrigin: "left bottom" }}
          className="relative mb-10 w-[min(26rem,calc(100vw-9rem))] rounded-3xl bg-white p-5 shadow-2xl shadow-navy/15 ring-1 ring-navy/5"
        >
          <span className="absolute -left-2 bottom-8 h-4 w-4 rotate-45 bg-white" />

          <AnimatePresence mode="wait">
            {step !== undefined && (
              <motion.p
                key={step}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-navy"
                style={{ background: `${color}22` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                Étape {step} · {STEP_LABELS[step - 1]}
              </motion.p>
            )}
          </AnimatePresence>

          <p aria-live="polite" className="relative text-[15px] leading-relaxed text-navy sm:text-base">
            <TypedText key={index} text={scene.text} />
          </p>

          <div className="relative mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-navy/40">
              {index + 1} / {SCENES.length}
            </span>
            {last ? (
              <motion.button
                ref={nextRef}
                onClick={close}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy/25"
              >
                C&apos;est parti ! →
              </motion.button>
            ) : (
              <button
                ref={nextRef}
                onClick={() => go(1)}
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-navy/20 transition hover:-translate-y-0.5"
              >
                Suivant ›
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Affiche l'introduction la première fois qu'un utilisateur arrive sur son voyage,
 * et à chaque demande « Revoir l'introduction ».
 */
export default function IntroCinematic() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Petit délai : la carte s'affiche et les épingles tombent, puis Nota arrive.
    const timer = window.setTimeout(() => {
      if (!introSeen()) setOpen(true);
    }, 2600);
    const replay = () => setOpen(true);
    window.addEventListener(REPLAY_EVENT, replay);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(REPLAY_EVENT, replay);
    };
  }, []);

  return <AnimatePresence>{open && <Intro key="intro" onClose={() => setOpen(false)} />}</AnimatePresence>;
}
