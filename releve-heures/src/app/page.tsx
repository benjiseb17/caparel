import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccueilFamille from "@/components/famille/AccueilFamille";
import AccueilIntervenante from "@/components/intervenante/AccueilIntervenante";
import AccueilReferent from "@/components/referent/AccueilReferent";
import {
  getCompteById,
  getClientsForIntervenant,
  getReleveHeuresIntervenant,
  calculerStatsMensuelles,
  getStatsAdmin,
  getInterventionsFamille,
  resumeMoisFamille,
  getSuivisDuClient,
} from "@/lib/airtable";
import {
  isDemoMode,
  DEMO_INTERVENANT,
  getDemoClientsForIntervenant,
  getDemoStatsMensuelles,
} from "@/lib/demo";

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
    : await getCompteById(session.user.id);

  // Une famille a son propre écran : rien de ce qui suit ne la concerne.
  if (profil?.role === "famille") {
    const [interventions, suivis] = await Promise.all([
      getInterventionsFamille(profil.id),
      getSuivisDuClient(profil.id),
    ]);

    return (
      <AccueilFamille
        nomClient={profil.nomComplet}
        resume={resumeMoisFamille(interventions, refDate)}
        derniereRemarque={suivis[0] || null}
        dateParReleve={new Map(interventions.map((i) => [i.id, i.date]))}
        mois={refDate}
        libelleMois={label}
        moisPrecedent={moisPrecedent}
        moisSuivant={moisSuivant}
        estMoisCourant={estMoisCourant}
      />
    );
  }

  const tauxHoraire = profil?.tauxHoraire || 0;
  const nomComplet = profil?.nomComplet || session.user.nomComplet || "";

  // Un référent n'intervient pas : il n'a ni clients assignés ni heures à
  // récapituler. Son accueil garde l'habillage d'origine, faute de maquette.
  if (profil?.role === "referent") {
    const maintenant = new Date();
    return (
      <AccueilReferent
        nomComplet={nomComplet}
        photoUrl={profil.photoUrl}
        stats={await getStatsAdmin(maintenant)}
        jour={maintenant}
      />
    );
  }

  const [clients, statsMois] = isDemoMode()
    ? [
        getDemoClientsForIntervenant(),
        await getDemoStatsMensuelles(tauxHoraire, refDate),
      ]
    : await (async () => {
        const [clientsRes, releveHeures] = await Promise.all([
          getClientsForIntervenant(session.user.id),
          getReleveHeuresIntervenant(session.user.id),
        ]);
        return [
          clientsRes,
          calculerStatsMensuelles(releveHeures, tauxHoraire, refDate),
        ] as const;
      })();

  return (
    <AccueilIntervenante
      nomComplet={nomComplet}
      photoUrl={profil?.photoUrl || ""}
      clients={clients}
      totalHeures={statsMois.totalHeures}
      totalCA={statsMois.totalCA}
      libelleMois={label}
      moisPrecedent={moisPrecedent}
      moisSuivant={moisSuivant}
      estMoisCourant={estMoisCourant}
    />
  );
}
