import Link from "next/link";
import Header from "@/components/charte/Header";
import { NAV_FAMILLE } from "@/lib/navigation";
import Icone from "@/components/charte/Icone";
import SelecteurMois from "@/components/charte/SelecteurMois";
import ListeInterventions from "@/components/charte/ListeInterventions";
import { TELEPHONE_AGENCE, telHref } from "@/lib/agence";
import type { ResumeMoisFamille, Suivi } from "@/lib/airtable";
import { formatDateFr, formatEuros, formatHeures, initialesDe } from "@/lib/format";

const MOIS_SEUL = new Intl.DateTimeFormat("fr-FR", { month: "long" });

const HORODATAGE = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function formatEnvoiLe(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return HORODATAGE.format(d).replace(" ", " à ");
}

export default function AccueilFamille({
  nomClient,
  photoUrl,
  resume,
  derniereRemarque,
  dateParReleve,
  mois,
  libelleMois,
  moisPrecedent,
  moisSuivant,
  estMoisCourant,
}: {
  nomClient: string;
  photoUrl: string;
  resume: ResumeMoisFamille;
  derniereRemarque: Suivi | null;
  dateParReleve: Map<string, string>;
  mois: Date;
  libelleMois: string;
  moisPrecedent: string;
  moisSuivant: string;
  estMoisCourant: boolean;
}) {
  return (
    <div className="cp-root">
      <Header liens={NAV_FAMILLE} actif="/" />

      <main className="cp-container a-main">
        <section className="a-hero">
          <div className="a-hero__who">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="a-hero__photo"
                src={photoUrl}
                alt=""
                aria-hidden="true"
              />
            ) : (
              <span
                className="cp-avatar cp-avatar--lg cp-avatar--teal"
                aria-hidden="true"
              >
                {initialesDe(nomClient)}
              </span>
            )}
            <div>
              <p className="a-hero__hello">Bonjour,</p>
              <h1 className="a-hero__name">{nomClient}</h1>
              <p className="a-hero__intro">
                Voici le relevé des interventions à votre domicile.
              </p>
            </div>
          </div>

          <SelecteurMois
            libelle={libelleMois}
            moisPrecedent={moisPrecedent}
            moisSuivant={moisSuivant}
            estMoisCourant={estMoisCourant}
          />
        </section>

        <section className="a-kpis" aria-label="Synthèse du mois">
          <div className="cp-card a-kpi">
            <div className="a-kpi__head">
              <span className="a-kpi__label">Heures d&apos;intervention</span>
              <span className="cp-chip-icon">
                <Icone nom="clock" />
              </span>
            </div>
            <p className="a-kpi__value">{formatHeures(resume.heures)}</p>
            <p className="a-kpi__meta">
              {resume.interventions.length > 1
                ? `Sur ${resume.interventions.length} interventions`
                : `Sur ${resume.interventions.length} intervention`}
            </p>
          </div>

          <div className="cp-card a-kpi">
            <div className="a-kpi__head">
              <span className="a-kpi__label">Montant du mois</span>
              <span className="cp-chip-icon">
                <Icone nom="euro" />
              </span>
            </div>
            <p className="a-kpi__value a-kpi__value--money">
              {formatEuros(resume.montant)}
            </p>
          </div>

          <div className="cp-card a-kpi a-kpi--compact">
            <div className="a-kpi__head">
              <span className="a-kpi__label">Interventions</span>
              <span className="cp-chip-icon">
                <Icone nom="calendar" />
              </span>
            </div>
            <p className="a-kpi__value">{resume.interventions.length}</p>
            <p className="a-kpi__meta">
              {resume.derniereDate
                ? `Dernière le ${formatDateFr(resume.derniereDate)}`
                : "Aucune ce mois-ci"}
            </p>
          </div>
        </section>

        <div className="a-columns">
          <section className="cp-card a-card">
            <div className="cp-card__head">
              <h2 className="cp-title">Dernières interventions</h2>
              <Link className="cp-link" href="/interventions">
                Tout voir
              </Link>
            </div>

            {resume.interventions.length === 0 ? (
              <p className="cp-empty">Aucune intervention ce mois-ci.</p>
            ) : (
              <>
                <ListeInterventions interventions={resume.interventions} />
                <p className="a-total">
                  <span>Total {MOIS_SEUL.format(mois)}</span>
                  <strong>
                    {formatHeures(resume.heures)} · {formatEuros(resume.montant)}
                  </strong>
                </p>
              </>
            )}
          </section>

          <aside className="a-aside">
            <section className="cp-card a-card">
              <div className="cp-card__head">
                <h2 className="cp-title">Vos remarques</h2>
                <Link className="cp-link" href="/suivi">
                  Tout voir
                </Link>
              </div>

              {derniereRemarque ? (
                <article className="a-remark">
                  <div className="a-remark__head">
                    <span>
                      {derniereRemarque.releveId &&
                      dateParReleve.has(derniereRemarque.releveId)
                        ? `Intervention du ${formatDateFr(
                            dateParReleve.get(derniereRemarque.releveId) || ""
                          )}`
                        : "Remarque générale"}
                    </span>
                    <span className="cp-badge">
                      <Icone nom="check" taille="xs" />
                      {derniereRemarque.traite ? "Pris en compte" : "Transmis"}
                    </span>
                  </div>
                  <p className="a-remark__text">{derniereRemarque.message}</p>
                  <p className="a-remark__meta">
                    Envoyée le {formatEnvoiLe(derniereRemarque.ecritLe)}
                  </p>
                </article>
              ) : (
                <p className="cp-empty">
                  Vous n&apos;avez encore envoyé aucune remarque.
                </p>
              )}

              <Link className="cp-btn cp-btn--primary cp-btn--block" href="/suivi">
                <Icone nom="plus" taille="sm" />
                Ajouter une remarque
              </Link>
            </section>

            {TELEPHONE_AGENCE && (
              <a className="cp-card a-help" href={telHref(TELEPHONE_AGENCE)}>
                <span className="cp-chip-icon cp-chip-icon--round">
                  <Icone nom="phone" />
                </span>
                <span>
                  <span className="a-help__title">Une question ?</span>
                  <span className="a-help__text">
                    Votre agence Caparel : {TELEPHONE_AGENCE}
                  </span>
                </span>
              </a>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
