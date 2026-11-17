import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import StepComingSoon from "@/components/steps/StepComingSoon";
import StepProject from "@/components/steps/StepProject";

/** Nombre d'étapes du voyage (voir STEP_LABELS dans lib/journey). */
const TOTAL_STEPS = 5;

// Les étapes sont connues à l'avance : Next.js peut les préparer d'avance.
export function generateStaticParams() {
  return Array.from({ length: TOTAL_STEPS }, (_, i) => ({ n: String(i + 1) }));
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
  if (!Number.isInteger(step) || step < 1 || step > TOTAL_STEPS) notFound();
  if (step === 1) return <StepProject />;
  return <StepComingSoon step={step} />;
}
