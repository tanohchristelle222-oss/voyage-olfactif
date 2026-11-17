import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import StepComingSoon from "@/components/steps/StepComingSoon";
import StepHouse from "@/components/steps/StepHouse";
import StepProject from "@/components/steps/StepProject";

// Les 7 étapes sont connues à l'avance : Next.js peut les préparer d'avance.
export function generateStaticParams() {
  return Array.from({ length: 7 }, (_, i) => ({ n: String(i + 1) }));
}

export default function StepPage({ params }: PageProps<"/etape/[n]">) {
  return (
    <main className="flex flex-1 flex-col bg-cream">
      <Header />
      {/* Le numéro d'étape vient de l'URL : on le lit dans un Suspense (exigé par Next.js 16). */}
      <Suspense fallback={<div className="flex-1" />}>
        <StepContent params={params} />
      </Suspense>
    </main>
  );
}

async function StepContent({ params }: { params: PageProps<"/etape/[n]">["params"] }) {
  const { n } = await params;
  const step = Number(n);
  if (!Number.isInteger(step) || step < 1 || step > 7) notFound();
  if (step === 1) return <StepHouse />;
  if (step === 2) return <StepProject />;
  return <StepComingSoon step={step} />;
}
