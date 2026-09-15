import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ReleveForm from "@/components/ReleveForm";
import AppHeader from "@/components/AppHeader";
import { getClientsForIntervenant, getIntervenantById } from "@/lib/airtable";
import {
  isDemoMode,
  DEMO_INTERVENANT,
  getDemoClientsForIntervenant,
} from "@/lib/demo";

export default async function SaisiePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Le nom vient de la fiche Airtable, pas du jeton de session : celui-ci est
  // figé à la connexion et afficherait un nom périmé après une modification.
  const [profil, clients] = isDemoMode()
    ? [DEMO_INTERVENANT, getDemoClientsForIntervenant()]
    : await Promise.all([
        getIntervenantById(session.user.id),
        getClientsForIntervenant(session.user.id),
      ]);

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="saisie" />
      <main className="flex-1 flex items-start sm:items-center justify-center px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-2 sm:pt-4">
        <ReleveForm
          intervenantNom={profil?.nomComplet || ""}
          clients={clients}
        />
      </main>
    </div>
  );
}
