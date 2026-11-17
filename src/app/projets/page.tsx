import type { Metadata } from "next";
import Header from "@/components/Header";
import ProjectsPage from "@/components/ProjectsPage";

export const metadata: Metadata = { title: "Mes projets · Le Voyage Olfactif" };

export default function Projets() {
  return (
    <main className="flex flex-1 flex-col bg-cream">
      <Header />
      <ProjectsPage />
    </main>
  );
}
