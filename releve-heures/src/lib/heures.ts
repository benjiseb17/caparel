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
