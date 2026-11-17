import type { Metadata } from "next";
import Header from "@/components/Header";
import OrdersHistory from "@/components/OrdersHistory";

export const metadata: Metadata = { title: "Mes commandes · Le Voyage Olfactif" };
export default function Commandes() {
  return <main className="flex flex-1 flex-col bg-[#fffbfd]"><Header /><OrdersHistory /></main>;
}
