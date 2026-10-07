import Airtable from "airtable";
import { formatDateFr } from "@/lib/format";

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

// Les tables sont désignées par leur identifiant Airtable, pas par leur nom :
// un identifiant ne change jamais, alors que renommer une table dans Airtable
// casserait l'app en production (c'est déjà arrivé avec "Fiches de Paie").
// Les noms correspondants sont indiqués en commentaire.
export const TABLES = {
  intervenants:
    process.env.AIRTABLE_TABLE_INTERVENANTS || "tblqD8nNvzcQJODxj", // Intervenants
  referents:
    process.env.AIRTABLE_TABLE_REFERENTS || "tblbwEZIuN0A29rXs", // Referents
  clients: process.env.AIRTABLE_TABLE_CLIENTS || "tblq2AHLMnFw2cmfQ", // Clients
  releves: process.env.AIRTABLE_TABLE_RELEVES || "tblehEGJM3vZP9oOb", // Releves
  fichesDePaie:
    process.env.AIRTABLE_TABLE_FICHES_PAIE || "tbljqZpHw1hvgrQPI", // Fiches de Paie
  leads: process.env.AIRTABLE_TABLE_LEADS || "tblcVywextjxuUGYK", // Leads
};

type AirtableAttachment = {
  url: string;
  filename: string;
};

/**
 * Un compte de connexion. Les intervenantes et les référents vivent dans deux
 * tables distinctes : `referent` dit de laquelle vient le compte, et commande
 * l'accès au bloc Direction comme à la page Mes familles.
 */
export type Intervenant = {
  id: string;
  nomComplet: string;
  email: string;
  motDePasseHash: string;
  codeActivation: string;
  actif: boolean;
  referent: boolean;
  /** Référent de direction : voit toutes les familles, pas seulement les siennes. */
  accesComplet: boolean;
  photoUrl: string;
  tauxHoraire: number;
};

function mapCompte(
  record: Airtable.Record<Airtable.FieldSet>,
  referent: boolean
): Intervenant {
  const photos = (record.get("Photo") as AirtableAttachment[] | undefined) || [];
  return {
    id: record.id,
    nomComplet: (record.get("Nom et Prenom") as string) || "",
    email: (record.get("Email") as string) || "",
    motDePasseHash: (record.get("MotDePasseHash") as string) || "",
    codeActivation: (record.get("Code activation") as string) || "",
    actif: Boolean(record.get("Actif")),
    referent,
    accesComplet: referent && Boolean(record.get("Acces complet")),
    photoUrl: photos[0]?.url || "",
    tauxHoraire: (record.get("TauxHoraire") as number) || 0,
  };
}

// Les comptes vivent dans deux tables : Referents est consultée en premier,
// de sorte qu'un référent reste reconnu comme tel même si une ancienne ligne
// à son nom traîne encore dans Intervenants.
const SOURCES_COMPTE = [
  { table: TABLES.referents, referent: true },
  { table: TABLES.intervenants, referent: false },
] as const;

async function trouverCompteParEmail(email: string) {
  const formule = `LOWER({Email}) = LOWER("${email.replace(/"/g, '\\"')}")`;

  for (const source of SOURCES_COMPTE) {
    const records = await base(source.table)
      .select({ filterByFormula: formule, maxRecords: 1 })
      .firstPage();

    if (records.length > 0) return { ...source, record: records[0] };
  }

  return null;
}

export async function getIntervenantByEmail(
  email: string
): Promise<Intervenant | null> {
  const trouve = await trouverCompteParEmail(email);
  if (!trouve) return null;
  return mapCompte(trouve.record, trouve.referent);
}

/**
 * Définit le mot de passe d'un compte à partir de son code d'activation.
 *
 * Le code est une formule Airtable, donc impossible à effacer depuis l'app :
 * l'usage unique repose sur l'absence de mot de passe. Dès qu'un mot de passe
 * existe, le code devient inerte même s'il reste affiché dans Airtable. Pour
 * réinitialiser un accès, il faut vider `MotDePasseHash`.
 */
