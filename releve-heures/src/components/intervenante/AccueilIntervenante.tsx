import Link from "next/link";
import Header from "@/components/charte/Header";
import Icone from "@/components/charte/Icone";
import SelecteurMois from "@/components/charte/SelecteurMois";
import { NAV_INTERVENANTE } from "@/lib/navigation";
import type { Client } from "@/lib/airtable";
import { formatEuros, formatHeures, initialesDe } from "@/lib/format";

export default function AccueilIntervenante({
  nomComplet,
  photoUrl,
  clients,
  totalHeures,
  totalCA,
  libelleMois,
  moisPrecedent,
  moisSuivant,
  estMoisCourant,
}: {
  nomComplet: string;
  photoUrl: string;
  clients: Client[];
  totalHeures: number;
  totalCA: number;
  libelleMois: string;
  moisPrecedent: string;
  moisSuivant: string;
  estMoisCourant: boolean;
}) {
  return (
    <div className="cp-root">
      <Header liens={NAV_INTERVENANTE} actif="/" />

      <main className="cp-container a-main">
        <section className="a-hero">
          <div className="a-hero__who">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="a-hero__photo" src={photoUrl} alt="" aria-hidden="true" />
            ) : (
              <span
                className="cp-avatar cp-avatar--lg cp-avatar--teal"
                aria-hidden="true"
              >
                {initialesDe(nomComplet)}
              </span>
            )}
            <div>
              <p className="a-hero__hello">Bonjour,</p>
              <h1 className="a-hero__name">{nomComplet}</h1>
              <p className="a-hero__intro">
                Voici le récapitulatif de vos interventions.
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
              <span className="a-kpi__label">Heures réalisées</span>
              <span className="cp-chip-icon">
                <Icone nom="clock" />
              </span>
            </div>
            <p className="a-kpi__value">{formatHeures(totalHeures)}</p>
            <p className="a-kpi__meta">Sur le mois affiché</p>
          </div>

          <div className="cp-card a-kpi">
            <div className="a-kpi__head">
              <span className="a-kpi__label">Chiffre d&apos;affaires</span>
              <span className="cp-chip-icon">
                <Icone nom="euro" />
              </span>
            </div>
            <p className="a-kpi__value a-kpi__value--money">
              {formatEuros(totalCA)}
            </p>
            <p className="a-kpi__meta">Heures réalisées × votre taux horaire</p>
          </div>

          <div className="cp-card a-kpi a-kpi--compact">
            <div className="a-kpi__head">
              <span className="a-kpi__label">
                {clients.length > 1 ? "Clients" : "Client"}
              </span>
              <span className="cp-chip-icon">
                <Icone nom="user" />
              </span>
            </div>
            <p className="a-kpi__value">{clients.length}</p>
            <p className="a-kpi__meta">Qui vous sont assignés</p>
          </div>
        </section>

        <div className="a-columns">
          <section className="cp-card a-card">
            <div className="cp-card__head">
              <h2 className="cp-title">
                {clients.length > 1 ? "Vos clients" : "Votre client"}
              </h2>
            </div>

            {clients.length === 0 ? (
              <p className="cp-empty">
                Aucun client ne vous est assigné pour le moment.
              </p>
            ) : (
              <ul>
                {clients.map((c) => (
                  <li className="a-row" key={c.id}>
                    <span className="cp-chip-icon cp-chip-icon--round">
                      <Icone nom="home" />
                    </span>
                    <div className="a-row__body">
                      <p className="a-row__title">{c.nom}</p>
                      {c.adresse && <p className="a-row__meta">{c.adresse}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="a-aside">
            <section className="cp-card a-card">
              <div className="cp-card__head">
                <h2 className="cp-title">Votre journée</h2>
              </div>
              <p className="a-kpi__meta" style={{ marginBottom: "var(--cp-s-4)" }}>
                Saisissez vos heures une fois l&apos;intervention terminée.
              </p>
              <Link className="cp-btn cp-btn--primary cp-btn--block" href="/saisie">
                <Icone nom="plus" taille="sm" />
                Saisir un relevé
              </Link>
            </section>

            <Link className="cp-card a-help" href="/fiches-de-paie">
              <span className="cp-chip-icon cp-chip-icon--round">
                <Icone nom="file" />
              </span>
              <span>
                <span className="a-help__title">Vos fiches de paie</span>
                <span className="a-help__text">
                  Télécharger vos bulletins publiés
                </span>
              </span>
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
