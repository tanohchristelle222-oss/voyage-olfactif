"use client";

import { setLocale, useLocale } from "@/lib/locale";

export default function LanguageSwitcher() {
  const locale = useLocale();
  return <div className="home-language-switch" role="group" aria-label={locale === "fr" ? "Langue de l’accueil" : "Home page language"}>
    <button type="button" lang="fr" aria-label="Français" aria-pressed={locale === "fr"} onClick={() => setLocale("fr")}>FR</button>
    <button type="button" lang="en" aria-label="English" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
  </div>;
}
