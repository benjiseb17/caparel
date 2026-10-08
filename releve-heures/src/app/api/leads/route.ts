import { NextResponse } from "next/server";
import { creerLead } from "@/lib/airtable";
import { corsHeaders } from "@/lib/cors";

// Route publique (pas d'auth) appelée depuis le site vitrine statique, qui
// ne peut pas garder de secret côté client. Le token Airtable reste ici,
// côté serveur.
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
    adresse,
    ville,
    codePostal,
    besoins,
    creneaux,
    message,
    hp_check_7f2a,
  } = (body || {}) as {
    nom?: string;
    prenom?: string;
    telephone?: string;
    email?: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
    besoins?: string[];
    creneaux?: string[];
    message?: string;
    hp_check_7f2a?: string; // champ piège anti-bot, doit rester vide
  };

  if (!nom || !prenom || !telephone || !email) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400, headers }
    );
  }

  // Honeypot : un humain ne remplit normalement jamais ce champ caché, mais
  // l'autofill de certains navigateurs (Chrome notamment) peut le declencher
  // par erreur. Pour ne jamais perdre un vrai lead a cause d'un faux positif,
  // on enregistre quand meme la demande, juste marquee comme suspecte pour
  // verification manuelle au lieu d'etre ignoree silencieusement.
  const suspect = Boolean(hp_check_7f2a);
  const messageAvecFlag = suspect
    ? `[A VERIFIER - piege anti-bot declenche, probablement un faux positif d'autofill]\n${message || ""}`
    : message;

  try {
    await creerLead({
      nom,
      prenom,
      telephone,
      email,
      adresse,
      ville,
      codePostal,
      besoins,
      creneaux,
      message: messageAvecFlag,
    });
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    console.error("Erreur lors de la creation du lead:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande" },
      { status: 500, headers }
    );
  }
}
