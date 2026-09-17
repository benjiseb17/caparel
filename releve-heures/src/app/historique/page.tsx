import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getRelevesByIntervenant,
  getClientsForIntervenant,
} from "@/lib/airtable";
import {
  isDemoMode,
  getDemoReleves,
  getDemoClientsForIntervenant,
} from "@/lib/demo";
import AppHeader from "@/components/AppHeader";
import HistoriqueReleves from "@/components/HistoriqueReleves";

export default async function HistoriquePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [releves, clients] = isDemoMode()
    ? [await getDemoReleves(), getDemoClientsForIntervenant()]
    : await Promise.all([
        getRelevesByIntervenant(session.user.id),
        getClientsForIntervenant(session.user.id),
      ]);

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="historique" />
      <main className="flex-1 px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-xl font-bold text-navy mb-6">
            Historique
          </h1>

          <HistoriqueReleves releves={releves} clients={clients} />
        </div>
      </main>
    </div>
  );
}
