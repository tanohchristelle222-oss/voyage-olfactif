"use client";

import { useDemoSession } from "@/lib/session";
import LoginScreen from "./LoginScreen";

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const connected = useDemoSession();
  return connected ? children : <LoginScreen />;
}