export async function activerCompteIntervenant(
  email: string,
  code: string,
  motDePasseHash: string
): Promise<boolean> {
  const trouve = await trouverCompteParEmail(email);
  if (!trouve) return false;

  const compte = mapCompte(trouve.record, trouve.referent);

  if (!compte.actif) return false;
  if (compte.motDePasseHash) return false;
  if (!compte.codeActivation) return false;

  const normaliser = (valeur: string) => valeur.trim().toUpperCase();
  if (normaliser(compte.codeActivation) !== normaliser(code)) return false;

  await base(trouve.table).update(compte.id, {
    MotDePasseHash: motDePasseHash,
  });

  return true;
}

/**
 * Retrouve un compte par son identifiant, dans Referents puis Intervenants.
 *
 * On filtre sur `RECORD_ID()` plutôt que d'utiliser `find()` : l'endpoint
 * « récupérer un enregistrement » d'Airtable résout un identifiant à l'échelle
 * de la base entière et renvoie donc la ligne même quand on interroge la
 * mauvaise table — de quoi prendre une intervenante pour une référente.
 */
export async function getIntervenantById(
  id: string
): Promise<Intervenant | null> {
  // Un identifiant Airtable est alphanumérique : on le valide avant de
  // l'injecter dans la formule.
  if (!/^rec[A-Za-z0-9]+$/.test(id)) return null;

  for (const source of SOURCES_COMPTE) {
    const records = await base(source.table)
      .select({ filterByFormula: `RECORD_ID() = "${id}"`, maxRecords: 1 })
      .firstPage();

    if (records.length > 0) return mapCompte(records[0], source.referent);
  }

  return null;
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

/**
 * Lit un champ texte d'un enregistrement désigné par son identifiant.
 *
 * On filtre sur `RECORD_ID()` plutôt que d'utiliser `find()`, qui résout un
 * identifiant à l'échelle de la base entière et renverrait donc la ligne même
 * si elle appartient à une autre table.
 */
async function lireChamp(table: string, id: string, champ: string) {
  if (!/^rec[A-Za-z0-9]+$/.test(id)) return "";

  const records = await base(table)
    .select({
      filterByFormula: `RECORD_ID() = "${id}"`,
      fields: [champ],
      maxRecords: 1,
    })
    .firstPage();

  return (records[0]?.get(champ) as string) || "";
}

export async function creerReleve(releve: NouveauReleve) {
  // Airtable affiche le champ principal partout où un relevé est référencé
  // (liens, notifications, vues). On y recopie donc un libellé lisible
  // « Intervenante — Client — Date », les identifiants seuls étant illisibles.
  const [nomIntervenante, nomClient] = await Promise.all([
    lireChamp(TABLES.intervenants, releve.intervenantId, "Nom et Prenom"),
    lireChamp(TABLES.clients, releve.clientId, "Nom"),
  ]);

  const recapitulatif = [
    nomIntervenante,
    nomClient,
    formatDateFr(releve.date),
  ]
    .filter(Boolean)
    .join(" — ");

  const record = await base(TABLES.releves).create({
    Recapitulatif: recapitulatif,
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

export type NouveauLead = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  besoins?: string[];
  creneaux?: string[];
  message?: string;
};

export async function creerLead(lead: NouveauLead) {
  const record = await base(TABLES.leads).create({
    Nom: lead.nom,
    Prénom: lead.prenom,
    Téléphone: lead.telephone,
    Email: lead.email,
    Adresse: lead.adresse || "",
    Ville: lead.ville || "",
    "Code postal": lead.codePostal || "",
    Besoins: lead.besoins || [],
    Créneaux: lead.creneaux || [],
    Message: lead.message || "",
  });

  return record.id;
}

export type Releve = {
  id: string;
  date: string;
  clientId: string;
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
        clientId: clientIds[0] || "",
        clientNom: clientsParId.get(clientIds[0]) || "Client inconnu",
        heureArrivee: (r.get("Heure d'arrivee") as string) || "",
        heureDepart: (r.get("Heure de depart") as string) || "",
        heuresRealisees: (r.get("Heures realisees") as number) || 0,
        commentaire: (r.get("Commentaire") as string) || "",
      };
    });
}

