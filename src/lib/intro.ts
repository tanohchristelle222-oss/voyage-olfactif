"use client";

/* Introduction animée de Nota : vue une seule fois, puis rejouable à la demande. */

const SEEN_KEY = "voyage-olfactif:intro-vue";
const MUTE_KEY = "voyage-olfactif:intro-muet";
/** Événement qui demande de rejouer l'introduction (bouton « Revoir l'introduction »). */
export const REPLAY_EVENT = "nota:revoir-intro";

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible : tant pis, l'intro pourra réapparaître */
  }
}

export const introSeen = () => read(SEEN_KEY) === "1";
export const markIntroSeen = () => write(SEEN_KEY, "1");
export const introMuted = () => read(MUTE_KEY) === "1";
export const saveIntroMuted = (muted: boolean) => write(MUTE_KEY, muted ? "1" : "0");
export const replayIntro = () => window.dispatchEvent(new Event(REPLAY_EVENT));

/**
 * Une scène : ce que dit Nota.
 * Sans `step` : présentation (voile blanc, Nota au centre). Avec `step` (1-5) : elle présente cette étape sur la carte.
 */
export type Scene = { text: string; step?: number };

// Ton : chaleureux et enthousiaste, comme une guide qui fait visiter. Phrases courtes, vouvoiement.
// Après toute modification, régénérer la voix : npm run voix
export const SCENES: Scene[] = [
  { text: "Bonjour et bienvenue ! Moi, c'est Nota, et je suis ravie de vous rencontrer." },
  { text: "Venez, je vous fais visiter le parcours qui va donner vie à votre parfum !" },
  { step: 1, text: "On commence en douceur : racontez-moi votre idée de parfum, et pour qui vous l'imaginez." },
  { step: 2, text: "Ensuite, un peu de pratique : budget, format, délais. Promis, ça reste simple !" },
  { step: 3, text: "Dans les champs de fleurs, mon moment préféré : on choisit ensemble votre famille olfactive." },
  { step: 4, text: "Puis je rassemble toutes vos envies dans un joli brief, prêt pour nos parfumeurs." },
  { step: 5, text: "Et le meilleur pour la fin : vos échantillons, préparés avec soin rien que pour vous. On y va ?" },
];
