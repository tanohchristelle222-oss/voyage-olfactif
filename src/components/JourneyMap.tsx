"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { STEP_LABELS, useJourney } from "@/lib/journey";
import { Bottles, Flowers, Forest, IllustrationDefs, Shop, Vanilla } from "./Illustrations";

/* Repère de la carte : viewBox "0 60 1440 900" (ratio 1.6). */

const ROAD =
  "M -80 1120 C 60 960, 120 885, 164 855 " +
  "C 260 790, 470 760, 536 692 " +
  "C 590 640, 520 590, 420 580 " +
  "C 320 570, 330 470, 480 470 " +
  "C 560 470, 610 488, 665 488 " +
  "C 760 488, 850 600, 942 592 " +
  "C 1040 585, 1120 520, 1185 513 " +
  "C 1290 500, 1290 410, 1150 400 " +
  "C 1040 392, 900 400, 930 342 " +
  "C 960 285, 1060 268, 1140 259 " +
  // fin de la route : elle arrive sur le seuil en bois du laboratoire (étape 5)
  "C 1172 255, 1196 262, 1220 268";

type Step = { n: number; x: number; y: number; ring: string; label: string };
type Status = "done" | "current" | "locked";

// 5 étapes réparties le long de la route : de la boutique jusqu'à l'atelier du parfumeur.
export const POSITIONS = [
  { x: 164, y: 855, ring: "#a4b26a" }, // 1. Votre projet — près de la boutique
  { x: 665, y: 488, ring: "#a4b26a" }, // 2. Les contraintes — le verger
  { x: 942, y: 592, ring: "#9678b0" }, // 3. Famille olfactive — les champs de fleurs
  { x: 1185, y: 513, ring: "#c28921" }, // 4. Votre brief — la forêt
  { x: 1040, y: 276, ring: "#0b1215" }, // 5. Vos échantillons — juste avant l'atelier du parfumeur
];
const STEPS: Step[] = POSITIONS.map((p, i) => ({ ...p, n: i + 1, label: STEP_LABELS[i] }));

const ZONES = [
  { label: "Notes de tête · Le verger", dot: "#a4b26a", left: "2.9%", top: "61.5%", delay: 1.4 },
  { label: "L'atelier du parfumeur", dot: "#0b1215", left: "69.5%", top: "2.4%", delay: 2.4 },
  { label: "Notes de cœur · Les champs de fleurs", dot: "#9678b0", left: "41.8%", top: "93.5%", delay: 1.8 },
  { label: "Notes de fond · La forêt", dot: "#c28921", left: "79.9%", top: "93.5%", delay: 2.1 },
];

const PARTICLES = [
  { x: 300, y: 420, c: "#c9d29a" }, { x: 820, y: 760, c: "#c9b8d8" }, { x: 980, y: 700, c: "#c9b8d8" },
  { x: 1040, y: 470, c: "#c9b8d8" }, { x: 1300, y: 560, c: "#e7b36f" }, { x: 420, y: 300, c: "#c9d29a" },
  { x: 600, y: 860, c: "#c9b8d8" }, { x: 1380, y: 400, c: "#e7b36f" },
];

/** Épaisseur visible de la route (en unités de la carte). */
const ROAD_DEPTH = 16;

const draw = (delay = 0) => ({
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: 2.4, delay, ease: "easeInOut" as const },
});

type MilestoneProps = {
  step: Step;
  index: number;
  status: Status;
  onHover: (i: number | null) => void;
  onOpen: (n: number) => void;
};

