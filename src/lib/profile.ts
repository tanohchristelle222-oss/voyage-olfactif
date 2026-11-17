"use client";

import { useSyncExternalStore } from "react";

/* Profil de l'utilisateur, sauvegardé dans le navigateur (localStorage).
   Le nom et le secteur de la maison, eux, viennent de l'étape 1 du voyage (lib/journey). */

export type Profile = {
  firstName: string;
  role: string;
  country: string;
  email: string;
  phone: string;
};

const KEY = "voyage-olfactif:profil";
const DEFAULT: Profile = { firstName: "", role: "", country: "", email: "", phone: "" };
const listeners = new Set<() => void>();

let memory: string | null = null;
let cachedRaw: string | null | undefined;
let cached: Profile = DEFAULT;

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function getSnapshot(): Profile {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cached = raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
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
  const raw = JSON.stringify({ ...getSnapshot(), ...patch });
  memory = raw;
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    /* stockage indisponible : copie en mémoire */
  }
  listeners.forEach((l) => l());
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
