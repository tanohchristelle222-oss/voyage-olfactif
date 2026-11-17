"use client";

import { useState, useSyncExternalStore } from "react";
import { saveProfile, useProfile } from "@/lib/profile";
import { enterDemo } from "@/lib/session";

const LANGUAGE_KEY = "voyage-olfactif:login-language";
let languageMemory: "fr" | "en" = "fr";
const languageListeners = new Set<() => void>();
function readLanguage(): "fr" | "en" {
  try { return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "fr"; }
  catch { return languageMemory; }
}
function subscribeLanguage(listener: () => void) {
  languageListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { languageListeners.delete(listener); window.removeEventListener("storage", listener); };
}

const copy = {
  fr: {
    title: <>Votre idée.<br />Votre univers.<br />Votre espace.</>,
    subtitle: "Un accompagnement à votre rythme pour vos projets parfumés.",
    welcome: "Bienvenue sur Horizon.",
    intro: "Personnalisez votre profil pour retrouver votre accueil et vos projets dans ce navigateur.",
    email: "Email professionnel fictif", password: "Mot de passe de démonstration",
    hint: "Code fictif fourni. Ne saisissez aucun vrai mot de passe.", customize: "Personnaliser mon profil",
    first: "Prénom", last: "Nom", company: "Entreprise", country: "Pays de votre entreprise",
    submit: "Me connecter", note: "Connexion simulée : utilisez uniquement un profil fictif.",
    alt: "Flacon de parfum entouré de cerises", eyebrow: "GIVAUDAN HORIZON", language: "Langue de la page de connexion",
    register: "Créer un compte", registerTitle: "Créez votre espace.", registerIntro: "Présentez votre entreprise pour commencer votre voyage olfactif.",
    registerSubmit: "Créer mon compte", registerNote: "Inscription simulée : votre profil reste enregistré dans ce navigateur, sans création de compte en ligne.",
    noAccount: "Vous n’avez pas encore de compte ?", hasAccount: "Vous avez déjà un compte ?", signIn: "Me connecter", phone: "Téléphone (facultatif)",
  },
  en: {
    title: <>Your idea.<br />Your world.<br />Your space.</>,
    subtitle: "Support at your own pace for your fragrance projects.",
    welcome: "Welcome to Horizon.",
    intro: "Personalise your profile to find your home page and projects in this browser.",
    email: "Fictional business email", password: "Demo password",
    hint: "Fictional code provided. Do not enter a real password.", customize: "Personalise my profile",
    first: "First name", last: "Last name", company: "Company", country: "Company country",
    submit: "Sign in", note: "Simulated sign-in: use a fictional profile only.",
    alt: "Perfume bottle surrounded by cherries", eyebrow: "GIVAUDAN HORIZON", language: "Sign-in page language",
    register: "Create an account", registerTitle: "Create your space.", registerIntro: "Tell us about your company to begin your fragrance journey.",
    registerSubmit: "Create my account", registerNote: "Simulated registration: your profile is saved in this browser; no online account is created.",
    noAccount: "Don’t have an account yet?", hasAccount: "Already have an account?", signIn: "Sign in", phone: "Phone (optional)",
  },
};

