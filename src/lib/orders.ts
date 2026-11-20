"use client";

import { useSyncExternalStore } from "react";
import { Order, PaymentDetails, SampleKit, ShippingAddress } from "@/types/order";

const KEY = "voyage-olfactif:orders";
const listeners = new Set<() => void>();
let memory: string | null = null;
let cachedRaw: string | null = null;
let cachedOrders: Order[] = [];

export const PROMO_CODES: Record<string, number> = {
  GIVAUDAN2026: 0.2, // 20% de remise
  HETIC: 0.25, // 25% de remise
  BIENVENUE: 0.15, // 15% de remise
  VIP: 0.3, // 30% de remise
};

function read(): Order[] {
  try {
    const raw = (typeof window !== "undefined" ? localStorage.getItem(KEY) : null) ?? memory;
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedOrders = raw ? (JSON.parse(raw) as Order[]) : [];
    }
    return cachedOrders;
  } catch {
    return cachedOrders;
  }
}

function write(orders: Order[]) {
  const raw = JSON.stringify(orders);
  memory = raw;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, raw);
    }
  } catch {
    /* fallback memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", cb);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", cb);
    }
  };
}

export function createOrder(payload: {
  projectId: string;
  kit: SampleKit;
  formulas: Order["formulas"];
  selectedFormulaId?: string;
  shipping: ShippingAddress;
  payment: PaymentDetails;
  total: number;
}): Order {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newOrder: Order = {
    id: `GIV-2026-${randomSuffix}`,
    projectId: payload.projectId,
    createdAt: Date.now(),
    kit: payload.kit,
    formulas: payload.formulas,
    selectedFormulaId: payload.selectedFormulaId,
    shipping: payload.shipping,
    payment: payload.payment,
    total: payload.total,
    status: "paid",
    trackingNumber: `FR-COLIS-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
  };

  const existing = read();
  write([newOrder, ...existing]);
  return newOrder;
}

export function getOrderByProjectId(projectId: string): Order | undefined {
  const orders = read();
  return orders.find((o) => o.projectId === projectId);
}

export function useOrders() {
  return useSyncExternalStore(subscribe, read, () => []);
}