function Milestone({ step, index, status, onHover, onOpen }: MilestoneProps) {
  const current = status === "current";
  const done = status === "done";
  const locked = status === "locked";
  const delay = 0.7 + index * 0.28; // les épingles tombent au fil du tracé de la route
  return (
    <g transform={`translate(${step.x} ${step.y})`}>
      {/* ombre au sol : grandit quand l'épingle se pose */}
      <motion.ellipse
        cy="2" rx="13" ry="4.5" fill="#3b2a12"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ delay: delay + 0.25, duration: 0.35 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
      {current && (
        <motion.ellipse
          cy="2" rx="14" ry="5" fill="none" stroke="#c28921" strokeWidth="2.5"
          animate={{ rx: [14, 40], ry: [5, 14], opacity: [0.9, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: delay + 0.6 }}
        />
      )}
      {/* chute avec rebond */}
      <motion.g
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, y: { type: "spring", stiffness: 420, damping: 13, delay }, opacity: { duration: 0.15, delay } }}
      >
        <motion.g
          animate={current ? { y: [0, -6, 0] } : undefined}
          transition={current ? { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: delay + 0.8 } : undefined}
        >
        <motion.g
          className="milestone"
          role="button"
          tabIndex={0}
          aria-label={`Étape ${step.n} : ${step.label}${done ? " (terminée)" : locked ? " (à venir)" : ""}`}
          aria-disabled={locked}
          whileHover={locked ? { scale: 1.04 } : { scale: 1.12, y: -6 }}
          whileFocus={locked ? { scale: 1.04 } : { scale: 1.12, y: -6 }}
          whileTap={locked ? undefined : { scale: 0.94 }}
          onHoverStart={() => onHover(index)}
          onHoverEnd={() => onHover(null)}
          onFocus={() => onHover(index)}
          onBlur={() => onHover(null)}
          onClick={() => !locked && onOpen(step.n)}
          onKeyDown={(e) => {
            if (!locked && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onOpen(step.n);
            }
          }}
          style={{ cursor: locked ? "default" : "pointer", transformBox: "fill-box", transformOrigin: "50% 100%" }}
        >
          {/* corps de l'épingle (pointe en 0,0) */}
          <path
            className="ring"
            d="M0 0 C -5 -11, -24 -30, -24 -52 A 24 24 0 1 1 24 -52 C 24 -30, 5 -11, 0 0 Z"
            fill={step.ring}
            stroke={step.ring}
            strokeWidth="1"
          />
          {/* moitié droite plus sombre : volume */}
          <path d="M0 0 C 5 -11, 24 -30, 24 -52 A 24 24 0 0 0 0 -76 L 0 0 Z" fill="#000" opacity="0.14" />
          {/* reflet */}
          <path d="M-15 -62 A 17 17 0 0 1 -4 -71" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.45" />
          {/* pastille blanche */}
          <circle cy="-52" r="16" fill="#ffffff" />
          <circle cy="-52" r="16" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="2" />
          {done ? (
            <motion.path
              d="M-7 -52 L-2 -47 L8 -58"
              fill="none" stroke={step.ring} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: delay + 0.5, duration: 0.45 }}
            />
          ) : (
            <text
              y="-51" textAnchor="middle" dominantBaseline="central"
              fontFamily="var(--font-jost)" fontWeight="600" fontSize="18" fill="#0b1215"
            >
              {step.n}
            </text>
          )}
        </motion.g>
        </motion.g>
      </motion.g>
    </g>
  );
}

function Tooltip({ step, status }: { step: Step; status: Status }) {
  const label = status === "locked" ? `${step.label} · à venir` : status === "done" ? `${step.label} ✓` : step.label;
  const w = label.length * 8.4 + 32;
  return (
    <motion.g
      initial={{ opacity: 0, y: step.y - 86 }}
      animate={{ opacity: 1, y: step.y - 98 }}
      exit={{ opacity: 0, y: step.y - 86 }}
      transition={{ duration: 0.18 }}
      style={{ x: step.x, pointerEvents: "none" }}
    >
      <rect x={-w / 2} y="-34" width={w} height="34" rx="17" fill="#0b1215" />
      <path d="M-7 -1 L0 7 L7 -1 Z" fill="#0b1215" />
      <text y="-17" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="600" fill="#fff">
        {label}
      </text>
    </motion.g>
  );
}

