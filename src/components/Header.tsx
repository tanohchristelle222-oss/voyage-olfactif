"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useRef } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocale } from "@/lib/locale";
import { initialsOf, useProfile } from "@/lib/profile";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", en: "Home", icon: "M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10" },
  { href: "/projets", label: "Mes projets", en: "My projects", icon: "M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" },
  { href: "/echantillons", label: "Mes échantillons", en: "My samples", icon: "M9 3h6M10 3v7l-5.5 9A1.4 1.4 0 0 0 5.7 21h12.6a1.4 1.4 0 0 0 1.2-2L14 10V3M8 15h8" },
  { href: "/commandes", label: "Mes commandes", en: "My orders", icon: "m3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v10M7.5 5l9 4" },
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
  const locale = useLocale();
  const profile = useProfile();
  const onProfile = pathname.startsWith("/profil");
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const links = (mobile = false) => NAV_ITEMS.map(item => {
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    return <Link key={item.href} href={item.href} onClick={() => mobileMenu.current?.removeAttribute("open")} aria-current={active ? "page" : undefined} className={active ? "is-active" : ""}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon} /></svg>
      {locale === "en" ? item.en : item.label}{active && !mobile && <ActiveBar />}
    </Link>;
  });

  return (
    <header lang={locale} className="sticky top-0 z-30 border-b border-navy/5 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/" aria-label={locale === "en" ? "Givaudan Horizon home" : "Accueil Givaudan Horizon"} className="shrink-0 leading-none text-[#211820]">
          <span className="block font-display text-[29px] font-semibold tracking-[-1.5px] sm:text-[34px]">givaudan<span className="text-[#bd2680]">·</span></span>
          <span className="mt-2 block whitespace-nowrap text-[8px] font-medium tracking-[0.22em] sm:text-[9px]">GIVAUDAN HORIZON</span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <nav aria-label={locale === "en" ? "Main navigation" : "Navigation principale"} className="tracking-main-nav header-desktop-nav">{links()}</nav>
          <details ref={mobileMenu} className="header-mobile-menu">
            <summary aria-label={locale === "en" ? "Open navigation" : "Ouvrir la navigation"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </summary>
            <nav aria-label={locale === "en" ? "Mobile navigation" : "Navigation mobile"} className="tracking-main-nav header-mobile-links">{links(true)}</nav>
          </details>
          {pathname === "/" && <LanguageSwitcher />}
          <Link
            href="/profil"
            aria-label={locale === "en" ? "Open my profile" : "Ouvrir mon profil"}
            aria-current={onProfile ? "page" : undefined}
            className={`flex items-center gap-2 text-sm transition hover:text-navy ${onProfile ? "text-navy" : "text-navy/70"}`}
          >
            <span
              className={`grid h-9 w-9 place-items-center overflow-hidden rounded-full text-xs font-bold text-navy transition ${
                onProfile ? "bg-[#f6e1ed] ring-2 ring-[#94205f]" : "bg-[#f2f2f2]"
              }`}
            >
              {/^data:image\/(?:png|jpeg|webp);base64,/.test(profile.avatarUrl) ? <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" /> : initialsOf([profile.firstName, profile.lastName].filter(Boolean).join(" "))}
            </span>
            <span className="relative hidden 2xl:inline">
              {locale === "en" ? "Profile" : "Profil"}
              {onProfile && <ActiveBar />}
            </span>
          </Link>
        </div>
      </div>

    </header>
  );
}
