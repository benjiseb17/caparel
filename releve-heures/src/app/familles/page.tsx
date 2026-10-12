import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AppHeader from "@/components/AppHeader";
import { getCompteById, getFamillesDuReferent } from "@/lib/airtable";
import { isDemoMode, DEMO_INTERVENANT } from "@/lib/demo";
import { formatHeures, formatDateFr } from "@/lib/format";

const MOIS_LABEL = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

const HORODATAGE = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function formatHorodatage(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : HORODATAGE.format(d);
}

export default async function FamillesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Autorisation relue depuis Airtable, comme pour le bloc Direction :
  // retirer le compte de la table Referents coupe l'accès sans attendre une
  // reconnexion.
  const profil = isDemoMode()
    ? DEMO_INTERVENANT
    : await getCompteById(session.user.id);

  if (profil?.role !== "referent") {
    redirect("/");
  }

  const maintenant = new Date();
  const familles = isDemoMode()
    ? []
    : await getFamillesDuReferent(
        session.user.id,
        maintenant,
        profil.accesComplet
      );

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="familles" />
      <main className="flex-1 px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] flex justify-center">
        <div className="w-full max-w-md lg:max-w-3xl">
          <h1 className="font-heading text-xl font-bold text-navy mb-2">
            {profil.accesComplet ? "Toutes les familles" : "Mes familles"}
          </h1>
          <p className="text-sm text-muted mb-6">
            {profil.accesComplet
              ? "L'ensemble des familles suivies par Caparel, et leur activité récente."
              : "Les familles dont vous êtes référent, et leur activité récente."}
          </p>

          {familles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-line p-6 text-center">
              <p className="text-sm text-muted">
                {profil.accesComplet
                  ? "Aucune famille enregistrée pour le moment."
                  : "Aucune famille ne vous est assignée comme référent."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {familles.map((famille) => (
                <section
                  key={famille.id}
                  className="bg-white rounded-2xl border border-line overflow-hidden"
                >
                  <div className="p-5 border-b border-line">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-heading font-bold text-navy truncate">
                          {famille.nom}
                        </h2>
                        {famille.adresse && (
                          <p className="text-xs text-muted mt-0.5 truncate">
                            {famille.adresse}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-heading text-xl font-bold text-teal-dark">
                          {formatHeures(famille.heuresMois)}
                        </p>
                        <p className="text-[11px] text-muted capitalize">
                          {MOIS_LABEL.format(maintenant)}
                        </p>
                      </div>
                    </div>

                    {famille.intervenantes.length > 0 && (
                      <p className="text-xs text-muted mt-3">
                        {famille.intervenantes.length > 1
                          ? "Intervenantes : "
                          : "Intervenante : "}
                        <span className="text-ink">
                          {famille.intervenantes.join(", ")}
                        </span>
                      </p>
                    )}
                  </div>

                  {famille.retours.length > 0 && (
                    <div className="px-5 py-4 bg-soft-2 border-b border-line">
                      <p className="text-xs font-medium text-navy mb-2">
                        Retours de la famille
                      </p>
                      <ul className="space-y-2.5">
                        {famille.retours.map((r) => (
                          <li key={r.id}>
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs text-muted">
                                {formatHorodatage(r.ecritLe)}
                                {r.dateIntervention && (
                                  <>
                                    {" · intervention du "}
                                    {formatDateFr(r.dateIntervention)}
                                  </>
                                )}
                              </p>
                              {!r.traite && (
                                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-navy border border-line">
                                  À traiter
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-ink whitespace-pre-line mt-0.5">
                              {r.message}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {famille.interventions.length === 0 ? (
                    <p className="p-5 text-sm text-muted">
                      Aucune intervention enregistrée pour cette famille.
                    </p>
                  ) : (
                    <ul className="divide-y divide-line">
                      {famille.interventions.map((i) => (
                        <li
                          key={i.id}
                          className="px-5 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-ink truncate">
                              {i.intervenante}
                            </p>
                            <p className="text-xs text-muted">
                              {formatDateFr(i.date)} · {i.heureArrivee} -{" "}
                              {i.heureDepart}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-muted shrink-0">
                            {formatHeures(i.heures)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
