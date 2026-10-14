import { NextResponse } from "next/server";
import { creerCandidature } from "@/lib/airtable";
import { corsHeaders } from "@/lib/cors";

// Route publique (pas d'auth) appelée depuis la page Recrutement du site
// vitrine statique. Le token Airtable reste ici, côté serveur.
const METHODS = "POST, OPTIONS";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin"), METHODS),
  });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request.headers.get("origin"), METHODS);
  const body = await request.json().catch(() => null);
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
    hp_check_7f2a,
  } = (body || {}) as {
    nom?: string;
    prenom?: string;
    telephone?: string;
    email?: string;
    ville?: string;
    diplome?: string;
    experience?: string;
    disponibilites?: string[];
    message?: string;
    hp_check_7f2a?: string; // champ piège anti-bot, doit rester vide
  };

  if (!nom || !prenom || !telephone || !email) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400, headers }
    );
  }

  // Même logique que pour les leads : un faux positif d'autofill ne doit pas
  // faire perdre une vraie candidature, on l'enregistre en la marquant.
  const suspect = Boolean(hp_check_7f2a);
  const messageAvecFlag = suspect
    ? `[A VERIFIER - piege anti-bot declenche, probablement un faux positif d'autofill]\n${message || ""}`
    : message;

  try {
    await creerCandidature({
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
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    console.error("Erreur lors de la creation de la candidature:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la candidature" },
      { status: 500, headers }
    );
  }
}