export type InterventionFamille = {
  id: string;
  date: string;
  intervenante: string;
  heureArrivee: string;
  heureDepart: string;
  heures: number;
};

export type Famille = {
  id: string;
  nom: string;
  adresse: string;
  heuresMois: number;
  intervenantes: string[];
  interventions: InterventionFamille[];
};

/**
 * Les familles dont `referentId` est le référent, avec leur activité récente.
 *
 * Avec `accesComplet`, toutes les familles sont renvoyées : c'est le cas du
 * compte de direction, qui suit l'activité de l'ensemble des clients.
 *
 * Ne couvre que le passé : la base ne contient aucune intervention planifiée,
 * seulement les relevés saisis après coup.
 */
export async function getFamillesDuReferent(
  referentId: string,
  maintenant = new Date(),
  accesComplet = false
): Promise<Famille[]> {
  const [clientRecords, releveRecords, intervenantRecords] = await Promise.all([
    base(TABLES.clients).select({ sort: [{ field: "Nom", direction: "asc" }] }).all(),
    base(TABLES.releves).select({ sort: [{ field: "Date", direction: "desc" }] }).all(),
    base(TABLES.intervenants).select().all(),
  ]);

  const nomsIntervenantes = new Map(
    intervenantRecords.map((i) => [
      i.id,
      (i.get("Nom et Prenom") as string) || "Intervenante inconnue",
    ])
  );

  const miennes = accesComplet
    ? clientRecords
    : clientRecords.filter((c) =>
        (
          (c.get("Referent famille") as string[] | undefined) || []
        ).includes(referentId)
      );

  return miennes.map((client) => {
    const siens = releveRecords.filter((r) =>
      ((r.get("Client") as string[] | undefined) || []).includes(client.id)
    );

    let heuresMois = 0;
    const intervenantes = new Set<string>();

    for (const r of siens) {
      const date = new Date((r.get("Date") as string) || "");
      if (Number.isNaN(date.getTime())) continue;

      const nom = nomsIntervenantes.get(
        ((r.get("Intervenant") as string[]) || [])[0] || ""
      );
      if (nom) intervenantes.add(nom);

      if (
        date.getFullYear() === maintenant.getFullYear() &&
        date.getMonth() === maintenant.getMonth()
      ) {
        heuresMois += (r.get("Heures realisees") as number) || 0;
      }
    }

    return {
      id: client.id,
      nom: (client.get("Nom") as string) || "",
      adresse: (client.get("Adresse") as string) || "",
      heuresMois: Math.round(heuresMois * 100) / 100,
      intervenantes: [...intervenantes].sort(),
      interventions: siens.slice(0, 5).map((r) => ({
        id: r.id,
        date: (r.get("Date") as string) || "",
        intervenante:
          nomsIntervenantes.get(((r.get("Intervenant") as string[]) || [])[0] || "") ||
          "Intervenante inconnue",
        heureArrivee: (r.get("Heure d'arrivee") as string) || "",
        heureDepart: (r.get("Heure de depart") as string) || "",
        heures: (r.get("Heures realisees") as number) || 0,
      })),
    };
  });
}

export type InterventionAdmin = {
  id: string;
  date: string;
  intervenante: string;
  client: string;
  heureArrivee: string;
  heureDepart: string;
  heures: number;
};

export type StatsAdmin = {
  interventionsJour: InterventionAdmin[];
  nombreSemaine: number;
  heuresSemaine: number;
  caMois: number;
  intervenantesActives: number;
};

