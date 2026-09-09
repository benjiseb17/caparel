import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ReleveForm from "@/components/ReleveForm";
import AppHeader from "@/components/AppHeader";
import { getClientsForIntervenant } from "@/lib/airtable";
import { isDemoMode, getDemoClientsForIntervenant } from "@/lib/demo";

export default async function SaisiePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const clients = isDemoMode()
    ? getDemoClientsForIntervenant()
    : await getClientsForIntervenant(session.user.id);

  return (
    <div className="min-h-screen bg-soft flex flex-col">
      <AppHeader active="saisie" />
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 pb-12 pt-2 sm:pt-4">
        <ReleveForm
          intervenantNom={session.user.name || session.user.email || ""}
          clients={clients}
        />
      </main>
    </div>
  );
}
