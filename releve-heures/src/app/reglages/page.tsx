import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AppHeader from "@/components/AppHeader";
import ReglagesForm from "@/components/ReglagesForm";
import { getIntervenantById } from "@/lib/airtable";
import { isDemoMode, DEMO_INTERVENANT } from "@/lib/demo";
import { initialesDe } from "@/lib/format";

export default async function ReglagesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profil = isDemoMode()
    ? DEMO_INTERVENANT
    : await getIntervenantById(session.user.id);

  const nomComplet = profil?.nomComplet || session.user.nomComplet || "";
  const initiales = initialesDe(nomComplet);

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="reglages" />
      <main className="flex-1 flex flex-col items-center px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-2 sm:pt-8">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-xl font-bold text-navy mb-6">
            Réglages
          </h1>

          {isDemoMode() ? (
            <div className="bg-white rounded-2xl border border-line p-6 text-center">
              <p className="text-sm text-muted">
                La modification des informations personnelles est
                indisponible en mode démo.
              </p>
            </div>
          ) : (
            <ReglagesForm
              emailInitial={profil?.email || ""}
              telephoneInitial={profil?.telephone || ""}
              photoUrlInitiale={profil?.photoUrl || ""}
              initiales={initiales}
              nomComplet={nomComplet}
            />
          )}
        </div>
      </main>
    </div>
  );
}
