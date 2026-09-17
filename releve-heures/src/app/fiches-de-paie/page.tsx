import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getFichesDePaieByIntervenant } from "@/lib/airtable";
import { isDemoMode, getDemoFichesDePaie } from "@/lib/demo";
import { formatMoisFr } from "@/lib/format";
import AppHeader from "@/components/AppHeader";

export default async function FichesDePaiePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const fiches = isDemoMode()
    ? getDemoFichesDePaie()
    : await getFichesDePaieByIntervenant(session.user.id);

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="fiches" />
      <main className="flex-1 px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-xl font-bold text-navy mb-6">
            Mes fiches de paie
          </h1>

          {fiches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-line p-6 text-center">
              <p className="text-sm text-muted">
                Aucune fiche de paie disponible pour le moment.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {fiches.map((f) => (
                <li
                  key={f.id}
                  className="bg-white rounded-2xl border border-line p-4 flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-ink">
                    {formatMoisFr(f.mois)}
                  </span>
                  {f.fichierUrl ? (
                    <a
                      href={f.fichierUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-teal-dark hover:text-teal underline underline-offset-2"
                    >
                      Télécharger
                    </a>
                  ) : (
                    <span className="text-sm text-muted">
                      Indisponible (démo)
                    </span>
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
