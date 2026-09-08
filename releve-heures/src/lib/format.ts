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
