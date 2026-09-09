export function formatHeures(h: number) {
  const heures = Math.floor(h);
  const minutes = Math.round((h - heures) * 60);
  return `${heures}h${minutes.toString().padStart(2, "0")}`;
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
