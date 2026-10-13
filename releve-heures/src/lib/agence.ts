/**
 * Coordonnées de l'agence affichées aux familles.
 *
 * Vider `TELEPHONE_AGENCE` masque l'encart « Une question ? » : la page ne
 * laisse jamais apparaître un numéro vide ou un lien mort.
 */
export const TELEPHONE_AGENCE = "06 64 26 93 03";

/** `tel:` au format international, pour que le lien fonctionne depuis l'étranger. */
export function telHref(numero: string) {
  const chiffres = numero.replace(/\s|\./g, "");
  return `tel:${chiffres.startsWith("0") ? `+33${chiffres.slice(1)}` : chiffres}`;
}
