import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import Header from "@/components/charte/Header";
import { NAV_FAMILLE } from "@/lib/navigation";
import Icone from "@/components/charte/Icone";
import ListeInterventions from "@/components/charte/ListeInterventions";
import { getCompteById, getInterventionsFamille } from "@/lib/airtable";
import { isDemoMode } from "@/lib/demo";
import { formatEuros, formatHeures } from "@/lib/format";

const MOIS_LABEL = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

export default async function InterventionsPage() {
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

  const interventions = await getInterventionsFamille(profil.id);

  // Regroupées par mois, du plus récent au plus ancien : la liste couvre toute
  // l'histoire du domicile, elle serait illisible d'un seul tenant.
  const parMois = new Map<string, typeof interventions>();
  for (const i of interventions) {
    const d = new Date(i.date);
    if (Number.isNaN(d.getTime())) continue;
    const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    parMois.set(cle, [...(parMois.get(cle) || []), i]);
  }

  return (
    <div className="cp-root">
      <Header liens={NAV_FAMILLE} actif="/" />

      <main className="cp-container a-main">
        <section className="cp-card a-card">
          <div className="cp-card__head">
            <h1 className="cp-title">Toutes les interventions</h1>
            <Link className="cp-link" href="/">
              Retour à l&apos;accueil
            </Link>
          </div>

          {parMois.size === 0 ? (
            <p className="cp-empty">
              Aucune intervention n&apos;a encore été enregistrée à votre
              domicile.
            </p>
          ) : (
            [...parMois.entries()].map(([cle, duMois]) => {
              const [annee, mois] = cle.split("-").map(Number);
              const heures = duMois.reduce((t, i) => t + i.heures, 0);
              const montant = duMois.reduce((t, i) => t + i.montant, 0);

              return (
                <section key={cle} style={{ marginBottom: "var(--cp-s-6)" }}>
                  <h2
                    className="a-kpi__label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--cp-s-2)",
                      marginBottom: "var(--cp-s-3)",
                      textTransform: "capitalize",
                    }}
                  >
                    <Icone nom="calendar" taille="sm" />
                    {MOIS_LABEL.format(new Date(annee, mois - 1, 1))}
                  </h2>

                  <ListeInterventions interventions={duMois} />

                  <p className="a-total">
                    <span>
                      {duMois.length > 1
                        ? `${duMois.length} interventions`
                        : `${duMois.length} intervention`}
                    </span>
                    <strong>
                      {formatHeures(Math.round(heures * 100) / 100)} ·{" "}
                      {formatEuros(Math.round(montant * 100) / 100)}
                    </strong>
                  </p>
                </section>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
