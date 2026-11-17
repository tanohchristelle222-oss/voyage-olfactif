"use client";

import { useSyncExternalStore } from "react";

/* Projets et progression du voyage, sauvegardés automatiquement dans le navigateur (localStorage).
   Chaque projet a son propre voyage ; les pages d'étape travaillent sur le « projet actif ». */

export type StepAnswer = {
  text: string;
  tags: string[];
  /** Champs libres propres à une étape (ex. nom de la maison, secteur). */
  fields?: Record<string, string>;
};
export type Journey = { answers: Record<number, StepAnswer>; completed: number[] };
export type Project = { id: string; createdAt: number; journey: Journey };
type Store = { activeId: string | null; projects: Project[] };

export const STEP_LABELS = [
  "Votre maison",
  "Votre projet",
  "Votre cible",
  "Famille olfactive",
  "Les contraintes",
  "Votre brief",
  "Vos échantillons",
];
export const TOTAL_STEPS = STEP_LABELS.length;

/** Secteurs proposés pour la maison (étape 1 et page profil). */
export const SECTORS = [
  "Parfumerie fine",
  "Cosmétique & soin",
  "Maison & bougies",
  "Hygiène & bien-être",
  "Mode & accessoires",
  "Autre",
];

/** Types de produit proposés à l'étape 2. */
export const PRODUCT_TYPES = ["Eau de parfum", "Eau de toilette", "Brume", "Bougie", "Soin parfumé"];

export const EMPTY_ANSWER: StepAnswer = { text: "", tags: [] };

const KEY = "voyage-olfactif:projets";
// Ancien format (un seul projet) : repris automatiquement comme premier projet.
const LEGACY_KEY = "voyage-olfactif:projet:v2";
const EMPTY: Journey = { answers: {}, completed: [] };
const EMPTY_STORE: Store = { activeId: null, projects: [] };
const listeners = new Set<() => void>();

// Copie en mémoire : la page marche même si le navigateur bloque le stockage.
let memory: string | null = null;
let cachedRaw: string | undefined;
let cached: Store = EMPTY_STORE;

function read(key: string, fallback: string | null = null): string | null {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function getSnapshot(): Store {
  const raw = read(KEY, memory);
  const legacy = raw ? null : read(LEGACY_KEY);
  const signature = raw ?? `legacy:${legacy}`;
  if (signature !== cachedRaw) {
    cachedRaw = signature;
    try {
      if (raw) {
        cached = { ...EMPTY_STORE, ...JSON.parse(raw) };
      } else if (legacy) {
        const journey: Journey = { ...EMPTY, ...JSON.parse(legacy) };
        cached = { activeId: "p-1", projects: [{ id: "p-1", createdAt: 0, journey }] };
      } else {
        cached = EMPTY_STORE;
      }
    } catch {
      cached = EMPTY_STORE;
    }
  }
  return cached;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function writeStore(store: Store) {
  const raw = JSON.stringify(store);
  memory = raw;
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    /* stockage indisponible : on garde la copie en mémoire */
  }
  listeners.forEach((l) => l());
}

function newProject(journey: Journey = EMPTY): Project {
  return { id: `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now(), journey };
}

/** Crée un projet, le rend actif et renvoie son id. Les infos de la maison sont reprises du projet actif. */
export function createProject(): string {
  const store = getSnapshot();
  const house = store.projects.find((p) => p.id === store.activeId)?.journey.answers[1];
  const project = newProject(house ? { answers: { 1: house }, completed: [] } : EMPTY);
  writeStore({ activeId: project.id, projects: [...store.projects, project] });
  return project.id;
}

export function setActiveProject(id: string) {
  writeStore({ ...getSnapshot(), activeId: id });
}

/** Modifie le voyage du projet actif (le crée s'il n'y en a pas encore). */
export function saveJourney(update: (j: Journey) => Journey) {
  const store = getSnapshot();
  let projects = store.projects;
  let activeId = store.activeId;
  if (!projects.some((p) => p.id === activeId)) {
    const project = newProject();
    projects = [...projects, project];
    activeId = project.id;
  }
  writeStore({
    activeId,
    projects: projects.map((p) => (p.id === activeId ? { ...p, journey: update(p.journey) } : p)),
  });
}

export function saveAnswer(step: number, patch: Partial<StepAnswer>) {
  saveJourney((j) => ({
    ...j,
    answers: { ...j.answers, [step]: { ...(j.answers[step] ?? EMPTY_ANSWER), ...patch } },
  }));
}

export function saveField(step: number, name: string, value: string) {
  saveJourney((j) => {
    const prev = j.answers[step] ?? EMPTY_ANSWER;
    return {
      ...j,
      answers: { ...j.answers, [step]: { ...prev, fields: { ...prev.fields, [name]: value } } },
    };
  });
}

export function completeStep(step: number) {
  saveJourney((j) => ({ ...j, completed: [...new Set([...j.completed, step])].sort() }));
}

/** Première étape non terminée d'un voyage. */
export function currentStepOf(journey: Journey) {
  let current = 1;
  while (current <= TOTAL_STEPS && journey.completed.includes(current)) current++;
  return Math.min(current, TOTAL_STEPS);
}

/** Tous les projets + l'id du projet actif. */
export function useProjects() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_STORE);
}

/** Voyage du projet actif. */
export function useJourney() {
  const store = useProjects();
  const journey = store.projects.find((p) => p.id === store.activeId)?.journey ?? EMPTY;
  return { journey, current: currentStepOf(journey) };
}
