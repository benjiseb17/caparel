import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRelevesByIntervenant } from "@/lib/airtable";
import { isDemoMode, getDemoReleves } from "@/lib/demo";
import AppHeader from "@/components/AppHeader";
import HistoriqueReleves from "@/components/HistoriqueReleves";

export default async function HistoriquePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const releves = isDemoMode()
    ? await getDemoReleves()
    : await getRelevesByIntervenant(session.user.id);

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="historique" />
      <main className="flex-1 px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] flex justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-xl font-bold text-navy mb-2">
            Historique
          </h1>
          <p className="text-sm text-muted mb-6">
            Vos relevés validés. Pour corriger une erreur, contactez Caparel.
          </p>

          <HistoriqueReleves releves={releves} />
        </div>
      </main>
    </div>
  );
}
