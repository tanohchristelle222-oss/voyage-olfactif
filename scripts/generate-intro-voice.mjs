// Génère la voix de Nota pour l'introduction (public/voix/intro-1.wav, intro-2.wav, …)
// à partir des phrases de src/lib/intro.ts, avec Piper (synthèse vocale neuronale, gratuite, hors ligne).
//
// Voix choisie : « Jessica » (voix française fr_FR-upmc-medium, locutrice jessica).
//
// Prérequis : Piper et la voix dans le dossier ~/.piper (ou PIPER_DIR) :
//   https://github.com/rhasspy/piper/releases           → piper_windows_amd64.zip, à extraire
//   https://huggingface.co/rhasspy/piper-voices          → fr/fr_FR/upmc/medium (.onnx + .onnx.json)
//
// Utilisation (à relancer après chaque modification du texte de l'intro) :
//   npm run voix

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Réglages de la voix de Nota. */
const VOICE = {
  model: "fr_FR-upmc-medium",
  speaker: "jessica",
  lengthScale: 1.08, // débit (plus grand = plus lent)
  noiseScale: 0.5, // expressivité
  noiseW: 0.65, // variation du rythme
};

const PIPER_DIR = process.env.PIPER_DIR ?? join(homedir(), ".piper");
const exe = join(PIPER_DIR, "piper", process.platform === "win32" ? "piper.exe" : "piper");
const model = join(PIPER_DIR, `${VOICE.model}.onnx`);
for (const f of [exe, model, `${model}.json`]) {
  if (!existsSync(f)) {
    console.error(`Introuvable : ${f}\nInstallez Piper et la voix ${VOICE.model} (voir l'en-tête du script).`);
    process.exit(1);
  }
}

// La configuration récente de la voix contient des phonèmes de plusieurs caractères (« aɪ »…)
// que Piper 2023.11 refuse. Ils ne servent pas en français : on écrit une copie sans eux.
const config = join(PIPER_DIR, `${VOICE.model}.piper.json`);
const voiceConfig = JSON.parse(readFileSync(`${model}.json`, "utf8"));
for (const key of Object.keys(voiceConfig.phoneme_id_map)) {
  if ([...key].length !== 1) delete voiceConfig.phoneme_id_map[key];
}
writeFileSync(config, JSON.stringify(voiceConfig, null, 2), "utf8");

const speakerId = voiceConfig.speaker_id_map?.[VOICE.speaker];
if (VOICE.speaker && speakerId === undefined) {
  console.error(`Locutrice « ${VOICE.speaker} » introuvable dans ${VOICE.model}.`);
  process.exit(1);
}

// Les phrases de l'intro, dans l'ordre (champ `text` de chaque scène).
const source = readFileSync("src/lib/intro.ts", "utf8");
const block = source.slice(source.indexOf("export const SCENES"));
const lines = [...block.matchAll(/text: "((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`));
if (lines.length === 0) {
  console.error("Aucune phrase trouvée dans src/lib/intro.ts.");
  process.exit(1);
}

const outDir = join("public", "voix");
mkdirSync(outDir, { recursive: true });

lines.forEach((text, i) => {
  const out = join(outDir, `intro-${i + 1}.wav`);
  const args = [
    "--model", model,
    "--config", config,
    "--output_file", out,
    "--length_scale", String(VOICE.lengthScale),
    "--noise_scale", String(VOICE.noiseScale),
    "--noise_w", String(VOICE.noiseW),
    "--sentence_silence", "0.2",
  ];
  if (speakerId !== undefined) args.push("--speaker", String(speakerId));
  const res = spawnSync(exe, args, { input: Buffer.from(text, "utf8") });
  if (res.status !== 0) {
    console.error(`Échec pour la phrase ${i + 1} :`, res.stderr?.toString());
    process.exit(1);
  }
  console.log(`✓ ${out} (${Math.round(statSync(out).size / 1024)} Ko) — ${text}`);
});
