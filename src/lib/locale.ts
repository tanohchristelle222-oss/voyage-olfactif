"use client";

import { useSyncExternalStore } from "react";

export type Locale = "fr" | "en";
const KEY = "voyage-olfactif:login-language";
const listeners = new Set<() => void>();
let memory: Locale = "fr";
let unavailable = false;
function snapshot(): Locale {
  try { return unavailable ? memory : localStorage.getItem(KEY) === "en" ? "en" : "fr"; }
  catch { return memory; }
}
function subscribe(listener: () => void) {
  listeners.add(listener); window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}
export function setLocale(locale: Locale) {
  memory = locale;
  let saved = true;
  try { localStorage.setItem(KEY, locale); unavailable = false; }
  catch { unavailable = true; saved = false; }
  listeners.forEach(listener => listener());
  return saved;
}
export const useLocale = () => useSyncExternalStore(subscribe, snapshot, () => "fr" as Locale);
