import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/charte/Header";
import ReleveForm from "@/components/intervenante/ReleveForm";
import { NAV_INTERVENANTE } from "@/lib/navigation";
import { getClientsForIntervenant, getCompteById } from "@/lib/airtable";
import { isDemoMode, getDemoClientsForIntervenant } from "@/lib/demo";

export default async function SaisiePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profil, clients] = isDemoMode()
    ? [null, getDemoClientsForIntervenant()]
    : await Promise.all([
        getCompteById(session.user.id),
        getClientsForIntervenant(session.user.id),
      ]);

  // Seule une intervenante saisit des relevés : la fiche d'un référent ou d'une
  // famille ne vit pas dans la table Intervenants, et un relevé à son nom serait
  // refusé par Airtable.
  if (!isDemoMode() && profil?.role !== "intervenante") {
    redirect("/");
  }

  return (
    <div className="cp-root">
      <Header liens={NAV_INTERVENANTE} actif="/saisie" />

      <main className="cp-container a-main">
        <div className="a-narrow">
          <section className="cp-card a-card">
            <h1 className="cp-title">Relevé d&apos;heure</h1>
            <p
              className="a-kpi__meta"
              style={{ marginTop: "6px", marginBottom: "var(--cp-s-5)" }}
            >
              À remplir une fois l&apos;intervention terminée. Les heures se
              comptent au quart d&apos;heure.
            </p>

            <ReleveForm clients={clients} />
          </section>
        </div>
      </main>
    </div>
  );
}
