"use client";

import { useSyncExternalStore } from "react";

/* Profil et maison sauvegardés dans le navigateur, indépendamment des projets. */

export type Profile = {
  firstName: string;
  lastName: string;
  companyName: string;
  houseName: string;
  sector: string;
  avatarUrl: string;
  updatedAt: number;
  role: string;
  country: string;
  email: string;
  phone: string;
};

const KEY = "voyage-olfactif:profil";
const DEFAULT: Profile = { firstName: "", lastName: "", companyName: "", houseName: "", sector: "", avatarUrl: "", updatedAt: 0, role: "", country: "", email: "", phone: "" };
const listeners = new Set<() => void>();

let memory: string | null = null;
let storageUnavailable = false;
let cachedRaw: string | null | undefined;
let cached: Profile = DEFAULT;

function readRaw(): string | null {
  try {
    return storageUnavailable ? memory : localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function getSnapshot(): Profile {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const values = raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
      // Compatibilité entre l’inscription locale (companyName) et le push (houseName).
      let companyName = values.companyName || values.houseName;
      let sector = values.sector;
      if (!companyName) {
        try {
          const store = JSON.parse(localStorage.getItem("voyage-olfactif:projets") ?? "null");
          const project = store?.projects?.find((p: { id: string }) => p.id === store.activeId);
          const oldHouse = store?.v === 2 ? project?.journey?.legacyAnswers?.[1] : project?.journey?.answers?.[1];
          const legacy = !store ? JSON.parse(localStorage.getItem("voyage-olfactif:projet:v2") ?? "null") : null;
          const house = oldHouse ?? legacy?.answers?.[1];
          companyName = house?.fields?.name || "";
          sector = sector || house?.fields?.sector || "";
        } catch { /* Les anciennes coordonnées restent facultatives. */ }
      }
      cached = { ...values, companyName, houseName: companyName, sector };
    } catch {
      cached = DEFAULT;
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

export function saveProfile(patch: Partial<Profile>) {
  const companyName = patch.companyName ?? patch.houseName ?? getSnapshot().companyName;
  const raw = JSON.stringify({ ...getSnapshot(), ...patch, companyName, houseName: companyName, updatedAt: Date.now() });
  let persisted = true;
  memory = raw;
  try {
    localStorage.setItem(KEY, raw);
    storageUnavailable = false;
  } catch {
    persisted = false;
    storageUnavailable = true;
    /* stockage indisponible : copie en mémoire */
  }
  listeners.forEach((l) => l());
  return persisted;
}

export function useProfile() {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT);
}

/** Initiales affichées dans l'avatar (« MI » par défaut). */
export function initialsOf(firstName: string) {
  const parts = firstName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MI";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
