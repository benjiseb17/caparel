import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AppHeader from "@/components/AppHeader";
import SuiviForm from "@/components/SuiviForm";
import {
  getCompteById,
  getEspaceFamille,
  getSuivisDuClient,
} from "@/lib/airtable";
import { isDemoMode } from "@/lib/demo";
import { formatDateFr } from "@/lib/format";

const HORODATAGE = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function formatHorodatage(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : HORODATAGE.format(d);
}

export default async function SuiviPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Réservé aux familles, et l'autorisation est relue depuis Airtable à chaque
  // affichage plutôt que prise dans le jeton de session.
  const profil = isDemoMode() ? null : await getCompteById(session.user.id);

  if (profil?.role !== "famille") {
    redirect("/");
  }

  const [espace, suivis] = await Promise.all([
    getEspaceFamille(profil.id),
    getSuivisDuClient(profil.id),
  ]);

  const dateParReleve = new Map(
    espace.interventions.map((i) => [i.id, i.date])
  );

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="suivi" />
      <main className="flex-1 px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] flex justify-center">
        <div className="w-full max-w-md lg:max-w-2xl">
          <h1 className="font-heading text-xl font-bold text-navy mb-2">
            Suivi
          </h1>
          <p className="text-sm text-muted mb-6">
            Écrivez ici ce que vous souhaitez signaler à Caparel : un besoin, une
            remarque sur une intervention, un changement d&apos;habitude. Vos
            messages ne sont lus que par l&apos;équipe Caparel.
          </p>

          <SuiviForm interventions={espace.interventions} />

          <h2 className="font-heading text-base font-bold text-navy mt-8 mb-3">
            Vos messages
          </h2>

          {suivis.length === 0 ? (
            <div className="bg-white rounded-2xl border border-line p-6 text-center">
              <p className="text-sm text-muted">
                Vous n&apos;avez encore envoyé aucun message.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {suivis.map((s) => (
                <li
                  key={s.id}
                  className="bg-white rounded-2xl border border-line p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-xs text-muted">
                      {formatHorodatage(s.ecritLe)}
                      {s.releveId && dateParReleve.has(s.releveId) && (
                        <>
                          {" · intervention du "}
                          {formatDateFr(dateParReleve.get(s.releveId) || "")}
                        </>
                      )}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        s.traite
                          ? "bg-soft-2 text-teal-dark"
                          : "bg-soft text-muted"
                      }`}
                    >
                      {s.traite ? "Pris en compte" : "Transmis"}
                    </span>
                  </div>
                  <p className="text-sm text-ink whitespace-pre-line">
                    {s.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
