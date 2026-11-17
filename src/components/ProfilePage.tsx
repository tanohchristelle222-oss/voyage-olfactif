"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { leaveDemo } from "@/lib/session";
import { SECTORS, useProjects } from "@/lib/journey";
import { initialsOf, saveProfile, useProfile, type Profile } from "@/lib/profile";

const inputClass = "mt-2 w-full rounded-xl border border-navy/15 bg-cream/60 px-4 py-3 text-sm outline-none transition focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/15";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useProfile();
  const { projects } = useProjects();
  const [status, setStatus] = useState("");
  const initial = {
    ...profile,
    companyName: profile.companyName,
    sector: profile.sector,
  };
  // Remonter l’éditeur après chargement du stockage ou sauvegarde, jamais à chaque frappe.
  const editorKey = [profile.updatedAt, profile.firstName, profile.lastName, profile.email, profile.phone, profile.country, profile.role, initial.companyName, initial.sector].join("|");

  function save(values: Profile) {
    const persisted = saveProfile(values);
    setStatus(persisted ? "Modifications enregistrées dans ce navigateur." : "Stockage indisponible : modifications conservées uniquement pour cette session.");
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-gold">Votre espace personnel</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(2.2rem,4vw,3rem)] font-medium">Mon profil</h1>
        <button type="button" onClick={() => { leaveDemo(); router.replace("/"); }} className="inline-flex items-center gap-2 rounded-xl border border-[#e5ccdc] bg-white px-5 py-3 text-sm text-[#8f1c5b] transition hover:bg-[#fbf0f7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#94205f]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 17v3H4V4h6v3M9 12h12m-4-4 4 4-4 4" /></svg>
          Se déconnecter
        </button>
      </div>
      <p className="mt-2 text-sm text-navy/60">Gérez votre identité, vos coordonnées et les informations de votre maison.</p>
      <p role="status" className="mt-3 min-h-5 text-sm text-[#53652f]">{status}</p>
      <ProfileEditor key={editorKey} initial={initial} onSave={save} projects={projects.length} completed={projects.filter((p) => p.journey.completed.includes(5)).length} />
    </div>
  );
}

function ProfileEditor({ initial, onSave, projects, completed }: { initial: Profile; onSave: (profile: Profile) => void; projects: number; completed: number }) {
  const [values, setValues] = useState(initial);
  const [imageError, setImageError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadVersion = useRef(0);
  const patch = (change: Partial<Profile>) => setValues((p) => ({ ...p, ...change }));

  async function selectAvatar(file?: File) {
    if (!file) return;
    const version = ++uploadVersion.current;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 300 * 1024) {
      setImageError("Choisissez une image JPG, PNG ou WebP de 300 Ko maximum.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    try {
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      if (version !== uploadVersion.current) return;
      patch({ avatarUrl });
      setImageError("");
    } catch { setImageError("Cette image n’a pas pu être chargée."); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ ...values, firstName: values.firstName.trim(), lastName: values.lastName.trim(), companyName: values.companyName.trim(), email: values.email.trim(), phone: values.phone.trim() });
  }

  return (
    <form onSubmit={submit} className="mt-4 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="rounded-3xl border border-navy/10 bg-white p-7 text-center shadow-xl shadow-navy/5">
        <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[#ece8e1] font-display text-3xl ring-4 ring-cream">
          {/^data:image\/(?:png|jpeg|webp);base64,/.test(values.avatarUrl) ? <img src={values.avatarUrl} alt="Votre photo de profil" className="h-full w-full object-cover" /> : initialsOf([values.firstName, values.lastName].filter(Boolean).join(" "))}
        </div>
        <p className="mt-5 font-display text-xl">{[values.firstName, values.lastName].filter(Boolean).join(" ") || "Votre profil"}</p>
        <p className="mt-1 text-sm text-navy/60">{values.companyName || "Votre maison"}</p>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Choisir une photo de profil" onChange={(e) => selectAvatar(e.target.files?.[0])} />
        <button type="button" className="mt-5 rounded-full border border-navy/20 px-4 py-2 text-xs" onClick={() => fileRef.current?.click()}>Ajouter une photo</button>
        {values.avatarUrl && <button type="button" className="ml-2 mt-3 text-xs underline" onClick={() => { uploadVersion.current++; patch({ avatarUrl: "" }); }}>Retirer</button>}
        <p className="mt-2 text-[10px] text-navy/50">JPG, PNG ou WebP · 300 Ko maximum</p>
        <p role="alert" className="mt-2 text-xs text-red-700">{imageError}</p>
        <div className="mt-7 grid grid-cols-2 gap-3 border-t border-navy/10 pt-5">
          <div><strong className="font-display text-2xl font-medium">{projects}</strong><p className="text-xs text-navy/60">Projets</p></div>
          <div><strong className="font-display text-2xl font-medium">{completed}</strong><p className="text-xs text-navy/60">Voyages terminés</p></div>
        </div>
      </section>
      <section className="rounded-3xl border border-navy/10 bg-white p-6 shadow-xl shadow-navy/5 sm:p-8">
        <h2 className="font-display text-xl">Vos coordonnées</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" id="p-first"><input id="p-first" autoComplete="given-name" required maxLength={70} value={values.firstName} onChange={(e) => patch({ firstName: e.target.value })} className={inputClass} /></Field>
          <Field label="Nom" id="p-last"><input id="p-last" autoComplete="family-name" maxLength={70} value={values.lastName} onChange={(e) => patch({ lastName: e.target.value })} className={inputClass} /></Field>
          <Field label="E-mail professionnel" id="p-email"><input id="p-email" type="email" autoComplete="email" maxLength={200} value={values.email} onChange={(e) => patch({ email: e.target.value })} className={inputClass} /></Field>
          <Field label="Téléphone" id="p-tel"><input id="p-tel" type="tel" autoComplete="tel" maxLength={40} value={values.phone} onChange={(e) => patch({ phone: e.target.value })} className={inputClass} /></Field>
          <Field label="Fonction" id="p-role"><input id="p-role" autoComplete="organization-title" maxLength={100} value={values.role} onChange={(e) => patch({ role: e.target.value })} className={inputClass} /></Field>
          <Field label="Pays" id="p-pays"><input id="p-pays" autoComplete="country-name" maxLength={80} value={values.country} onChange={(e) => patch({ country: e.target.value })} className={inputClass} /></Field>
        </div>
        <h2 className="mt-8 border-t border-navy/10 pt-7 font-display text-xl">Votre maison</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Nom de l’entreprise ou de la marque" id="p-maison"><input id="p-maison" autoComplete="organization" maxLength={150} value={values.companyName} onChange={(e) => patch({ companyName: e.target.value })} className={inputClass} /></Field>
          <Field label="Secteur" id="p-secteur"><select id="p-secteur" value={values.sector} onChange={(e) => patch({ sector: e.target.value })} className={inputClass}><option value="">Choisir un secteur</option>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></Field>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-navy/55">Les informations sont conservées dans ce navigateur. La sauvegarde du profil ne crée pas de nouveau projet.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">Enregistrer les modifications</button>
          <button type="button" className="rounded-full border border-navy/20 px-5 py-3 text-sm" onClick={() => { uploadVersion.current++; setValues(initial); setImageError(""); }}>Annuler les modifications</button>
        </div>
      </section>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="text-xs font-semibold text-navy/70">{label}</label>{children}</div>;
}
