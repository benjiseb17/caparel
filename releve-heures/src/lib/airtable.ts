import Airtable from "airtable";

// Connexion Airtable initialisée à la demande (pas au chargement du module),
// pour ne pas planter le build/le mode démo quand ces variables ne sont pas
// définies (elles ne sont nécessaires qu'en dehors du mode démo).
let cachedBase: Airtable.Base | null = null;

function base(table: string) {
  if (!cachedBase) {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      throw new Error(
        "AIRTABLE_API_KEY ou AIRTABLE_BASE_ID manquant(s) dans les variables d'environnement."
      );
    }

    cachedBase = new Airtable({ apiKey }).base(baseId);
  }

  return cachedBase(table);
}

export const TABLES = {
  intervenants: process.env.AIRTABLE_TABLE_INTERVENANTS || "Intervenants",
  clients: process.env.AIRTABLE_TABLE_CLIENTS || "Clients",
  releves: process.env.AIRTABLE_TABLE_RELEVES || "Releves",
  fichesDePaie: process.env.AIRTABLE_TABLE_FICHES_PAIE || "FichesDePaie",
};

type AirtableAttachment = {
  url: string;
  filename: string;
};

export type Intervenant = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  motDePasseHash: string;
  actif: boolean;
  photoUrl: string;
  tauxHoraire: number;
};

function mapIntervenant(record: Airtable.Record<Airtable.FieldSet>): Intervenant {
  const photos = (record.get("Photo") as AirtableAttachment[] | undefined) || [];
  return {
    id: record.id,
    prenom: (record.get("Prenom") as string) || "",
    nom: (record.get("Nom") as string) || "",
    email: (record.get("Email") as string) || "",
    motDePasseHash: (record.get("MotDePasseHash") as string) || "",
    actif: Boolean(record.get("Actif")),
    photoUrl: photos[0]?.url || "",
    tauxHoraire: (record.get("TauxHoraire") as number) || 0,
  };
}

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
  return mapIntervenant(records[0]);
}

export async function getIntervenantById(
  id: string
): Promise<Intervenant | null> {
  try {
    const record = await base(TABLES.intervenants).find(id);
    return mapIntervenant(record);
  } catch {
    return null;
  }
}

export type Client = {
  id: string;
  nom: string;
  adresse: string;
  numeroClient: string;
};

export async function getClientsForIntervenant(
  intervenantId: string
): Promise<Client[]> {
  const records = await base(TABLES.clients)
    .select({
      filterByFormula: `{Actif} = 1`,
      sort: [{ field: "Nom", direction: "asc" }],
    })
    .all();

  return records
    .filter((record) => {
      const ids =
        (record.get("Intervenants assignes") as string[] | undefined) || [];
      return ids.includes(intervenantId);
    })
    .map((record) => ({
      id: record.id,
      nom: (record.get("Nom") as string) || "",
      adresse: (record.get("Adresse") as string) || "",
      numeroClient: (record.get("Numero client") as string) || "",
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
  certifie: boolean;
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
    Certification: releve.certifie,
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

export type StatSemaine = {
  label: string;
  heures: number;
  ca: number;
};

export type StatsMensuelles = {
  totalHeures: number;
  totalCA: number;
  parSemaine: StatSemaine[];
};

function calculerStatsMensuelles(
  releves: { date: string; heures: number }[],
  tauxHoraire: number
): StatsMensuelles {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const parSemaine: StatSemaine[] = [1, 2, 3, 4, 5].map((n) => ({
    label: `Sem. ${n}`,
    heures: 0,
    ca: 0,
  }));

  let totalHeures = 0;

  for (const r of releves) {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;

    const semaineIndex = Math.min(Math.floor((d.getDate() - 1) / 7), 4);
    parSemaine[semaineIndex].heures += r.heures;
    parSemaine[semaineIndex].ca += r.heures * tauxHoraire;
    totalHeures += r.heures;
  }

  return {
    totalHeures: Math.round(totalHeures * 100) / 100,
    totalCA: Math.round(totalHeures * tauxHoraire * 100) / 100,
    parSemaine: parSemaine.map((s) => ({
      ...s,
      heures: Math.round(s.heures * 100) / 100,
      ca: Math.round(s.ca * 100) / 100,
    })),
  };
}

export type StatMois = {
  label: string;
  ca: number;
};

export type StatsAnnuelles = {
  totalCA: number;
  parMois: StatMois[];
};

const MOIS_COURTS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

function calculerStatsAnnuelles(
  releves: { date: string; heures: number }[],
  tauxHoraire: number
): StatsAnnuelles {
  const year = new Date().getFullYear();

  const parMois: StatMois[] = MOIS_COURTS.map((label) => ({ label, ca: 0 }));

  let totalCA = 0;

  for (const r of releves) {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime()) || d.getFullYear() !== year) continue;

    const ca = r.heures * tauxHoraire;
    parMois[d.getMonth()].ca += ca;
    totalCA += ca;
  }

  return {
    totalCA: Math.round(totalCA * 100) / 100,
    parMois: parMois.map((m) => ({ ...m, ca: Math.round(m.ca * 100) / 100 })),
  };
}

export async function getReleveHeuresIntervenant(
  intervenantId: string
): Promise<{ date: string; heures: number }[]> {
  const records = await base(TABLES.releves).select().all();

  return records
    .filter((r) => {
      const ids = (r.get("Intervenant") as string[] | undefined) || [];
      return ids.includes(intervenantId);
    })
    .map((r) => ({
      date: (r.get("Date") as string) || "",
      heures: (r.get("Heures realisees") as number) || 0,
    }));
}

export async function getStatsMensuelles(
  intervenantId: string,
  tauxHoraire: number
): Promise<StatsMensuelles> {
  const releves = await getReleveHeuresIntervenant(intervenantId);
  return calculerStatsMensuelles(releves, tauxHoraire);
}

export async function getStatsAnnuelles(
  intervenantId: string,
  tauxHoraire: number
): Promise<StatsAnnuelles> {
  const releves = await getReleveHeuresIntervenant(intervenantId);
  return calculerStatsAnnuelles(releves, tauxHoraire);
}

export { calculerStatsMensuelles, calculerStatsAnnuelles };

export type FicheDePaie = {
  id: string;
  mois: string;
  fichierUrl: string;
  fichierNom: string;
};

export async function getFichesDePaieByIntervenant(
  intervenantId: string
): Promise<FicheDePaie[]> {
  const records = await base(TABLES.fichesDePaie)
    .select({ sort: [{ field: "Mois", direction: "desc" }] })
    .all();

  return records
    .filter((r) => {
      const ids = (r.get("Intervenant") as string[] | undefined) || [];
      return ids.includes(intervenantId);
    })
    .map((r) => {
      const fichiers =
        (r.get("Fichier") as AirtableAttachment[] | undefined) || [];
      return {
        id: r.id,
        mois: (r.get("Mois") as string) || "",
        fichierUrl: fichiers[0]?.url || "",
        fichierNom: fichiers[0]?.filename || "Fiche de paie",
      };
    });
}
