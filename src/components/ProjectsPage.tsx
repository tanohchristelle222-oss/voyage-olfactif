"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  createProject,
  currentStepOf,
  PRODUCT_TYPES,
  setActiveProject,
  TOTAL_STEPS,
  useProjects,
  type Project,
} from "@/lib/journey";
import { useProfile } from "@/lib/profile";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

type Status = { label: string; color: string; bg: string; tint: string };

function statusOf(project: Project): Status {
  const { completed } = project.journey;
  if (completed.includes(7)) return { label: "Échantillons envoyés", color: "#a4b26a", bg: "#eef1e2", tint: "#e9ecd6" };
  if (completed.includes(6)) return { label: "Brief validé", color: "#c28921", bg: "#f6eedc", tint: "#efe6d2" };
  if (completed.length === 0) return { label: "À démarrer", color: "#9a9a9a", bg: "#f2f2f2", tint: "#f2f2f2" };
  return {
    label: `En cours · Étape ${currentStepOf(project.journey)}`,
    color: "#9678b0",
    bg: "#efeaf4",
    tint: "#ebe6ef",
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, activeId } = useProjects();
  const profile = useProfile();

  function startNew() {
    createProject();
    router.push("/voyage");
  }

  function open(id: string) {
    setActiveProject(id);
    router.push("/voyage");
  }

  // Le plus récent en premier.
  const sorted = [...projects].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.h1 {...fadeUp(0)} className="font-display text-[clamp(2.2rem,4vw,3rem)] font-medium leading-tight">
            Mes projets
          </motion.h1>
          <motion.p {...fadeUp(0.08)} className="mt-1 text-navy/60">
            Retrouvez vos briefs et suivez vos échantillons.
          </motion.p>
        </div>
        <motion.button
          {...fadeUp(0.12)}
          onClick={startNew}
          className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          + Nouveau projet
        </motion.button>
      </div>

      {sorted.length === 0 ? (
        <motion.div
          {...fadeUp(0.2)}
          className="mt-10 flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-xl shadow-navy/5 ring-1 ring-navy/5"
        >
          <ProjectVisual type="" />
          <p className="mt-6 font-display text-xl font-medium">Aucun projet pour l&apos;instant</p>
          <p className="mt-1 max-w-sm text-sm text-navy/60">
            Lancez votre premier voyage olfactif : Nota vous guidera jusqu&apos;à vos échantillons.
          </p>
          <button
            onClick={startNew}
            className="mt-6 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition hover:-translate-y-0.5"
          >
            Commencer un projet
          </button>
        </motion.div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((project, i) => {
            const { answers, completed } = project.journey;
            const house = answers[1]?.fields;
            const type = answers[2]?.tags.find((t) => PRODUCT_TYPES.includes(t)) ?? "";
            const name = answers[2]?.fields?.name?.trim() || house?.name?.trim() || "";
            const title = name ? `${type || "Projet"} « ${name} »` : type || "Nouveau projet";
            const status = statusOf(project);
            const progress = completed.length / TOTAL_STEPS;
            const active = project.id === activeId;

            return (
              <motion.button
                key={project.id}
                {...fadeUp(0.18 + i * 0.08)}
                whileHover={{ y: -6 }}
                onClick={() => open(project.id)}
                className="group rounded-3xl bg-white p-3 text-left shadow-xl shadow-navy/5 ring-1 ring-navy/5 transition-shadow hover:shadow-2xl hover:shadow-navy/10"
              >
                <div
                  className="relative grid h-36 place-items-center overflow-hidden rounded-2xl"
                  style={{ background: status.tint }}
                >
                  <motion.div className="transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <ProjectVisual type={type} />
                  </motion.div>
                  {active && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-navy shadow-sm">
                      Projet actif
                    </span>
                  )}
                </div>

                <div className="px-3 pb-3 pt-4">
                  <p className="font-display text-lg font-medium leading-snug">{title}</p>
                  <p className="mt-0.5 text-sm text-navy/55">
                    {house?.sector || "Secteur à définir"} · {profile.country || "Pays à définir"}
                  </p>

                  <span
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-navy"
                    style={{ background: status.bg }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
                    {status.label}
                  </span>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f2f2f2]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: status.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(progress, 0.02) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Petit visuel selon le type de produit : bougie, pot de soin ou flacon. */
function ProjectVisual({ type }: { type: string }) {
  if (type === "Bougie") {
    return (
      <svg width="90" height="96" viewBox="0 0 90 96" aria-hidden>
        <ellipse cx="45" cy="90" rx="34" ry="5" fill="#000" opacity="0.07" />
        <rect x="18" y="38" width="54" height="52" rx="8" fill="#fbfaf7" stroke="#e5d8c6" strokeWidth="2" />
        <ellipse cx="45" cy="42" rx="22" ry="5" fill="#efe6d4" />
        <line x1="45" y1="40" x2="45" y2="30" stroke="#5a463a" strokeWidth="2" />
        <path d="M45 10 C 45 10, 53 21, 53 26 A 8 8 0 0 1 37 26 C 37 21, 45 10, 45 10 Z" fill="#e9a640" />
        <rect x="28" y="56" width="34" height="16" rx="3" fill="#0b1215" />
      </svg>
    );
  }
  if (type === "Soin parfumé") {
    return (
      <svg width="96" height="80" viewBox="0 0 96 80" aria-hidden>
        <ellipse cx="48" cy="74" rx="38" ry="5" fill="#000" opacity="0.07" />
        <rect x="14" y="18" width="68" height="16" rx="4" fill="#c28921" />
        <rect x="18" y="34" width="60" height="38" rx="6" fill="#fff" stroke="#e5d8c6" strokeWidth="2" />
        <rect x="30" y="44" width="36" height="14" rx="3" fill="#f2f2f2" />
      </svg>
    );
  }
  return (
    <svg width="72" height="104" viewBox="0 0 72 104" aria-hidden>
      <ellipse cx="36" cy="98" rx="30" ry="5" fill="#000" opacity="0.07" />
      <rect x="25" y="2" width="22" height="12" rx="2" fill="#c28921" />
      <rect x="29" y="14" width="14" height="10" fill="#d9b763" />
      <rect x="8" y="24" width="56" height="72" rx="8" fill="#fbfaf7" stroke="#e5d8c6" strokeWidth="2" />
      <rect x="20" y="42" width="32" height="34" rx="3" fill="#0b1215" />
      <rect x="25" y="47" width="22" height="24" fill="none" stroke="#c28921" strokeWidth="1.5" />
      <rect x="13" y="30" width="5" height="60" rx="2.5" fill="#fff" />
    </svg>
  );
}
