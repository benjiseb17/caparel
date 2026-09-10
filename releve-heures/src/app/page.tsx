import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

const ANNEE = new Date().getFullYear();

function resoudreMois(param?: string) {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();

  let year = nowYear;
  let month = nowMonth;

  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    if (y >= 2000 && y <= 2100 && m >= 1 && m <= 12) {
      year = y;
      month = m - 1;
    }
  }

  // Impossible de naviguer dans le futur.
  if (year > nowYear || (year === nowYear && month > nowMonth)) {
    year = nowYear;
    month = nowMonth;
  }

  const toParam = (y: number, m: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}`;

  return {
    refDate: new Date(year, month, 1),
    label: new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month, 1)),
    estMoisCourant: year === nowYear && month === nowMonth,
    moisPrecedent: toParam(year, month - 1),
    moisSuivant: toParam(year, month + 1),
  };
}

export default async function AccueilPage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { mois } = await searchParams;
  const { refDate, label, estMoisCourant, moisPrecedent, moisSuivant } =
    resoudreMois(mois);

  const profil = isDemoMode()
    ? DEMO_INTERVENANT
    : await getIntervenantById(session.user.id);

  const tauxHoraire = profil?.tauxHoraire || 0;

  let clients, statsMois, statsAnnee;
  if (isDemoMode()) {
    const [statsMoisRes, statsAnneeRes] = await Promise.all([
      getDemoStatsMensuelles(tauxHoraire, refDate),
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
    statsMois = calculerStatsMensuelles(releveHeures, tauxHoraire, refDate);
    statsAnnee = calculerStatsAnnuelles(releveHeures, tauxHoraire);
  }

  const prenom = profil?.prenom || session.user.prenom || "";
  const nom = profil?.nom || session.user.nom || "";
  const initiales = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="accueil" />
      <main className="flex-1 flex flex-col items-center px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-2 sm:pt-8">
        <div className="w-full max-w-md lg:max-w-4xl space-y-4">
          <div className="relative rounded-2xl border border-line bg-white p-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-navylogo via-teal to-teal-dark" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 h-[155%] aspect-square rounded-full bg-teal/10 flex items-center justify-center">
              <Image
                src="/caparel-icon.png"
                alt=""
                width={200}
                height={200}
                className="w-[49%] h-[49%] object-contain opacity-90 mix-blend-multiply pointer-events-none -translate-x-3"
                aria-hidden="true"
              />
            </div>
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
              <div className="flex items-center justify-center gap-3 mb-4">
                <Link
                  href={`/?mois=${moisPrecedent}`}
                  aria-label="Mois précédent"
                  className="p-1 rounded-md text-muted hover:text-navy hover:bg-soft transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </Link>
                <p className="text-sm text-muted capitalize text-center whitespace-nowrap">
                  Récap — {label}
                </p>
                {estMoisCourant ? (
                  <span
                    className="p-1 text-line/60"
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                ) : (
                  <Link
                    href={`/?mois=${moisSuivant}`}
                    aria-label="Mois suivant"
                    className="p-1 rounded-md text-muted hover:text-navy hover:bg-soft transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                )}
              </div>

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
