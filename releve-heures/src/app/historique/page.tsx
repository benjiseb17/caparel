import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Header from "@/components/charte/Header";
import Icone from "@/components/charte/Icone";
import { NAV_INTERVENANTE } from "@/lib/navigation";
import { getCompteById, getRelevesByIntervenant } from "@/lib/airtable";
import { isDemoMode, getDemoReleves } from "@/lib/demo";
import { formatHeures, partsDateFr } from "@/lib/format";

export default async function HistoriquePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Réservé aux intervenantes : ni un référent ni une famille n'a de relevés.
  // L'autorisation est relue depuis Airtable à chaque affichage.
  if (
    !isDemoMode() &&
    (await getCompteById(session.user.id))?.role !== "intervenante"
  ) {
    redirect("/");
  }

  const releves = isDemoMode()
    ? await getDemoReleves()
    : await getRelevesByIntervenant(session.user.id);

  const total = releves.reduce((t, r) => t + r.heuresRealisees, 0);

  return (
    <div className="cp-root">
      <Header liens={NAV_INTERVENANTE} actif="/historique" />

      <main className="cp-container a-main">
        <div className="a-narrow">
          <section className="cp-card a-card">
            <div className="cp-card__head">
              <h1 className="cp-title">Historique</h1>
            </div>
            <p
              className="a-kpi__meta"
              style={{ marginTop: "-8px", marginBottom: "var(--cp-s-5)" }}
            >
              Vos 20 derniers relevés validés. Pour corriger une erreur,
              contactez Caparel : un relevé validé n&apos;est plus modifiable.
            </p>

            {releves.length === 0 ? (
              <p className="cp-empty">Aucun relevé enregistré pour le moment.</p>
            ) : (
              <>
                <ol className="a-visits">
                  {releves.map((r) => {
                    const d = partsDateFr(r.date);
                    return (
                      <li className="a-visit" key={r.id}>
                        <time className="a-date" dateTime={r.date}>
                          <span className="a-date__weekday">{d.jour}</span>
                          <span className="a-date__day">{d.quantieme}</span>
                          <span className="a-date__month">{d.mois}</span>
                        </time>

                        <div className="a-visit__body">
                          <p className="a-visit__who">{r.clientNom}</p>
                          <p className="a-visit__time">
                            <Icone nom="clock" taille="sm" />
                            {r.heureArrivee} – {r.heureDepart}
                          </p>
                        </div>

                        <div className="a-visit__figures">
                          <p className="a-visit__duration">
                            {formatHeures(r.heuresRealisees)}
                          </p>
                        </div>

                        {r.commentaire && (
                          <p className="a-visit__word">{r.commentaire}</p>
                        )}
                      </li>
                    );
                  })}
                </ol>

                <p className="a-total">
                  <span>
                    {releves.length > 1
                      ? `${releves.length} relevés`
                      : `${releves.length} relevé`}
                  </span>
                  <strong>{formatHeures(Math.round(total * 100) / 100)}</strong>
                </p>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
