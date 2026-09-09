import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/auth";
import AppHeader from "@/components/AppHeader";
import BarChart from "@/components/BarChart";
import ClientsAssignes from "@/components/ClientsAssignes";
import {
  getIntervenantById,
  getClientsForIntervenant,
  getReleveHeuresIntervenant,
  calculerStatsMensuelles,
  calculerStatsAnnuelles,
} from "@/lib/airtable";
import {
  isDemoMode,
  DEMO_INTERVENANT,
  getDemoClientsForIntervenant,
  getDemoStatsMensuelles,
  getDemoStatsAnnuelles,
} from "@/lib/demo";
import { formatHeures } from "@/lib/format";

const MOIS_LABEL = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
}).format(new Date());

const ANNEE = new Date().getFullYear();

export default async function AccueilPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profil = isDemoMode()
    ? DEMO_INTERVENANT
    : await getIntervenantById(session.user.id);

  const tauxHoraire = profil?.tauxHoraire || 0;

  let clients, statsMois, statsAnnee;
  if (isDemoMode()) {
    const [statsMoisRes, statsAnneeRes] = await Promise.all([
      getDemoStatsMensuelles(tauxHoraire),
      getDemoStatsAnnuelles(tauxHoraire),
    ]);
    clients = getDemoClientsForIntervenant();
    statsMois = statsMoisRes;
    statsAnnee = statsAnneeRes;
  } else {
    const [clientsRes, releveHeures] = await Promise.all([
      getClientsForIntervenant(session.user.id),
      getReleveHeuresIntervenant(session.user.id),
    ]);
    clients = clientsRes;
    statsMois = calculerStatsMensuelles(releveHeures, tauxHoraire);
    statsAnnee = calculerStatsAnnuelles(releveHeures, tauxHoraire);
  }

  const prenom = profil?.prenom || session.user.prenom || "";
  const nom = profil?.nom || session.user.nom || "";
  const initiales = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-soft flex flex-col">
      <AppHeader active="accueil" />
      <main className="flex-1 flex flex-col items-center px-4 pb-12 pt-2 sm:pt-8">
        <div className="w-full max-w-md lg:max-w-4xl space-y-4">
          <div className="relative rounded-2xl border border-line bg-white p-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-navylogo via-teal to-teal-dark" />
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-teal/10" />
            <Image
              src="/caparel-icon.png"
              alt=""
              width={200}
              height={200}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-90 mix-blend-multiply pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-4">
              {profil?.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profil.photoUrl}
                  alt={`${prenom} ${nom}`}
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-navylogo text-white flex items-center justify-center font-heading font-bold text-lg shrink-0">
                  {initiales}
                </div>
              )}
              <div>
                <p className="text-sm text-muted">Bonjour</p>
                <h1 className="font-heading text-xl font-bold text-navy">
                  {prenom}
                </h1>
                <p className="text-sm text-muted">
                  {prenom} {nom}
                </p>
                <p className="text-xs text-teal-dark font-medium mt-1">
                  Caparel · Aide à domicile aux personnes âgées
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div>
              <h2 className="text-sm font-medium text-muted mb-2">
                {clients.length > 1 ? "Vos clients" : "Votre client"}
              </h2>
              <ClientsAssignes clients={clients} />
            </div>

            <div className="bg-white rounded-2xl border border-line p-6">
              <p className="text-sm text-muted mb-4 capitalize">
                Récap — {MOIS_LABEL}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="font-heading text-2xl font-bold text-navy">
                    {formatHeures(statsMois.totalHeures)}
                  </p>
                  <p className="text-xs text-muted">Heures réalisées</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-teal-dark">
                    {statsMois.totalCA.toLocaleString("fr-FR")} €
                  </p>
                  <p className="text-xs text-muted">Chiffre d&apos;affaires</p>
                </div>
              </div>

              <p className="text-xs font-medium text-ink mb-2">
                Heures par semaine
              </p>
              <BarChart
                data={statsMois.parSemaine.map((s) => ({
                  label: s.label,
                  value: s.heures,
                }))}
                color="#12305c"
                formatValue={formatHeures}
              />

              <p className="text-xs font-medium text-ink mt-6 mb-2">
                Chiffre d&apos;affaires par semaine
              </p>
              <BarChart
                data={statsMois.parSemaine.map((s) => ({
                  label: s.label,
                  value: s.ca,
                }))}
                color="#3fb6ae"
                formatValue={(v) => `${Math.round(v)}€`}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-line p-6">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-sm text-muted">
                Chiffre d&apos;affaires — Année {ANNEE}
              </p>
              <p className="font-heading text-xl font-bold text-teal-dark">
                {statsAnnee.totalCA.toLocaleString("fr-FR")} €
              </p>
            </div>

            <BarChart
              data={statsAnnee.parMois.map((m) => ({
                label: m.label,
                value: m.ca,
              }))}
              color="#3fb6ae"
              formatValue={(v) => `${Math.round(v)}€`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
