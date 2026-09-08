import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRelevesByIntervenant } from "@/lib/airtable";
import { isDemoMode, getDemoReleves } from "@/lib/demo";
import { formatHeures, formatDateFr } from "@/lib/format";
import AppHeader from "@/components/AppHeader";

export default async function HistoriquePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const releves = isDemoMode()
    ? getDemoReleves()
    : await getRelevesByIntervenant(session.user.id);

  return (
    <div className="min-h-screen bg-soft flex flex-col">
      <AppHeader active="historique" />
      <main className="flex-1 px-4 pb-12 flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-xl font-bold text-navy mb-6">
            Historique
          </h1>

          {releves.length === 0 ? (
            <div className="bg-white rounded-2xl border border-line p-8 text-center">
              <p className="text-sm text-muted">
                Aucun relevé enregistré pour le moment.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {releves.map((r) => (
                <li
                  key={r.id}
                  className="bg-white rounded-2xl border border-line p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading font-semibold text-ink">
                        {r.clientNom}
                      </p>
                      <p className="text-sm text-muted">
                        {formatDateFr(r.date)} · {r.heureArrivee} - {r.heureDepart}
                      </p>
                    </div>
                    <span className="font-heading text-sm font-bold text-teal-dark shrink-0">
                      {formatHeures(r.heuresRealisees)}
                    </span>
                  </div>
                  {r.commentaire && (
                    <p className="text-sm text-ink mt-2 pt-2 border-t border-line">
                      {r.commentaire}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
