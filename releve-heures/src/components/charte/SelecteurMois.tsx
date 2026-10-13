import Link from "next/link";
import Icone from "@/components/charte/Icone";

/**
 * Les flèches de navigation mensuelle du bandeau.
 *
 * La flèche droite devient inerte sur le mois courant : il n'y a rien à
 * consulter dans le futur.
 */
export default function SelecteurMois({
  libelle,
  moisPrecedent,
  moisSuivant,
  estMoisCourant,
}: {
  libelle: string;
  moisPrecedent: string;
  moisSuivant: string;
  estMoisCourant: boolean;
}) {
  return (
    <div className="cp-month">
      <Link
        className="cp-icon-btn"
        href={`/?mois=${moisPrecedent}`}
        aria-label="Mois précédent"
      >
        <Icone nom="chevron-left" />
      </Link>
      <span className="cp-month__label" aria-live="polite">
        {libelle}
      </span>
      {estMoisCourant ? (
        <span className="cp-icon-btn" aria-disabled="true" aria-hidden="true">
          <Icone nom="chevron-right" />
        </span>
      ) : (
        <Link
          className="cp-icon-btn"
          href={`/?mois=${moisSuivant}`}
          aria-label="Mois suivant"
        >
          <Icone nom="chevron-right" />
        </Link>
      )}
    </div>
  );
}
