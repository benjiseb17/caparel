import Icone from "@/components/charte/Icone";
import type { InterventionVueFamille } from "@/lib/airtable";
import { formatEuros, formatHeures, partsDateFr } from "@/lib/format";

/** La liste d'interventions, partagée par l'accueil et l'historique. */
export default function ListeInterventions({
  interventions,
}: {
  interventions: InterventionVueFamille[];
}) {
  return (
    <ol className="a-visits">
      {interventions.map((i) => {
        const d = partsDateFr(i.date);
        return (
          <li className="a-visit" key={i.id}>
            <time className="a-date" dateTime={i.date}>
              <span className="a-date__weekday">{d.jour}</span>
              <span className="a-date__day">{d.quantieme}</span>
              <span className="a-date__month">{d.mois}</span>
            </time>

            <div className="a-visit__body">
              <p className="a-visit__who">
                <span className="cp-avatar" aria-hidden="true">
                  {i.intervenante.slice(0, 1).toUpperCase()}
                </span>
                {i.intervenante}
              </p>
              <p className="a-visit__time">
                <Icone nom="clock" taille="sm" />
                {i.heureArrivee} – {i.heureDepart}
              </p>
            </div>

            <div className="a-visit__figures">
              <p className="a-visit__duration">{formatHeures(i.heures)}</p>
              <p className="a-visit__amount">{formatEuros(i.montant)}</p>
            </div>

            {/* Hors de la ligne : pleine largeur, pour que le mot n'étire pas
                la pastille de date ni les chiffres. */}
            {i.motPourLaFamille && (
              <p className="a-visit__word">{i.motPourLaFamille}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