/** Début du lundi de la semaine contenant `date`, à minuit. */
function debutDeSemaine(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay() renvoie 0 pour dimanche : on le ramène en fin de semaine.
  const decalage = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - decalage);
  return d;
}

function memeJour(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Vue de direction : agrège les relevés de toutes les intervenantes.
 * Le chiffre d'affaires dépend du TauxHoraire propre à chacune, d'où la
 * table des taux construite en amont.
 */
export async function getStatsAdmin(maintenant = new Date()): Promise<StatsAdmin> {
  const [releveRecords, intervenantRecords, clientRecords] = await Promise.all([
    base(TABLES.releves)
      .select({ sort: [{ field: "Date", direction: "desc" }] })
      .all(),
    base(TABLES.intervenants).select().all(),
    base(TABLES.clients).select().all(),
  ]);

  const intervenantes = new Map(
    intervenantRecords.map((i) => [
      i.id,
      {
        nom: (i.get("Nom et Prenom") as string) || "Intervenante inconnue",
        taux: (i.get("TauxHoraire") as number) || 0,
      },
    ])
  );
  const clients = new Map(
    clientRecords.map((c) => [c.id, (c.get("Nom") as string) || ""])
  );

  const lundi = debutDeSemaine(maintenant);
  const interventionsJour: InterventionAdmin[] = [];
  let nombreSemaine = 0;
  let heuresSemaine = 0;
  let caMois = 0;

  for (const r of releveRecords) {
    const dateIso = (r.get("Date") as string) || "";
    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) continue;

    const heures = (r.get("Heures realisees") as number) || 0;
    const intervenanteId = ((r.get("Intervenant") as string[]) || [])[0] || "";
    const intervenante = intervenantes.get(intervenanteId);

    if (
      date.getFullYear() === maintenant.getFullYear() &&
      date.getMonth() === maintenant.getMonth()
    ) {
      caMois += heures * (intervenante?.taux || 0);
    }

    if (date >= lundi) {
      nombreSemaine += 1;
      heuresSemaine += heures;
    }

    if (memeJour(date, maintenant)) {
      interventionsJour.push({
        id: r.id,
        date: dateIso,
        intervenante: intervenante?.nom || "Intervenante inconnue",
        client: clients.get(((r.get("Client") as string[]) || [])[0]) || "Client inconnu",
        heureArrivee: (r.get("Heure d'arrivee") as string) || "",
        heureDepart: (r.get("Heure de depart") as string) || "",
        heures,
      });
    }
  }

  return {
    interventionsJour: interventionsJour.sort((a, b) =>
      a.heureArrivee.localeCompare(b.heureArrivee)
    ),
    nombreSemaine,
    heuresSemaine: Math.round(heuresSemaine * 100) / 100,
    caMois: Math.round(caMois * 100) / 100,
    // Les référents partagent la table Equipe avec les intervenantes : sans ce
    // filtre, ils gonfleraient le décompte sans intervenir chez personne.
    intervenantesActives: intervenantRecords.filter(
      (i) => Boolean(i.get("Actif"))
    ).length,
  };
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
  tauxHoraire: number,
  refDate: Date = new Date()
): StatsMensuelles {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();

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

export { calculerStatsMensuelles };

export type FicheDePaie = {
  id: string;
  mois: string;
  fichierUrl: string;
  fichierNom: string;
};

export async function getFichesDePaieByIntervenant(
  intervenantId: string
): Promise<FicheDePaie[]> {
  // Seules les fiches marquées "Publiee" sont visibles : la direction peut
  // déposer les PDF au fil de l'eau puis les publier quand tout est prêt.
  const records = await base(TABLES.fichesDePaie)
    .select({
      filterByFormula: `{Publiee} = 1`,
      sort: [{ field: "Mois", direction: "desc" }],
    })
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
