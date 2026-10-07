export function calculerHeures(
  heureArrivee: string,
  heureDepart: string
): number | null {
  const [ha, ma] = heureArrivee.split(":").map(Number);
  const [hd, md] = heureDepart.split(":").map(Number);
  if ([ha, ma, hd, md].some((n) => Number.isNaN(n))) return null;

  const minutesArrivee = ha * 60 + ma;
  let minutesDepart = hd * 60 + md;
  if (minutesDepart < minutesArrivee) minutesDepart += 24 * 60;

  const minutes = minutesDepart - minutesArrivee;
  return Math.round((minutes / 60) * 100) / 100;
}

/**
 * La date du jour en France, au format `AAAA-MM-JJ`.
 *
 * Le serveur tourne en UTC : s'y fier ferait basculer la date une à deux heures
 * trop tôt, et un relevé saisi en soirée pour « aujourd'hui » serait refusé.
 */
export function dateDuJourFr(maintenant = new Date()) {
  // "fr-CA" produit justement AAAA-MM-JJ.
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
  }).format(maintenant);
}

/** Vrai si `date` (AAAA-MM-JJ) est une date valide et pas dans le futur. */
export function dateSaisissable(date: string, maintenant = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  if (Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())) return false;

  // Les deux chaînes sont au même format : la comparaison lexicographique
  // équivaut à une comparaison chronologique.
  return date <= dateDuJourFr(maintenant);
}
