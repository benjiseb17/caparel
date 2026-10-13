export function formatHeures(h: number) {
  const heures = Math.floor(h);
  const minutes = Math.round((h - heures) * 60);
  return `${heures}h${minutes.toString().padStart(2, "0")}`;
}

export function initialesDe(nomComplet: string) {
  return nomComplet
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0])
    .join("")
    .toUpperCase();
}

export function formatDateFr(iso: string) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

const MOIS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function formatMoisFr(iso: string) {
  if (!iso) return "";
  const [year, month] = iso.split("-");
  const index = Number(month) - 1;
  if (!year || Number.isNaN(index) || index < 0 || index > 11) return iso;
  return `${MOIS_FR[index]} ${year}`;
}

/** `165 €`, avec l'espace insécable qu'impose la typographie française. */
export function formatEuros(montant: number) {
  return `${montant.toLocaleString("fr-FR")} €`;
}

const JOUR_COURT = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const MOIS_COURT = new Intl.DateTimeFormat("fr-FR", { month: "short" });

/**
 * Découpe une date ISO en `mer.` / `07` / `oct.`, pour la pastille de date des
 * listes d'interventions.
 */
export function partsDateFr(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { jour: "", quantieme: "", mois: "" };

  return {
    jour: JOUR_COURT.format(d),
    quantieme: String(d.getDate()).padStart(2, "0"),
    mois: MOIS_COURT.format(d),
  };
}
