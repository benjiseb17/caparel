import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AppHeader from "@/components/AppHeader";
import { getIntervenantById, getStatsAdmin } from "@/lib/airtable";
import { isDemoMode, DEMO_INTERVENANT } from "@/lib/demo";
import { formatHeures } from "@/lib/format";

const JOUR_LABEL = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // L'autorisation est vérifiée contre Airtable, pas contre le jeton de
  // session : retirer la case Admin doit couper l'accès immédiatement, sans
  // attendre que l'intervenante se reconnecte.
  const profil = isDemoMode()
    ? DEMO_INTERVENANT
    : await getIntervenantById(session.user.id);

  if (!profil?.admin) {
    redirect("/");
  }

  const maintenant = new Date();
  const stats = await getStatsAdmin(maintenant);

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="admin" />
      <main className="flex-1 px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] flex justify-center">
        <div className="w-full max-w-md lg:max-w-4xl">
          <h1 className="font-heading text-xl font-bold text-navy mb-6">
            Direction
          </h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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
              <p className="text-xs text-muted mt-0.5">
                Intervenantes actives
              </p>
            </div>
          </div>

          <h2 className="font-heading text-lg font-bold text-navy mb-1">
            Interventions du jour
          </h2>
          <p className="text-sm text-muted mb-4 first-letter:uppercase">
            {JOUR_LABEL.format(maintenant)}
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
      </main>
    </div>
  );
}
