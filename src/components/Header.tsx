"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createProject } from "@/lib/journey";
import { initialsOf, useProfile } from "@/lib/profile";

/** Soulignement doré de l'onglet actif (glisse d'un onglet à l'autre). */
function ActiveBar() {
  return (
    <motion.span
      layoutId="nav-active"
      className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-[#c28921]"
    />
  );
}

export default function Header() {
  const pathname = usePathname();
  const profile = useProfile();
  const onHome = pathname === "/";
  const onProfile = pathname.startsWith("/profil");
  const onProjects = pathname.startsWith("/projets");
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-navy/5 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="leading-none">
          <span className="block text-[10px] font-semibold tracking-[0.2em] text-navy/60">GIVAUDAN</span>
          <span className="mt-1 block font-display text-xl font-medium text-navy">Le Voyage Olfactif</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          <Link
            href="/"
            className={`relative hidden text-sm transition hover:text-navy md:block ${onHome ? "text-navy" : "text-navy/70"}`}
          >
            Accueil
            {onHome && <ActiveBar />}
          </Link>
          <Link
            href="/projets"
            className={`relative hidden text-sm transition hover:text-navy md:block ${onProjects ? "text-navy" : "text-navy/70"}`}
          >
            Mes projets
            {onProjects && <ActiveBar />}
          </Link>
          <button
            onClick={() => {
              createProject();
              router.push("/voyage");
            }}
            className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-md shadow-navy/20 transition hover:-translate-y-0.5 hover:shadow-lg sm:px-5">
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Nouveau projet</span>
          </button>
          <Link
            href="/profil"
            aria-current={onProfile ? "page" : undefined}
            className={`flex items-center gap-2 text-sm transition hover:text-navy ${onProfile ? "text-navy" : "text-navy/70"}`}
          >
            <span
              className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-navy transition ${
                onProfile ? "bg-[#ece8e1] ring-2 ring-[#c28921]" : "bg-[#f2f2f2]"
              }`}
            >
              {initialsOf(profile.firstName)}
            </span>
            <span className="relative hidden sm:inline">
              Profil
              {onProfile && <ActiveBar />}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
