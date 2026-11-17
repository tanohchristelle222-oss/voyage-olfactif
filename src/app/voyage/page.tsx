import Header from "@/components/Header";
import Hero from "@/components/Hero";
import JourneyMap from "@/components/JourneyMap";
import NotaGreeting from "@/components/Nota";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Votre voyage · Le Voyage Olfactif" };

/** La roadmap du projet actif (ouverte par « Nouveau projet » ou depuis « Mes projets »). */
export default function Voyage() {
  return (
    // Grand écran : la page fait exactement la hauteur de la fenêtre, sans scroll.
    <main className="flex flex-1 flex-col bg-cream lg:h-svh lg:flex-none lg:overflow-hidden">
      <Header />
      <section className="relative lg:min-h-0 lg:flex-1">
        {/* Mobile / tablette : texte et Nota empilés au-dessus de la carte. */}
        <div className="px-4 pt-8 pb-6 sm:px-8 lg:hidden">
          <Hero />
          <NotaGreeting className="mt-8" />
        </div>

        {/* Grand écran : calés sur le bord gauche de l'écran, à l'échelle de la carte. */}
        <JourneyMap
          edgeOverlay={
            <>
              <Hero className="pointer-events-auto absolute left-[56px] top-[36px] w-[580px]" />
              <NotaGreeting className="pointer-events-auto absolute left-[52px] top-[330px]" />
            </>
          }
        />
      </section>
    </main>
  );
}