export default function JourneyMap({
  overlay,
  edgeOverlay,
  preview = false,
}: {
  /** Aperçu décoratif (page d'accueil) : non cliquable, sans étiquettes ni calques. */
  preview?: boolean;
  /** Éléments posés sur la carte (alignés sur la scène). */
  overlay?: React.ReactNode;
  /** Éléments alignés sur le bord gauche de l'écran. */
  edgeOverlay?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setScale(el.offsetWidth / 1440);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);
  const router = useRouter();
  const { journey, current } = useJourney();
  const statusOf = (n: number): Status =>
    journey.completed.includes(n) ? "done" : n === current ? "current" : "locked";
  const open = (n: number) => router.push(`/etape/${n}`);

  return (
    // Cadre extérieur : sur grand écran il occupe toute la hauteur restante (sans scroll).
    <div
      id={preview ? undefined : "voyage"}
      aria-hidden={preview || undefined}
      className={
        preview
          ? "pointer-events-none relative aspect-[1440/900] w-full overflow-hidden"
          : "relative aspect-[1440/900] w-full overflow-hidden bg-cream lg:aspect-auto lg:h-full lg:[container-type:size]"
      }
    >
      {/* Scène 1440×900 : la plus grande possible qui tienne dans le cadre, centrée. */}
      <div
        ref={stageRef}
        className={`absolute left-1/2 top-1/2 aspect-[1440/900] w-full -translate-x-1/2 -translate-y-1/2 ${
          preview ? "" : "lg:w-[min(100cqw,160cqh)]"
        }`}
      >
      <svg
        viewBox="0 60 1440 900"
        className="absolute inset-0 h-full w-full"
        style={{ overflow: "visible" }}
        role="img"
        aria-label="Carte du voyage olfactif en cinq étapes"
      >
        <defs>
          <filter id="soft" filterUnits="userSpaceOnUse" x="-2000" y="-1500" width="5440" height="4000">
            <feGaussianBlur stdDeviation="80" />
          </filter>
          <filter id="road-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <radialGradient id="traveler">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.5" stopColor="#ffe9b0" />
            <stop offset="1" stopColor="#ffe9b0" stopOpacity="0" />
          </radialGradient>
          <IllustrationDefs />
        </defs>

        {/* Fond : trois territoires aux couleurs des familles de notes */}
        {/* Le fond déborde de la scène pour remplir les côtés sur les écrans très larges. */}
        <rect x="-2000" y="-1500" width="5440" height="4000" fill="#faf9f6" />
        <g filter="url(#soft)">
          <ellipse cx="-500" cy="300" rx="700" ry="700" fill="#e9ecd6" />
          <ellipse cx="-400" cy="950" rx="600" ry="300" fill="#f5f3ee" />
          <ellipse cx="1950" cy="550" rx="700" ry="800" fill="#e9e0cf" />
          <ellipse cx="1800" cy="0" rx="500" ry="300" fill="#f1eef2" />
          <ellipse cx="200" cy="200" rx="620" ry="360" fill="#e9ecd6" />
          <ellipse cx="1050" cy="170" rx="380" ry="220" fill="#f1eef2" />
          <ellipse cx="760" cy="660" rx="520" ry="360" fill="#ebe6ef" />
          <ellipse cx="1380" cy="660" rx="420" ry="520" fill="#e9e0cf" />
          <ellipse cx="80" cy="860" rx="360" ry="200" fill="#f5f3ee" />
        </g>

        {/* Particules qui flottent */}
        {PARTICLES.map((p, i) => (
          <motion.circle
            key={i} cx={p.x} r="4" fill={p.c}
            initial={{ cy: p.y, opacity: 0 }}
            animate={{ cy: [p.y, p.y - 60], opacity: [0, 0.9, 0] }}
            transition={{ duration: 6 + (i % 3), repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
          />
        ))}

        {/* La route en relief : un ruban épais (ombre, tranche, bordure, surface, pointillés).
            Un masque animé la révèle progressivement, comme un serpent. */}
        <mask id="road-reveal" maskUnits="userSpaceOnUse" x="-2000" y="-1500" width="5440" height="4000">
          <motion.path
            d={ROAD} fill="none" stroke="#fff" strokeWidth="190" strokeLinecap="round" strokeLinejoin="round"
            transform={`translate(0 ${ROAD_DEPTH / 2})`}
            {...draw()}
          />
        </mask>
        {/* Fondu de la fin de la route : elle s'efface doucement en entrant dans le laboratoire */}
        <linearGradient id="road-end-fade" gradientUnits="userSpaceOnUse" x1="1185" y1="250" x2="1222" y2="280">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="road-end" maskUnits="userSpaceOnUse" x="-2000" y="-1500" width="5440" height="4000">
          <rect x="-2000" y="-1500" width="5440" height="4000" fill="#fff" />
          {/* uniquement autour de l'entrée du labo (la boucle de l'étape 4, plus bas, n'est pas touchée) */}
          <rect x="1100" y="200" width="500" height="150" fill="url(#road-end-fade)" />
        </mask>
        <g mask="url(#road-end)">
        <g mask="url(#road-reveal)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* ombre portée au sol */}
          <path d={ROAD} stroke="#5a4426" strokeWidth="74" opacity="0.16" transform={`translate(6 ${ROAD_DEPTH + 14})`} filter="url(#road-shadow)" />
          {/* tranche (épaisseur) : copies empilées vers le bas, plus foncées en bas */}
          <path d={ROAD} stroke="#9c7f52" strokeWidth="64" transform={`translate(0 ${ROAD_DEPTH})`} />
          {Array.from({ length: ROAD_DEPTH / 2 - 1 }, (_, i) => {
            const y = ROAD_DEPTH - 2 - i * 2;
            return <path key={y} d={ROAD} stroke={y > ROAD_DEPTH / 2 ? "#b8996a" : "#c9ad80"} strokeWidth="62" transform={`translate(0 ${y})`} />;
          })}
          {/* bordure de la surface qui accroche la lumière */}
          <path d={ROAD} stroke="#e2cfab" strokeWidth="62" />
          <path d={ROAD} stroke="#efe6d4" strokeWidth="56" />
          {/* surface */}
          <path d={ROAD} stroke="#fdfcf9" strokeWidth="50" />
          <path d={ROAD} stroke="#ffffff" strokeWidth="10" opacity="0.8" transform="translate(-3 -9)" />
          {/* marquage central */}
          <path d={ROAD} stroke="#d8c39b" strokeWidth="3.5" strokeDasharray="16 14" />
        </g>
        </g>

        {/* Lueur qui parcourt la route */}
        <g opacity="0">
          <animate attributeName="opacity" from="0" to="1" begin="2.6s" dur="0.6s" fill="freeze" />
          <circle r="16" fill="url(#traveler)">
            <animateMotion dur="18s" begin="2.6s" repeatCount="indefinite" path={ROAD} />
          </circle>
        </g>

        {/* Illustrations */}
        <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
          <Shop />
        </motion.g>
        <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }}>
          <Bottles />
        </motion.g>
        <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }}>
          <Flowers />
        </motion.g>
        <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9, duration: 0.8 }}>
          <Vanilla />
          <Forest />
        </motion.g>
        {/* L'atelier du parfumeur : le laboratoire des échantillons (étape 5), au bout de la route */}
        <motion.g
          initial={{ opacity: 0, y: -24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 2.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        >
          <ellipse cx="1308" cy="318" rx="122" ry="14" fill="#3b2a12" opacity="0.1" />
          {/* le seuil en bois (en bas à gauche de l'image) tombe pile au bout de la route */}
          <image href="/atelier.webp" x="1164" y="93" width="260" height="231" preserveAspectRatio="xMidYMid meet" />
        </motion.g>

        {/* Étapes */}
        {STEPS.map((s, i) => (
          <Milestone key={s.n} step={s} index={i} status={statusOf(s.n)} onHover={setHovered} onOpen={open} />
        ))}
        <AnimatePresence>{hovered !== null && <Tooltip key={hovered} step={STEPS[hovered]} status={statusOf(hovered + 1)} />}</AnimatePresence>
      </svg>

      {/* Calque HTML dessiné en 1440×900 puis mis à l'échelle de la scène : tout reste aligné. */}
      {scale !== null && !preview && (
        <div
          className="pointer-events-none absolute left-0 top-0 hidden origin-top-left lg:block"
          style={{ width: 1440, height: 900, transform: `scale(${scale})` }}
        >
          {ZONES.map((z) => (
            <motion.span
              key={z.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: z.delay, duration: 0.5 }}
              style={{ left: z.left, top: z.top }}
              className="absolute inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-navy shadow-sm"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: z.dot }} />
              {z.label}
            </motion.span>
          ))}
          {overlay}
        </div>
      )}
      </div>

      {/* Calque collé au bord gauche de l'écran (et non de la carte), même échelle que la scène. */}
      {scale !== null && edgeOverlay && !preview && (
        <div
          data-voyage-edge
          className="pointer-events-none absolute left-0 hidden origin-top-left lg:block"
          style={{ top: `calc(50% - ${450 * scale}px)`, width: 1440, height: 900, transform: `scale(${scale})` }}
        >
          {edgeOverlay}
        </div>
      )}
    </div>
  );
}
