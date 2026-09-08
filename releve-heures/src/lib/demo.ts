import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { Client, Intervenant, NouveauReleve, Releve } from "@/lib/airtable";

export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

export const DEMO_INTERVENANT: Intervenant = {
  id: "demo-intervenant-1",
  nom: "Camille Dupont",
  email: "demo@test.fr",
  motDePasseHash: "$2b$10$5UO/soFoHjpiOvb0b2Og4OgiYezYQgP3GSX0F4tDWzo2eeZeW0kOe", // demo1234
  actif: true,
};

export const DEMO_CLIENTS: Client[] = [
  { id: "demo-client-1", nom: "M. Lefèvre" },
  { id: "demo-client-2", nom: "Mme Girard" },
  { id: "demo-client-3", nom: "M. et Mme Bonnet" },
];

// Stockage sur disque pour la démo uniquement (un fichier JSON, pas Airtable).
// Nécessaire car en dev, Next.js peut charger ce module dans des instances
// séparées selon la route : un simple tableau en mémoire ne serait pas partagé
// de façon fiable entre la route API et la page historique.
const DEMO_STORE_PATH = join(process.cwd(), ".demo-releves.json");

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
