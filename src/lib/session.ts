"use client";

import { useSyncExternalStore } from "react";

// Navigation de démonstration uniquement : aucune authentification serveur.
// La connexion appartient à l’onglet ; elle n’est pas restaurée depuis localStorage.
const KEY = "voyage-olfactif:demo-session";
const listeners = new Set<() => void>();
let memory = false;
let unavailable = false;

function snapshot() {
  try { return unavailable ? memory : sessionStorage.getItem(KEY) === "active"; }
  catch { return memory; }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}

function setSession(active: boolean) {
  memory = active;
  try { sessionStorage.setItem(KEY, active ? "active" : "inactive"); unavailable = false; }
  catch { unavailable = true; }
  listeners.forEach(listener => listener());
}

export const enterDemo = () => setSession(true);
export const leaveDemo = () => setSession(false);
export const useDemoSession = () => useSyncExternalStore(subscribe, snapshot, () => false);
