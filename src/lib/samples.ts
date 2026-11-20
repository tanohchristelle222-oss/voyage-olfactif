import { OlfactoryFormula, SampleKit } from "@/types/order";

export const SAMPLE_KITS: SampleKit[] = [
  {
    id: "decouverte",
    title: "Coffret Découverte",
    tagline: "3 déclinaisons sprays de votre création",
    price: 49,
    originalPrice: 65,
    badge: "Idéal pour débuter",
    features: [
      "3 flacons sprays rechargeables de 10 ml",
      "Touches à sentir (mouillettes) professionnelles Givaudan",
      "Livret d'évaluation sensorielle & protocole de test à l'aveugle",
      "Remboursé à 100% sur votre commande de production",
    ],
    includes: [
      "Accord N°1 : L'Épure Signature",
      "Accord N°2 : La Variation Contrastée",
      "Accord N°3 : L'Élixir Intense",
    ],
    popular: true,
  },
  {
    id: "masterclass",
    title: "Coffret Masterclass",
    tagline: "3 sprays + concentrés purs & échange nez",
    price: 99,
    originalPrice: 130,
    badge: "Le plus complet",
    features: [
      "3 flacons sprays de 10 ml + 3 pipettes d'extraits purs concentrés",
      "Séance de débriefing de 30 min en visioconférence avec un parfumeur Givaudan",
      "Rapport d'analyse chromatographique et tenue sur peau",
      "Certificat d'exclusivité olfactive provisoire",
    ],
    includes: [
      "3 flacons sprays 10ml",
      "3 flacons de concentré pur 5ml",
      "Kit complet d'évaluation professionnelle",
    ],
  },
  {
    id: "prestige",
    title: "Coffret Haute Parfumerie",
    tagline: "5 déclinaisons sur-mesure & flaconnage d'art",
    price: 179,
    badge: "Prestige",
    features: [
      "5 formulations exclusives poussées par nos maîtres parfumeurs",
      "Flaconnage prestige en verre lourd gravé au nom de votre maison",
      "2 séances de co-création avec notre direction artistique de Paris",
      "Priorité absolue sur le planning de production pilote",
    ],
    includes: [
      "5 flacons sprays de 15 ml gravés",
      "Coffret gainé artisanalement à Grasse",
      "Accompagnement VIP dédié",
    ],
  },
];

/**
 * Génère 3 formulations olfactives sur-mesure pour le projet selon les réponses.
 */
export function generateFormulas(
  projectName = "Votre parfum",
  houseName = "Maison",
  family = "Boisé",
  notes: string[] = []
): OlfactoryFormula[] {
  const baseFamily = family || "Boisé";
  const defaultNotes = notes.length > 0 ? notes : ["Bergamote", "Rose de Mai", "Bois de Cèdre"];

  return [
    {
      id: "form-1",
      code: "GIV-P1-ALPHA",
      name: `Piste 01 · ${projectName || "Accord"} Signature`,
      character: `Accord ${baseFamily} équilibré, lumineux & fidèle à votre intention initiale`,
      head: [defaultNotes[0] || "Bergamote de Calabre", "Poivre rose", "Zestes de mandarine"],
      heart: [defaultNotes[1] || "Jasmin Sambac", "Géranium d'Égypte", "Thé blanc"],
      base: [defaultNotes[2] || "Bois de Cèdre de l'Atlas", "Muscs blancs soyeux", "Ambre gris"],
      description: `Une interprétation pure et lumineuse pensée pour ${houseName}. L'envolée fraîche laisse place à un cœur texturé et une tenue raffinée toute la journée.`,
    },
    {
      id: "form-2",
      code: "GIV-P2-BETA",
      name: `Piste 02 · ${projectName || "Accord"} Contrasté`,
      character: "Audacieux, texturé avec un sillage plus affirmé",
      head: ["Cardamome noire", defaultNotes[0] || "Pamplemousse argenté", "Gingembre frais"],
      heart: ["Iris pallida", defaultNotes[1] || "Fleur d'oranger absolue", "Encens de Somalie"],
      base: [defaultNotes[2] || "Santal de Nouvelle-Calédonie", "Patchouli d'Indonésie", "Cuir souple"],
      description: `Un sillage plus enveloppant avec des contrastes chauds/froids saisissants, signature des grandes créations contemporaines de Givaudan.`,
    },
    {
      id: "form-3",
      code: "GIV-P3-GAMMA",
      name: `Piste 03 · ${projectName || "Accord"} Élixir & Nuit`,
      character: "Profond, ambré et envoûtant avec une projection noble",
      head: ["Baies de genièvre", "Citron caviar", defaultNotes[0] || "Davana fruitée"],
      heart: ["Rose damascena confite", defaultNotes[1] || "Osmanthe abricotée", "Cannelle de Ceylan"],
      base: ["Vanille Bourbon de Madagascar", defaultNotes[2] || "Vétiver d'Haïti", "Fève tonka torréfiée"],
      description: `Une création nocturne et veloutée offrant une tenue remarquable sur peau et un magnétisme sensoriel inoubliable.`,
    },
  ];
}
