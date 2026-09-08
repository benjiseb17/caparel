import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.warn(
    "AIRTABLE_API_KEY ou AIRTABLE_BASE_ID manquant(s) dans les variables d'environnement."
  );
}

const base = new Airtable({ apiKey }).base(baseId ?? "");

export const TABLES = {
  intervenants: process.env.AIRTABLE_TABLE_INTERVENANTS || "Intervenants",
  clients: process.env.AIRTABLE_TABLE_CLIENTS || "Clients",
  releves: process.env.AIRTABLE_TABLE_RELEVES || "Releves",
};

export type Intervenant = {
  id: string;
  nom: string;
  email: string;
  motDePasseHash: string;
  actif: boolean;
};

export type Client = {
  id: string;
  nom: string;
};

export async function getIntervenantByEmail(
  email: string
): Promise<Intervenant | null> {
  const records = await base(TABLES.intervenants)
    .select({
      filterByFormula: `LOWER({Email}) = LOWER("${email.replace(/"/g, '\\"')}")`,
      maxRecords: 1,
    })
    .firstPage();

  if (records.length === 0) return null;

  const record = records[0];
  return {
    id: record.id,
    nom: (record.get("Nom") as string) || "",
    email: (record.get("Email") as string) || "",
    motDePasseHash: (record.get("MotDePasseHash") as string) || "",
    actif: Boolean(record.get("Actif")),
  };
}

export async function getActiveClients(): Promise<Client[]> {
  const records = await base(TABLES.clients)
    .select({
      filterByFormula: `{Actif} = 1`,
      sort: [{ field: "Nom", direction: "asc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    nom: (record.get("Nom") as string) || "",
  }));
}

export type NouveauReleve = {
  intervenantId: string;
  clientId: string;
  date: string;
  heureArrivee: string;
  heureDepart: string;
  heuresRealisees: number;
  commentaire?: string;
};

export async function creerReleve(releve: NouveauReleve) {
  const record = await base(TABLES.releves).create({
    Intervenant: [releve.intervenantId],
    Client: [releve.clientId],
    Date: releve.date,
    "Heure d'arrivee": releve.heureArrivee,
    "Heure de depart": releve.heureDepart,
    "Heures realisees": releve.heuresRealisees,
    Commentaire: releve.commentaire || "",
  });

  return record.id;
}

export type Releve = {
  id: string;
  date: string;
  clientNom: string;
  heureArrivee: string;
  heureDepart: string;
  heuresRealisees: number;
  commentaire?: string;
};

export async function getRelevesByIntervenant(
  intervenantId: string,
  limit = 20
): Promise<Releve[]> {
  const [releveRecords, clientRecords] = await Promise.all([
    base(TABLES.releves)
      .select({ sort: [{ field: "Date", direction: "desc" }] })
      .all(),
    base(TABLES.clients).select().all(),
  ]);

  const clientsParId = new Map(
    clientRecords.map((c) => [c.id, (c.get("Nom") as string) || ""])
  );

  return releveRecords
    .filter((r) => {
      const ids = (r.get("Intervenant") as string[] | undefined) || [];
      return ids.includes(intervenantId);
    })
    .slice(0, limit)
    .map((r) => {
      const clientIds = (r.get("Client") as string[] | undefined) || [];
      return {
        id: r.id,
        date: (r.get("Date") as string) || "",
        clientNom: clientsParId.get(clientIds[0]) || "Client inconnu",
        heureArrivee: (r.get("Heure d'arrivee") as string) || "",
        heureDepart: (r.get("Heure de depart") as string) || "",
        heuresRealisees: (r.get("Heures realisees") as number) || 0,
        commentaire: (r.get("Commentaire") as string) || "",
      };
    });
}
