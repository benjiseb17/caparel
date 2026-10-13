import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/charte/Header";
import Icone from "@/components/charte/Icone";
import SuiviForm from "@/components/famille/SuiviForm";
import { NAV_FAMILLE } from "@/lib/navigation";
import {
  getCompteById,
  getInterventionsFamille,
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

  const [interventions, suivis] = await Promise.all([
    getInterventionsFamille(profil.id),
    getSuivisDuClient(profil.id),
  ]);

  const dateParReleve = new Map(interventions.map((i) => [i.id, i.date]));

  return (
    <div className="cp-root">
      <Header liens={NAV_FAMILLE} actif="/suivi" />

      <main className="cp-container a-main">
        <div className="a-narrow">
          <section className="cp-card a-card">
            <h1 className="cp-title">Écrire à Caparel</h1>
            <p
              className="a-kpi__meta"
              style={{ marginTop: "6px", marginBottom: "var(--cp-s-5)" }}
            >
              Un besoin, une remarque sur une intervention, un changement
              d&apos;habitude. Vos messages ne sont lus que par l&apos;équipe
              Caparel, jamais par l&apos;intervenante qui vient chez vous.
            </p>

            <SuiviForm interventions={interventions} />
          </section>

          <section
            className="cp-card a-card"
            style={{ marginTop: "var(--cp-s-4)" }}
          >
            <div className="cp-card__head">
              <h2 className="cp-title">Vos messages</h2>
            </div>

            {suivis.length === 0 ? (
              <p className="cp-empty">
                Vous n&apos;avez encore envoyé aucun message.
              </p>
            ) : (
              <ol>
                {suivis.map((s) => (
                  <li
                    key={s.id}
                    className="a-remark"
                    style={{ marginBottom: "var(--cp-s-3)" }}
                  >
                    <div className="a-remark__head">
                      <span>
                        {s.releveId && dateParReleve.has(s.releveId)
                          ? `Intervention du ${formatDateFr(
                              dateParReleve.get(s.releveId) || ""
                            )}`
                          : "Remarque générale"}
                      </span>
                      <span className="cp-badge">
                        <Icone nom="check" taille="xs" />
                        {s.traite ? "Pris en compte" : "Transmis"}
                      </span>
                    </div>
                    <p className="a-remark__text">{s.message}</p>
                    <p className="a-remark__meta">
                      Envoyée le {formatHorodatage(s.ecritLe)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
