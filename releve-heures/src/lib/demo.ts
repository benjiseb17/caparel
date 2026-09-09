import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type {
  Client,
  FicheDePaie,
  Intervenant,
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

// Stockage sur disque pour la démo uniquement (un fichier JSON, pas Airtable).
// Nécessaire car en dev, Next.js peut charger ce module dans des instances
// séparées selon la route : un simple tableau en mémoire ne serait pas partagé
// de façon fiable entre la route API et la page historique.
// On utilise le dossier temporaire du système (pas le dossier du projet) car
// sur Vercel, seul /tmp est accessible en écriture.
const DEMO_STORE_PATH = join(tmpdir(), "releve-heures-demo.json");

function readDemoStore(): Releve[] {
  if (!existsSync(DEMO_STORE_PATH)) return [];
  try {
    return JSON.parse(readFileSync(DEMO_STORE_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeDemoStore(releves: Releve[]) {
  writeFileSync(DEMO_STORE_PATH, JSON.stringify(releves, null, 2));
}

export function addDemoReleve(releve: NouveauReleve): string {
  const releves = readDemoStore();
  const id = `demo-releve-${Date.now()}`;
  const clientNom =
    DEMO_CLIENTS.find((c) => c.id === releve.clientId)?.nom || "Client inconnu";

  releves.unshift({
    id,
    date: releve.date,
    clientNom,
    heureArrivee: releve.heureArrivee,
    heureDepart: releve.heureDepart,
    heuresRealisees: releve.heuresRealisees,
    commentaire: releve.commentaire,
  });

  writeDemoStore(releves);
  return id;
}

export function getDemoReleves(limit = 20): Releve[] {
  return readDemoStore().slice(0, limit);
}

function getDemoReleveHeures(): { date: string; heures: number }[] {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  const releves = readDemoStore().map((r) => ({
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

export function getDemoStatsMensuelles(tauxHoraire: number): StatsMensuelles {
  return calculerStatsMensuelles(getDemoReleveHeures(), tauxHoraire);
}

export function getDemoStatsAnnuelles(tauxHoraire: number): StatsAnnuelles {
  return calculerStatsAnnuelles(getDemoReleveHeures(), tauxHoraire);
}
