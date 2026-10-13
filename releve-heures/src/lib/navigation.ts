import type { LienCharte } from "@/components/charte/Header";

/** Les onglets de l'espace famille. */
export const NAV_FAMILLE: LienCharte[] = [
  { href: "/", label: "Accueil", icone: "home" },
  { href: "/suivi", label: "Suivi", icone: "suivi" },
];

/** Les onglets de l'espace intervenante. */
export const NAV_INTERVENANTE: LienCharte[] = [
  { href: "/", label: "Accueil", icone: "home" },
  { href: "/saisie", label: "Relevé d'heure", icone: "clock" },
  { href: "/historique", label: "Historique", icone: "list" },
  { href: "/fiches-de-paie", label: "Fiches de paie", icone: "file" },
];
