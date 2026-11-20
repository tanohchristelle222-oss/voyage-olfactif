/**
 * Types du parcours "Le Voyage Olfactif" - Givaudan
 * Architecture d'entreprise : séparation des types de domaine.
 */

export const STEP_LABELS = [
  "Profil & Maison",
  "Votre projet",
  "Votre cible",
  "Famille olfactive",
  "Les contraintes",
  "Échantillons & Paiement",
];

export const TOTAL_STEPS = STEP_LABELS.length;

export type StepAnswer = {
  text: string;
  tags: string[];
  fields?: Record<string, string>;
};

export type Journey = {
  answers: Record<number, StepAnswer>;
  completed: number[];
  orderId?: string;
};

export type Project = {
  id: string;
  createdAt: number;
  journey: Journey;
};

export type Store = {
  activeId: string | null;
  projects: Project[];
};

export type StepDefinition = {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  color: string;
  accent: string;
  landmark: string;
};
