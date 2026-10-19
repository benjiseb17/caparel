import { NextResponse } from "next/server";
import {
  ajouterPieceJointeCandidature,
  creerCandidature,
} from "@/lib/airtable";
import { corsHeaders } from "@/lib/cors";

// Route publique (pas d'auth) appelée depuis la page Recrutement du site
// vitrine statique. Le token Airtable reste ici, côté serveur.
// Accepte du JSON (sans fichier) ou du multipart/form-data (avec photo et CV).
const METHODS = "POST, OPTIONS";

// Vercel limite le corps d'une requête à 4,5 Mo : on reste bien en dessous.
const MAX_PHOTO = 2 * 1024 * 1024;
const MAX_CV = 3 * 1024 * 1024;

type TypeFichier = { type: string; extension: string };

// Le type annoncé par le navigateur ne suffit pas : on vérifie aussi les
// premiers octets du fichier pour s'assurer que c'est bien ce qu'il prétend.
function detecterType(octets: Buffer): TypeFichier | null {
  const debut = (...codes: number[]) =>
    codes.every((c, i) => octets[i] === c);
  if (debut(0xff, 0xd8, 0xff)) return { type: "image/jpeg", extension: "jpg" };
  if (debut(0x89, 0x50, 0x4e, 0x47)) return { type: "image/png", extension: "png" };
  if (
    debut(0x52, 0x49, 0x46, 0x46) &&
    octets.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { type: "image/webp", extension: "webp" };
  }
  if (debut(0x25, 0x50, 0x44, 0x46)) return { type: "application/pdf", extension: "pdf" };
  if (debut(0xd0, 0xcf, 0x11, 0xe0)) return { type: "application/msword", extension: "doc" };
  if (debut(0x50, 0x4b, 0x03, 0x04)) {
    return {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: "docx",
    };
  }
  return null;
}

const TYPES_PHOTO = ["image/jpeg", "image/png", "image/webp"];
const TYPES_CV = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function nomSur(nom: string, extension: string) {
  const base = nom
    .replace(/\.[^.]*$/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "fichier"}.${extension}`;
}

async function lireFichier(
  valeur: FormDataEntryValue | null,
  typesAutorises: string[],
  tailleMax: number
) {
  if (!(valeur instanceof File) || valeur.size === 0) return null;
  if (valeur.size > tailleMax) throw new Error("taille");
  const contenu = Buffer.from(await valeur.arrayBuffer());
  const detecte = detecterType(contenu);
  if (!detecte || !typesAutorises.includes(detecte.type)) throw new Error("type");
  return { nom: nomSur(valeur.name, detecte.extension), type: detecte.type, contenu };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin"), METHODS),
  });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request.headers.get("origin"), METHODS);

  let champs: Record<string, unknown> = {};
  let formData: FormData | null = null;

  if ((request.headers.get("content-type") || "").includes("multipart/form-data")) {
    formData = await request.formData().catch(() => null);
    if (formData) {
      const texte = (nom: string) => String(formData!.get(nom) ?? "");
      champs = {
        nom: texte("nom"),
        prenom: texte("prenom"),
        telephone: texte("telephone"),
        email: texte("email"),
        ville: texte("ville"),
        diplome: texte("diplome"),
        experience: texte("experience"),
        disponibilites: formData.getAll("disponibilites").map(String),
        message: texte("message"),
        hp_check_7f2a: texte("hp_check_7f2a"),
      };
    }
  } else {
    champs = ((await request.json().catch(() => null)) || {}) as Record<string, unknown>;
  }

  const {
    nom,
    prenom,
    telephone,
    email,
    ville,
    diplome,
    experience,
    disponibilites,
    message,
    hp_check_7f2a, // champ piège anti-bot, doit rester vide
  } = champs as {
    nom?: string;
    prenom?: string;
    telephone?: string;
    email?: string;
    ville?: string;
    diplome?: string;
    experience?: string;
    disponibilites?: string[];
    message?: string;
    hp_check_7f2a?: string;
  };

  if (!nom || !prenom || !telephone || !email) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400, headers }
    );
  }

  // Fichiers : validés AVANT de créer la candidature, pour ne pas enregistrer
  // une ligne si un fichier est refusé (l'utilisateur peut corriger et renvoyer).
  let photo = null;
  let cv = null;
  try {
    photo = await lireFichier(formData?.get("photo") ?? null, TYPES_PHOTO, MAX_PHOTO);
    cv = await lireFichier(formData?.get("cv") ?? null, TYPES_CV, MAX_CV);
  } catch (error) {
    const taille = error instanceof Error && error.message === "taille";
    return NextResponse.json(
      {
        error: taille
          ? "Fichier trop volumineux (photo 2 Mo max, CV 3 Mo max)"
          : "Format de fichier non accepté (photo JPG/PNG/WebP, CV PDF/DOC/DOCX)",
      },
      { status: 400, headers }
    );
  }

  if (!photo) {
    return NextResponse.json(
      { error: "La photo est obligatoire" },
      { status: 400, headers }
    );
  }

  // Même logique que pour les leads : un faux positif d'autofill ne doit pas
  // faire perdre une vraie candidature, on l'enregistre en la marquant.
  const suspect = Boolean(hp_check_7f2a);
  const messageAvecFlag = suspect
    ? `[A VERIFIER - piege anti-bot declenche, probablement un faux positif d'autofill]\n${message || ""}`
    : message;

  let id: string;
  try {
    id = await creerCandidature({
      nom,
      prenom,
      telephone,
      email,
      ville,
      diplome,
      experience,
      disponibilites,
      message: messageAvecFlag,
    });
  } catch (error) {
    console.error("Erreur lors de la creation de la candidature:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la candidature" },
      { status: 500, headers }
    );
  }

  // La candidature est enregistrée : si un fichier échoue, on le signale sans
  // perdre le reste (le site invitera à renvoyer les fichiers par email).
  let piecesJointes = true;
  for (const [champ, fichier] of [
    ["photo", photo],
    ["cv", cv],
  ] as const) {
    if (!fichier) continue;
    try {
      await ajouterPieceJointeCandidature(id, champ, fichier);
    } catch (error) {
      piecesJointes = false;
      console.error(`Erreur d'envoi de la piece jointe ${champ}:`, error);
    }
  }

  return NextResponse.json({ ok: true, piecesJointes }, { headers });
}
