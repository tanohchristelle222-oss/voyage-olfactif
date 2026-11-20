import { Suspense } from "react";
import Header from "@/components/Header";
import Step6SamplesPayment from "@/components/steps/Step6SamplesPayment";

export default function RecapitulatifPage() {
  return (
    <main className="flex flex-1 flex-col bg-cream min-h-screen">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 min-h-[60vh] grid place-items-center">
            <span className="text-sm text-navy/40">Chargement de votre récapitulatif...</span>
          </div>
        }
      >
        <Step6SamplesPayment />
      </Suspense>
    </main>
  );
}
