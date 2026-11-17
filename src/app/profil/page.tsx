import type { Metadata } from "next";
import Header from "@/components/Header";
import ProfilePage from "@/components/ProfilePage";

export const metadata: Metadata = { title: "Mon profil · Le Voyage Olfactif" };

export default function Profil() {
  return (
    <main className="flex flex-1 flex-col bg-cream">
      <Header />
      <ProfilePage />
    </main>
  );
}
