"use client";

import { useSyncExternalStore } from "react";

export type Review = { verdict: string; comment: string; at: number };
export type TrackingItem = {
  id: string; name: string; note: string; image: string; quantity: string;
  phase: number; createdAt: number; updatedAt: number; estimatedAt: number; review?: Review;
};
type Store = { samples: TrackingItem[]; orders: TrackingItem[] };
export type TrackingKind = "samples" | "orders";
const KEY = "voyage-olfactif:suivi";
const EMPTY: Store = { samples: [], orders: [] };
const listeners = new Set<() => void>();
let cached: Store = EMPTY;
let cachedRaw: string | null | undefined;
let memory: string | null = null;
let unavailable = false;
const day = 86400000;

export function seedTracking(now = Date.now()): Store {
  const entry = (id: string, name: string, note: string, image: string, phase: number, days: number, quantity: string): TrackingItem => ({
    id, name, note, image: `/images/tracking/${image}.png`, phase, quantity,
    createdAt: now - (10 - days) * day, updatedAt: now - day, estimatedAt: now + days * day,
  });
  return {
    samples: [
      entry("ECH-DEMO-001", "Vanille velours", "Une vanille douce et crémeuse pour votre crème.", "vanille", 0, 6, "Échantillon · V1"),
      entry("ECH-DEMO-002", "Rose fraîche", "Une direction florale lumineuse pour votre savon.", "rose", 1, 2, "Échantillon · V1"),
      entry("ECH-DEMO-003", "Pistache enveloppante", "Un accord gourmand et délicatement boisé.", "pistache", 2, -3, "Échantillon · V2"),
    ],
    orders: [
      entry("CMD-DEMO-001", "Vanille velours", "Référence VAN-001 · Parfum pour crème", "vanille", 1, 8, "20 kg"),
      entry("CMD-DEMO-002", "Rose fraîche", "Référence ROS-002 · Parfum pour savon", "rose", 2, 3, "50 kg"),
      entry("CMD-DEMO-003", "Pistache enveloppante", "Référence PIS-003 · Parfum pour gel douche", "pistache", 3, -5, "25 kg"),
    ],
  };
}

function persist(store: Store) {
  memory = JSON.stringify(store);
  let saved = true;
  try { localStorage.setItem(KEY, memory); unavailable = false; }
  catch { unavailable = true; saved = false; }
  cachedRaw = memory; cached = store;
  return saved;
}

function snapshot(): Store {
  let raw: string | null;
  try { raw = unavailable ? memory : localStorage.getItem(KEY) ?? memory; }
  catch { raw = memory; }
  if (raw === cachedRaw) return cached;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.samples) && Array.isArray(parsed.orders)) { cached = parsed; cachedRaw = raw; return cached; }
    } catch {}
  }
  const initial = seedTracking();
  persist(initial);
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener); window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}

export const useTracking = () => useSyncExternalStore(subscribe, snapshot, () => EMPTY);
export const isDelivered = (item: TrackingItem, kind: TrackingKind) => item.phase === (kind === "samples" ? 2 : 3);
export const isShipping = (item: TrackingItem, kind: TrackingKind) => item.phase === (kind === "samples" ? 1 : 2);

export function remainingTime(estimatedAt: number, now: number) {
  const seconds = Math.floor(Math.max(0, estimatedAt - now) / 1000);
  if (!seconds) return "Échéance estimée atteinte · statut à confirmer";
  return `${Math.floor(seconds / 86400)} j · ${String(Math.floor(seconds / 3600) % 24).padStart(2, "0")} h · ${String(Math.floor(seconds / 60) % 60).padStart(2, "0")} min · ${String(seconds % 60).padStart(2, "0")} s`;
}

export const VERDICTS = ["Correspond à mon besoin", "À ajuster", "Je dois encore tester"];
export function saveSampleReview(id: string, verdict: string, comment: string) {
  const store = snapshot();
  const item = store.samples.find(sample => sample.id === id);
  if (!item || !isDelivered(item, "samples") || !VERDICTS.includes(verdict)) return { accepted: false, persisted: false };
  const next = { ...store, samples: store.samples.map(sample => sample.id === id ? { ...sample, review: { verdict, comment: comment.trim().slice(0, 1500), at: Date.now() } } : sample) };
  const persisted = persist(next);
  listeners.forEach(listener => listener());
  return { accepted: true, persisted };
}
