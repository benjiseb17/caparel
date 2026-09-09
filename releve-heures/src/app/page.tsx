import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ReleveForm from "@/components/ReleveForm";
import ClientsAssignes from "@/components/ClientsAssignes";
import AppHeader from "@/components/AppHeader";
import { getClientsForIntervenant } from "@/lib/airtable";
import { isDemoMode, getDemoClientsForIntervenant } from "@/lib/demo";

export default async function Home() {
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
      <main className="flex-1 flex flex-col items-center px-4 pb-12 pt-4 sm:pt-8">
        <ClientsAssignes clients={clients} />
        <ReleveForm
          intervenantNom={session.user.name || session.user.email || ""}
          clients={clients}
        />
      </main>
    </div>
  );
}
