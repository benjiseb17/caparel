import { cookies } from "next/headers";
import type {
  Client,
  FicheDePaie,
  Intervenant,
  ModificationReleve,
  NouveauReleve,
  Releve,
  StatsAnnuelles,
  StatsMensuelles,
} from "@/lib/airtable";
import { calculerStatsAnnuelles, calculerStatsMensuelles } from "@/lib/airtable";

export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

export const DEMO_INTERVENANT: Intervenant = {
  id: "demo-intervenant-1",
  prenom: "Camille",
  nom: "Dupont",
  email: "demo@test.fr",
  motDePasseHash: "$2b$10$5UO/soFoHjpiOvb0b2Og4OgiYezYQgP3GSX0F4tDWzo2eeZeW0kOe", // demo1234
  actif: true,
  photoUrl: "",
  tauxHoraire: 15.5,
};

export const DEMO_CLIENTS: Client[] = [
  {
    id: "demo-client-1",
    nom: "M. Lefèvre",
    adresse: "12 rue des Lilas, 92200 Neuilly-sur-Seine",
    numeroClient: "CL-0142",
  },
  {
    id: "demo-client-2",
    nom: "Mme Girard",
    adresse: "5 avenue Foch, 92200 Neuilly-sur-Seine",
    numeroClient: "CL-0198",
  },
  {
    id: "demo-client-3",
    nom: "M. et Mme Bonnet",
    adresse: "8 rue du Château, 92200 Neuilly-sur-Seine",
    numeroClient: "CL-0207",
  },
];

export function getDemoClientsForIntervenant(): Client[] {
  return DEMO_CLIENTS;
}

export const DEMO_FICHES_PAIE: FicheDePaie[] = [
  {
    id: "demo-fiche-1",
    mois: "2026-08-01",
    fichierUrl: "",
    fichierNom: "Fiche_de_paie_Aout_2026.pdf",
  },
  {
    id: "demo-fiche-2",
    mois: "2026-07-01",
    fichierUrl: "",
    fichierNom: "Fiche_de_paie_Juillet_2026.pdf",
  },
];

export function getDemoFichesDePaie(): FicheDePaie[] {
  return DEMO_FICHES_PAIE;
}

// Stockage dans un cookie pour la démo uniquement (pas Airtable).
// Sur Vercel, chaque requête peut être traitée par une instance serveur
// différente : ni un tableau en mémoire ni un fichier écrit sur disque ne
// seraient partagés de façon fiable entre la route API et la page
// historique. Le cookie, lui, voyage avec chaque requête du navigateur.
const COOKIE_NAME = "demo_releves";
const MAX_ENTREES = 10;

async function readDemoStore(): Promise<Releve[]> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return [];
  }
}

async function writeDemoStore(releves: Releve[]) {
  const store = await cookies();
  const trimmed = releves.slice(0, MAX_ENTREES);
  store.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(trimmed)), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24h : la démo n'a pas besoin de durer plus longtemps
    path: "/",
  });
}

export async function addDemoReleve(releve: NouveauReleve): Promise<string> {
  const releves = await readDemoStore();
  const id = `demo-releve-${Date.now()}`;
  const clientNom =
    DEMO_CLIENTS.find((c) => c.id === releve.clientId)?.nom || "Client inconnu";

  releves.unshift({
    id,
    date: releve.date,
    clientId: releve.clientId,
    clientNom,
    heureArrivee: releve.heureArrivee,
    heureDepart: releve.heureDepart,
    heuresRealisees: releve.heuresRealisees,
    commentaire: releve.commentaire,
  });

  await writeDemoStore(releves);
  return id;
}

export async function getDemoReleves(limit = 20): Promise<Releve[]> {
  const releves = await readDemoStore();
  return releves.slice(0, limit);
}

export async function demoReleveExiste(releveId: string): Promise<boolean> {
  const releves = await readDemoStore();
  return releves.some((r) => r.id === releveId);
}

export async function modifierDemoReleve(
  releveId: string,
  releve: ModificationReleve
): Promise<boolean> {
  const releves = await readDemoStore();
  const index = releves.findIndex((r) => r.id === releveId);
  if (index === -1) return false;

  const clientNom =
    DEMO_CLIENTS.find((c) => c.id === releve.clientId)?.nom || "Client inconnu";

  releves[index] = {
    id: releveId,
    date: releve.date,
    clientId: releve.clientId,
    clientNom,
    heureArrivee: releve.heureArrivee,
    heureDepart: releve.heureDepart,
    heuresRealisees: releve.heuresRealisees,
    commentaire: releve.commentaire,
  };

  await writeDemoStore(releves);
  return true;
}

async function getDemoReleveHeures(): Promise<{ date: string; heures: number }[]> {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  const releves = (await readDemoStore()).map((r) => ({
    date: r.date,
    heures: r.heuresRealisees,
  }));

  // En démo, si aucun relevé n'a encore été saisi ce mois-ci, on ajoute un
  // exemple pour que le récap et les graphiques ne soient pas vides.
  const auMoinsUnCeMois = releves.some((r) => r.date.slice(0, 7) === todayIso.slice(0, 7));
  if (!auMoinsUnCeMois) {
    releves.push({ date: todayIso, heures: 3.5 });
  }

  return releves;
}

export async function getDemoStatsMensuelles(
  tauxHoraire: number
): Promise<StatsMensuelles> {
  return calculerStatsMensuelles(await getDemoReleveHeures(), tauxHoraire);
}

export async function getDemoStatsAnnuelles(
  tauxHoraire: number
): Promise<StatsAnnuelles> {
  return calculerStatsAnnuelles(await getDemoReleveHeures(), tauxHoraire);
}
