import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/charte/Header";
import Icone from "@/components/charte/Icone";
import { NAV_REFERENT } from "@/lib/navigation";
import { getCompteById, getFamillesDuReferent } from "@/lib/airtable";
import { isDemoMode, DEMO_INTERVENANT } from "@/lib/demo";
import { formatHeures, formatDateFr, partsDateFr } from "@/lib/format";

const MOIS_LABEL = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

const HORODATAGE = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function formatHorodatage(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : HORODATAGE.format(d);
}

export default async function FamillesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Autorisation relue depuis Airtable, comme pour le bloc Direction :
  // retirer le compte de la table Referents coupe l'accès sans attendre une
  // reconnexion.
  const profil = isDemoMode()
    ? DEMO_INTERVENANT
    : await getCompteById(session.user.id);

  if (profil?.role !== "referent") {
    redirect("/");
  }

  const maintenant = new Date();
  const familles = isDemoMode()
    ? []
    : await getFamillesDuReferent(
        session.user.id,
        maintenant,
        profil.accesComplet
      );

  return (
    <div className="cp-root">
      <Header liens={NAV_REFERENT} actif="/familles" />

      <main className="cp-container a-main">
        <section className="cp-card a-card">
          <h1 className="cp-title">
            {profil.accesComplet ? "Toutes les familles" : "Mes familles"}
          </h1>
          <p className="a-kpi__meta" style={{ marginTop: "6px" }}>
            {profil.accesComplet
              ? "L'ensemble des familles suivies par Caparel, et leur activité récente."
              : "Les familles dont vous êtes référent, et leur activité récente."}
          </p>
        </section>

        {familles.length === 0 ? (
          <section className="cp-card a-card">
            <p className="cp-empty">
              {profil.accesComplet
                ? "Aucune famille enregistrée pour le moment."
                : "Aucune famille ne vous est assignée comme référent."}
            </p>
          </section>
        ) : (
          familles.map((famille) => (
            <section className="cp-card a-card" key={famille.id}>
              <div className="a-famille__head">
                <div style={{ minWidth: 0 }}>
                  <h2 className="cp-title">{famille.nom}</h2>
                  {famille.adresse && (
                    <p className="a-kpi__meta" style={{ marginTop: "2px" }}>
                      {famille.adresse}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <p className="a-visit__duration a-kpi__value--money">
                    {formatHeures(famille.heuresMois)}
                  </p>
                  <p
                    className="a-kpi__meta"
                    style={{ textTransform: "capitalize" }}
                  >
                    {MOIS_LABEL.format(maintenant)}
                  </p>
                </div>
              </div>

              {famille.intervenantes.length > 0 && (
                <p className="a-kpi__meta" style={{ marginTop: "var(--cp-s-3)" }}>
                  {famille.intervenantes.length > 1
                    ? "Intervenantes : "
                    : "Intervenante : "}
                  <span style={{ color: "var(--cp-text)" }}>
                    {famille.intervenantes.join(", ")}
                  </span>
                </p>
              )}

              {famille.retours.length > 0 && (
                <div style={{ marginTop: "var(--cp-s-5)" }}>
                  <p className="a-kpi__label" style={{ marginBottom: "var(--cp-s-3)" }}>
                    Retours de la famille
                  </p>
                  <ul>
                    {famille.retours.map((r) => (
                      <li
                        className="a-remark"
                        key={r.id}
                        style={{ marginBottom: "var(--cp-s-3)" }}
                      >
                        <div className="a-remark__head">
                          <span>
                            {formatHorodatage(r.ecritLe)}
                            {r.dateIntervention && (
                              <>
                                {" · intervention du "}
                                {formatDateFr(r.dateIntervention)}
                              </>
                            )}
                          </span>
                          {!r.traite && (
                            <span className="cp-badge">
                              <Icone nom="alert" taille="xs" />À traiter
                            </span>
                          )}
                        </div>
                        <p className="a-remark__text">{r.message}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: "var(--cp-s-5)" }}>
                <p className="a-kpi__label" style={{ marginBottom: "var(--cp-s-3)" }}>
                  Dernières interventions
                </p>

                {famille.interventions.length === 0 ? (
                  <p className="cp-empty">
                    Aucune intervention enregistrée pour cette famille.
                  </p>
                ) : (
                  <ol className="a-visits">
                    {famille.interventions.map((i) => {
                      const d = partsDateFr(i.date);
                      return (
                        <li className="a-visit" key={i.id}>
                          <time className="a-date" dateTime={i.date}>
                            <span className="a-date__weekday">{d.jour}</span>
                            <span className="a-date__day">{d.quantieme}</span>
                            <span className="a-date__month">{d.mois}</span>
                          </time>
                          <div className="a-visit__body">
                            <p className="a-visit__who">{i.intervenante}</p>
                            <p className="a-visit__time">
                              <Icone nom="clock" taille="sm" />
                              {i.heureArrivee} – {i.heureDepart}
                            </p>
                          </div>
                          <div className="a-visit__figures">
                            <p className="a-visit__duration">
                              {formatHeures(i.heures)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}
