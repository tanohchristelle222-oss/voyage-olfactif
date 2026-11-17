"use client";

import { motion } from "motion/react";

/* Illustrations SVG de la carte. Coordonnées dans le repère 1440 × 900 de JourneyMap. */

const center = { transformBox: "fill-box", transformOrigin: "center" } as const;
const bottom = { transformBox: "fill-box", transformOrigin: "50% 100%" } as const;

export function IllustrationDefs() {
  return (
    <>
      <linearGradient id="warm-window" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fbe7c2" />
        <stop offset="1" stopColor="#f2c98a" />
      </linearGradient>
      <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6b45a" />
        <stop offset="1" stopColor="#d9731f" />
      </linearGradient>
      <radialGradient id="flame-glow">
        <stop offset="0" stopColor="#ffd98a" stopOpacity="0.8" />
        <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
      </radialGradient>
    </>
  );
}

/** La boutique : point de départ du voyage. */
export function Shop() {
  const stripes = Array.from({ length: 10 }, (_, i) => i);
  return (
    <g transform="translate(26 650)">
      <ellipse cx="80" cy="154" rx="86" ry="12" fill="#000" opacity="0.07" />
      <rect x="8" y="34" width="144" height="116" rx="3" fill="#f6eee2" stroke="#e4d5bf" strokeWidth="2" />
      <rect x="0" y="0" width="160" height="15" rx="3" fill="#efe2cc" />
      <rect x="4" y="15" width="152" height="8" fill="#e3d2b5" />
      {stripes.map((i) => (
        <g key={i} fill={i % 2 ? "#ffffff" : "#0b1215"}>
          <rect x={4 + i * 15.2} y="23" width="15.2" height="26" />
          <circle cx={4 + i * 15.2 + 7.6} cy="49" r="7.6" />
        </g>
      ))}
      <rect x="22" y="74" width="36" height="76" rx="2" fill="#0b1215" />
      <rect x="28" y="82" width="24" height="30" rx="1" fill="#f3d9a6" opacity="0.9" />
      <circle cx="51" cy="122" r="2.2" fill="#c28921" />
      <rect x="68" y="70" width="74" height="54" fill="url(#warm-window)" stroke="#e4d5bf" strokeWidth="4" />
      <motion.rect
        x="70" y="72" width="70" height="50" fill="#fff6d8"
        animate={{ opacity: [0.1, 0.45, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <line x1="105" y1="70" x2="105" y2="124" stroke="#e4d5bf" strokeWidth="3" />
      <rect x="64" y="124" width="82" height="6" fill="#e3d2b5" />
    </g>
  );
}

/** Flacon, bougie et pot de crème. */
export function Bottles() {
  return (
    <g transform="translate(628 688)">
      <ellipse cx="74" cy="122" rx="82" ry="10" fill="#000" opacity="0.07" />
      {/* grand flacon */}
      <rect x="20" y="0" width="22" height="10" rx="2" fill="#c28921" />
      <rect x="24" y="10" width="14" height="10" fill="#d9b763" />
      <rect x="6" y="20" width="50" height="98" rx="7" fill="#f7f1e8" stroke="#e5d8c6" strokeWidth="2" />
      <rect x="16" y="40" width="30" height="34" rx="3" fill="#0b1215" />
      <rect x="21" y="45" width="20" height="24" fill="none" stroke="#c28921" strokeWidth="1.5" />
      <rect x="11" y="26" width="5" height="82" rx="2.5" fill="#fff" opacity="0.8" />
      {/* bougie */}
      <motion.circle
        cx="82" cy="44" r="20" fill="url(#flame-glow)"
        animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={center}
      />
      <rect x="62" y="58" width="40" height="60" rx="6" fill="#f4ebe1" stroke="#e5d8c6" strokeWidth="2" />
      <ellipse cx="82" cy="62" rx="16" ry="4" fill="#efe3d3" />
      <line x1="82" y1="60" x2="82" y2="52" stroke="#5a463a" strokeWidth="1.5" />
      <motion.path
        d="M82 36 C 82 36, 88 44, 88 48 A 6 6 0 0 1 76 48 C 76 44, 82 36, 82 36 Z"
        fill="#f6b84a"
        animate={{ scaleY: [1, 1.15, 0.95, 1.1, 1], rotate: [-3, 3, -2, 2, -3] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={bottom}
      />
      {/* pot de crème */}
      <rect x="92" y="80" width="56" height="12" rx="3" fill="#c28921" />
      <rect x="95" y="92" width="50" height="26" rx="4" fill="#fff" stroke="#e5d8c6" strokeWidth="2" />
      <rect x="105" y="99" width="30" height="10" rx="2" fill="#f1e7d8" />
    </g>
  );
}

function Rose({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#e98395" />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="#f19aaa" />
      <path
        d={`M${cx - r * 0.5} ${cy} A ${r * 0.5} ${r * 0.5} 0 1 1 ${cx + r * 0.25} ${cy + r * 0.4} M${cx - r * 0.2} ${cy} A ${r * 0.22} ${r * 0.22} 0 1 1 ${cx + r * 0.1} ${cy + r * 0.15}`}
        stroke="#d26a7e" strokeWidth={r * 0.1} fill="none" strokeLinecap="round"
      />
    </g>
  );
}

function Jasmine({ cx, cy, s = 1 }: { cx: number; cy: number; s?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-10" rx="5.5" ry="10" fill="#fffdf6" stroke="#ece6d8" strokeWidth="1" transform={`rotate(${a})`} />
      ))}
      <circle r="4" fill="#f2d36b" />
    </g>
  );
}

/** Roses et jasmin qui se balancent. */
export function Flowers() {
  return (
    <motion.g
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={bottom}
    >
      <g transform="translate(670 335)">
        <ellipse cx="60" cy="58" rx="22" ry="8" fill="#7ba66b" transform="rotate(-25 60 58)" />
        <ellipse cx="20" cy="62" rx="20" ry="7" fill="#8bb36b" transform="rotate(30 20 62)" />
        <ellipse cx="128" cy="96" rx="22" ry="7" fill="#7ba66b" transform="rotate(-35 128 96)" />
        <ellipse cx="152" cy="82" rx="18" ry="6" fill="#8bb36b" transform="rotate(20 152 82)" />
        <ellipse cx="110" cy="20" rx="16" ry="6" fill="#8bb36b" transform="rotate(-40 110 20)" />
        <Rose cx={34} cy={42} r={22} />
        <Rose cx={66} cy={66} r={18} />
        <Jasmine cx={106} cy={10} s={0.9} />
        <Jasmine cx={130} cy={80} s={1.1} />
        <Jasmine cx={156} cy={98} s={0.85} />
        <Jasmine cx={120} cy={104} s={0.7} />
      </g>
    </motion.g>
  );
}

function Sparkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.path
      d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`}
      fill="#e9cd8c"
      animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, delay }}
      style={center}
    />
  );
}

/** L'atelier du parfumeur : cloche en verre avec deux flacons. */
export function Dome() {
  return (
    <g transform="translate(1228 62)">
      <ellipse cx="82" cy="172" rx="96" ry="14" fill="#000" opacity="0.08" />
      <ellipse cx="82" cy="158" rx="90" ry="16" fill="#c28921" />
      <rect x="-8" y="146" width="180" height="12" fill="#d4ad5c" />
      <ellipse cx="82" cy="146" rx="90" ry="16" fill="#ebd295" />
      {/* flacon crème */}
      <rect x="36" y="88" width="18" height="10" rx="2" fill="#c28921" />
      <rect x="26" y="98" width="38" height="50" rx="5" fill="#f7f1e8" stroke="#e2d5c2" strokeWidth="2" />
      <rect x="33" y="110" width="24" height="22" fill="#fff" stroke="#e2d5c2" strokeWidth="1.5" />
      {/* flacon bleu nuit */}
      <rect x="88" y="62" width="26" height="14" rx="2" fill="#0b1215" />
      <rect x="94" y="76" width="14" height="6" fill="#c28921" />
      <rect x="78" y="82" width="46" height="66" rx="6" fill="#1c2328" />
      <rect x="88" y="98" width="26" height="30" fill="#f7f1e8" />
      <rect x="92" y="102" width="18" height="22" fill="none" stroke="#c28921" strokeWidth="1.2" />
      <rect x="82" y="88" width="4" height="54" rx="2" fill="#fff" opacity="0.25" />
      {/* cloche */}
      <path d="M14 146 L14 70 A 68 68 0 0 1 150 70 L150 146" fill="#fff" fillOpacity="0.3" stroke="#fff" strokeWidth="3" strokeOpacity="0.95" />
      <path d="M30 120 L30 72 A 52 52 0 0 1 60 26" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
      <ellipse cx="82" cy="-2" rx="9" ry="6" fill="#ebd295" />
      <Sparkle x={0} y={40} delay={0} />
      <Sparkle x={170} y={20} delay={0.8} />
      <Sparkle x={160} y={110} delay={1.6} />
    </g>
  );
}

function Drop({ x, y, s, delay }: { x: number; y: number; s: number; delay: number }) {
  return (
    <motion.path
      d="M0 -14 C 0 -14, 10 -2, 10 5 A 10 10 0 0 1 -10 5 C -10 -2, 0 -14, 0 -14 Z"
      fill="url(#amber)"
      initial={{ x, y, scale: s }}
      animate={{ y: [y, y + 8, y] }}
      transition={{ duration: 2.6, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

/** Gousses de vanille, fleur et gouttes d'ambre. */
export function Vanilla() {
  return (
    <g transform="translate(1222 618)">
      <path d="M0 64 C 50 44, 110 28, 168 10" stroke="#3e2618" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M12 78 C 62 60, 122 48, 174 30" stroke="#5a3a26" strokeWidth="6" strokeLinecap="round" fill="none" />
      <g transform="translate(118 42)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-14" rx="8" ry="15" fill="#fbf6ea" stroke="#eadfca" transform={`rotate(${a})`} />
        ))}
        <circle r="6" fill="#f1d27a" />
      </g>
      <Drop x={148} y={78} s={1.2} delay={0} />
      <Drop x={178} y={60} s={0.85} delay={0.6} />
      <Drop x={174} y={96} s={0.6} delay={1.2} />
    </g>
  );
}

function Pine({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse rx="40" ry="8" fill="#000" opacity="0.08" />
      <rect x="-5" y="-18" width="10" height="18" fill="#7a5536" />
      <polygon points="0,-84 -40,-16 40,-16" fill="#3e6a4b" />
      <polygon points="0,-84 -40,-16 0,-16" fill="#5b8a62" />
      <polygon points="0,-112 -32,-58 32,-58" fill="#3e6a4b" />
      <polygon points="0,-112 -32,-58 0,-58" fill="#5b8a62" />
      <polygon points="0,-136 -24,-92 24,-92" fill="#3e6a4b" />
      <polygon points="0,-136 -24,-92 0,-92" fill="#5b8a62" />
    </g>
  );
}

/** La forêt des notes de fond. */
export function Forest() {
  return (
    <g>
      <Pine x={1070} y={872} s={0.6} />
      <Pine x={1132} y={850} s={1.05} />
      <Pine x={1306} y={826} s={0.95} />
      <Pine x={1210} y={892} s={0.9} />
    </g>
  );
}
