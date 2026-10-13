import Icone from "@/components/charte/Icone";
import type { StatsAdmin } from "@/lib/airtable";
import { formatEuros, formatHeures } from "@/lib/format";

const JOUR_LABEL = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function BlocDirection({
  stats,
  jour,
}: {
  stats: StatsAdmin;
  jour: Date;
}) {
  return (
    <>
      <section className="a-kpis a-kpis--4" aria-label="Activité de Caparel">
        <div className="cp-card a-kpi">
          <div className="a-kpi__head">
            <span className="a-kpi__label">Aujourd&apos;hui</span>
            <span className="cp-chip-icon">
              <Icone nom="calendar" />
            </span>
          </div>
          <p className="a-kpi__value">{stats.interventionsJour.length}</p>
          <p className="a-kpi__meta">Interventions</p>
        </div>

        <div className="cp-card a-kpi">
          <div className="a-kpi__head">
            <span className="a-kpi__label">Cette semaine</span>
            <span className="cp-chip-icon">
              <Icone nom="clock" />
            </span>
          </div>
          <p className="a-kpi__value">{stats.nombreSemaine}</p>
          <p className="a-kpi__meta">
            Interventions · {formatHeures(stats.heuresSemaine)}
          </p>
        </div>

        <div className="cp-card a-kpi">
          <div className="a-kpi__head">
            <span className="a-kpi__label">Chiffre d&apos;affaires</span>
            <span className="cp-chip-icon">
              <Icone nom="euro" />
            </span>
          </div>
          <p className="a-kpi__value a-kpi__value--money">
            {formatEuros(stats.caMois)}
          </p>
          <p className="a-kpi__meta">Sur le mois en cours</p>
        </div>

        <div className="cp-card a-kpi">
          <div className="a-kpi__head">
            <span className="a-kpi__label">Intervenantes</span>
            <span className="cp-chip-icon">
              <Icone nom="user" />
            </span>
          </div>
          <p className="a-kpi__value">{stats.intervenantesActives}</p>
          <p className="a-kpi__meta">Actives</p>
        </div>
      </section>

      <section className="cp-card a-card">
        <div className="cp-card__head">
          <h2 className="cp-title" style={{ textTransform: "capitalize" }}>
            {JOUR_LABEL.format(jour)}
          </h2>
        </div>

        {stats.interventionsJour.length === 0 ? (
          <p className="cp-empty">
            Aucune intervention saisie pour aujourd&apos;hui.
          </p>
        ) : (
          <ul>
            {stats.interventionsJour.map((i) => (
              <li className="a-row" key={i.id}>
                <span className="cp-avatar" aria-hidden="true">
                  {i.intervenante.slice(0, 1).toUpperCase()}
                </span>
                <div className="a-row__body">
                  <p className="a-row__title">{i.intervenante}</p>
                  <p className="a-row__meta">
                    {i.client} · {i.heureArrivee} – {i.heureDepart}
                  </p>
                </div>
                <span className="a-visit__duration">
                  {formatHeures(i.heures)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
