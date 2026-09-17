import type { StatsAdmin } from "@/lib/airtable";
import { formatHeures } from "@/lib/format";

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
    <section className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-navy">Direction</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-line p-4">
          <p className="font-heading text-2xl font-bold text-navy">
            {stats.interventionsJour.length}
          </p>
          <p className="text-xs text-muted mt-0.5">
            Interventions aujourd&apos;hui
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-line p-4">
          <p className="font-heading text-2xl font-bold text-navy">
            {stats.nombreSemaine}
          </p>
          <p className="text-xs text-muted mt-0.5">
            Cette semaine · {formatHeures(stats.heuresSemaine)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-line p-4">
          <p className="font-heading text-2xl font-bold text-teal-dark">
            {stats.caMois.toLocaleString("fr-FR")} €
          </p>
          <p className="text-xs text-muted mt-0.5">
            Chiffre d&apos;affaires du mois
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-line p-4">
          <p className="font-heading text-2xl font-bold text-navy">
            {stats.intervenantesActives}
          </p>
          <p className="text-xs text-muted mt-0.5">Intervenantes actives</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted mb-2 first-letter:uppercase">
          Interventions du {JOUR_LABEL.format(jour)}
        </p>

        {stats.interventionsJour.length === 0 ? (
          <div className="bg-white rounded-2xl border border-line p-6 text-center">
            <p className="text-sm text-muted">
              Aucune intervention saisie pour aujourd&apos;hui.
            </p>
          </div>
        ) : (
          <ul className="bg-white rounded-2xl border border-line divide-y divide-line overflow-hidden">
            {stats.interventionsJour.map((i) => (
              <li
                key={i.id}
                className="p-4 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {i.intervenante}
                  </p>
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {i.client} · {i.heureArrivee} - {i.heureDepart}
                  </p>
                </div>
                <span className="font-heading text-sm font-bold text-teal-dark shrink-0">
                  {formatHeures(i.heures)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
