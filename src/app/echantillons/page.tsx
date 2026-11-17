import type { Metadata } from "next";
import Header from "@/components/Header";
import TrackingPage from "@/components/TrackingPage";

export const metadata: Metadata = { title: "Mes échantillons · Le Voyage Olfactif" };
export default function Echantillons() {
  return <main className="flex flex-1 flex-col bg-cream"><Header /><TrackingPage kind="samples" /></main>;
}
