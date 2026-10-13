import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/charte/Header";
import Icone from "@/components/charte/Icone";
import { NAV_INTERVENANTE } from "@/lib/navigation";
import { getCompteById, getFichesDePaieByIntervenant } from "@/lib/airtable";
import { isDemoMode, getDemoFichesDePaie } from "@/lib/demo";
import { formatMoisFr } from "@/lib/format";

export default async function FichesDePaiePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Réservé aux intervenantes : ni un référent ni une famille n'a de fiche de
  // paie. L'autorisation est relue depuis Airtable à chaque affichage.
  if (
    !isDemoMode() &&
    (await getCompteById(session.user.id))?.role !== "intervenante"
  ) {
    redirect("/");
  }

  const fiches = isDemoMode()
    ? getDemoFichesDePaie()
    : await getFichesDePaieByIntervenant(session.user.id);

  return (
    <div className="cp-root">
      <Header liens={NAV_INTERVENANTE} actif="/fiches-de-paie" />

      <main className="cp-container a-main">
        <div className="a-narrow">
          <section className="cp-card a-card">
            <div className="cp-card__head">
              <h1 className="cp-title">Mes fiches de paie</h1>
            </div>
            <p
              className="a-kpi__meta"
              style={{ marginTop: "-8px", marginBottom: "var(--cp-s-5)" }}
            >
              Du plus récent au plus ancien. Un mois n&apos;apparaît qu&apos;une
              fois son bulletin publié par Caparel.
            </p>

            {fiches.length === 0 ? (
              <p className="cp-empty">
                Aucune fiche de paie disponible pour le moment.
              </p>
            ) : (
              <ul>
                {fiches.map((f) => (
                  <li className="a-row" key={f.id}>
                    <span className="cp-chip-icon">
                      <Icone nom="file" />
                    </span>
                    <div className="a-row__body">
                      <p className="a-row__title">{formatMoisFr(f.mois)}</p>
                    </div>
                    {f.fichierUrl ? (
                      <a
                        className="cp-link"
                        href={f.fichierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Télécharger
                      </a>
                    ) : (
                      <span className="a-row__meta">Indisponible (démo)</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