export default function LoginScreen() {
  const profile = useProfile();
  const language = useSyncExternalStore(subscribeLanguage, readLanguage, (): "fr" => "fr");
  const [registering, setRegistering] = useState(false);
  const text = copy[language];

  function chooseLanguage(value: "fr" | "en") {
    languageMemory = value;
    try { localStorage.setItem(LANGUAGE_KEY, value); } catch {}
    languageListeners.forEach(listener => listener());
  }

  const profileFields = <>
    <div className="horizon-login-fields">
      <div><label htmlFor="login-first">{text.first}</label><input id="login-first" name="firstName" maxLength={50} required={registering} pattern={registering ? ".*\\S.*" : undefined} autoComplete="given-name" defaultValue={registering ? "" : profile.firstName || "Léa"} /></div>
      <div><label htmlFor="login-last">{text.last}</label><input id="login-last" name="lastName" maxLength={50} required={registering} pattern={registering ? ".*\\S.*" : undefined} autoComplete="family-name" defaultValue={registering ? "" : profile.lastName || "Martin"} /></div>
    </div>
    <label htmlFor="login-company">{text.company}</label><input id="login-company" name="companyName" maxLength={100} required={registering} pattern={registering ? ".*\\S.*" : undefined} autoComplete="organization" defaultValue={registering ? "" : profile.companyName || "Maison Lune"} />
    <label htmlFor="login-country">{text.country}</label><input id="login-country" name="country" maxLength={70} required={registering} pattern={registering ? ".*\\S.*" : undefined} autoComplete="country-name" defaultValue={registering ? "" : profile.country || "France"} />
    {registering && <><label htmlFor="login-phone">{text.phone}</label><input id="login-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></>}
  </>;

  return (
    <main className="horizon-login" lang={language}>
      <section className="horizon-login-art" aria-labelledby="login-title">
        <div className="horizon-wordmark">givaudan<span>·</span></div>
        <p className="horizon-eyebrow">{text.eyebrow}</p>
        <h1 id="login-title">{text.title}</h1>
        <p className="horizon-login-subtitle">{text.subtitle}</p>
        <div className="horizon-product">
          <img src="/images/auth-perfume-cherries.png" alt={text.alt} width="1280" height="1280" fetchPriority="high" />
        </div>
      </section>
      <section className="horizon-login-content" aria-labelledby="login-welcome">
        <div className="horizon-login-box">
          <div className="horizon-language" role="group" aria-label={text.language}>
            <button type="button" onClick={() => chooseLanguage("fr")} aria-pressed={language === "fr"}>FR</button>
            <button type="button" onClick={() => chooseLanguage("en")} aria-pressed={language === "en"}>EN</button>
          </div>
          <h2 id="login-welcome">{registering ? text.registerTitle : text.welcome}</h2>
          <p>{registering ? text.registerIntro : text.intro}</p>
          <form key={JSON.stringify([registering, profile.updatedAt, profile.email, profile.firstName, profile.lastName, profile.companyName, profile.country])} onSubmit={event => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            saveProfile({
              firstName: String(data.get("firstName")).trim(), lastName: String(data.get("lastName")).trim(),
              companyName: String(data.get("companyName")).trim(), country: String(data.get("country")).trim(),
              email: String(data.get("email")).trim().toLowerCase(),
              ...(registering ? { phone: String(data.get("phone") || "").trim(), avatarUrl: "", role: "", sector: "" } : {}),
            });
            enterDemo();
          }}>
            <label htmlFor="login-email">{text.email}</label>
            <input id="login-email" name="email" type="email" autoComplete="off" required maxLength={150} defaultValue={registering ? "" : profile.email || "lea@maisonlune.example"} placeholder={registering ? "lea@maisonlune.example" : undefined} />
            <label htmlFor="login-password">{text.password}</label>
            <input id="login-password" type="text" value="DEMO-HORIZON" readOnly aria-describedby="login-code-note" />
            <small id="login-code-note">{text.hint}</small>
            {registering ? <fieldset className="horizon-register-fields"><legend className="sr-only">{text.customize}</legend>{profileFields}</fieldset> : <details>
              <summary>{text.customize}</summary>
              {profileFields}
            </details>}
            <button className="horizon-login-submit" type="submit">{registering ? text.registerSubmit : text.submit} <span aria-hidden="true">→</span></button>
          </form>
          <p className="horizon-account-switch">{registering ? text.hasAccount : text.noAccount} <button type="button" onClick={() => setRegistering(!registering)}>{registering ? text.signIn : text.register}</button></p>
          <p className="horizon-login-note">{registering ? text.registerNote : text.note}</p>
        </div>
      </section>
    </main>
  );
}
