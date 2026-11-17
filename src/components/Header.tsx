"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useRef } from "react";
import { initialsOf, useProfile } from "@/lib/profile";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: "M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10" },
  { href: "/projets", label: "Mes projets", icon: "M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" },
  { href: "/echantillons", label: "Mes échantillons", icon: "M9 3h6M10 3v7l-5.5 9A1.4 1.4 0 0 0 5.7 21h12.6a1.4 1.4 0 0 0 1.2-2L14 10V3M8 15h8" },
  { href: "/commandes", label: "Mes commandes", icon: "m3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v10M7.5 5l9 4" },
];

/** Le rose de la connexion accompagne l'onglet actif. */
function ActiveBar() {
  return (
    <motion.span
      layoutId="nav-active"
      className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-[#94205f]"
    />
  );
}

export default function Header() {
  const pathname = usePathname();
  const profile = useProfile();
  const onProfile = pathname.startsWith("/profil");
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const links = (mobile = false) => NAV_ITEMS.map(item => {
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    return <Link key={item.href} href={item.href} onClick={() => mobileMenu.current?.removeAttribute("open")} aria-current={active ? "page" : undefined} className={active ? "is-active" : ""}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon} /></svg>
      {item.label}{active && !mobile && <ActiveBar />}
    </Link>;
  });

  return (
    <header className="sticky top-0 z-30 border-b border-navy/5 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/" className="leading-none">
          <span className="block text-[10px] font-semibold tracking-[0.2em] text-navy/60">GIVAUDAN</span>
          <span className="mt-1 block whitespace-nowrap font-display text-sm font-medium text-navy sm:text-xl">Le Voyage Olfactif</span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <nav aria-label="Navigation principale" className="tracking-main-nav header-desktop-nav">{links()}</nav>
          <details ref={mobileMenu} className="header-mobile-menu">
            <summary aria-label="Ouvrir la navigation">Menu</summary>
            <nav aria-label="Navigation mobile" className="tracking-main-nav header-mobile-links">{links(true)}</nav>
          </details>
          <Link
            href="/profil"
            aria-label="Ouvrir mon profil"
            aria-current={onProfile ? "page" : undefined}
            className={`flex items-center gap-2 text-sm transition hover:text-navy ${onProfile ? "text-navy" : "text-navy/70"}`}
          >
            <span
              className={`grid h-9 w-9 place-items-center overflow-hidden rounded-full text-xs font-bold text-navy transition ${
                onProfile ? "bg-[#ece8e1] ring-2 ring-[#c28921]" : "bg-[#f2f2f2]"
              }`}
            >
              {/^data:image\/(?:png|jpeg|webp);base64,/.test(profile.avatarUrl) ? <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" /> : initialsOf([profile.firstName, profile.lastName].filter(Boolean).join(" "))}
            </span>
            <span className="relative hidden 2xl:inline">
              Profil
              {onProfile && <ActiveBar />}
            </span>
          </Link>
        </div>
      </div>

    </header>
  );
}
