import { NextResponse } from "next/server";
import { creerLead } from "@/lib/airtable";

// Route publique (pas d'auth) appelée depuis le site vitrine statique
// (benjiseb17.github.io/caparel), qui ne peut pas garder de secret côté
// client. Le token Airtable reste ici, côté serveur.
const ALLOWED_ORIGIN = "https://benjiseb17.github.io";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
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
      { status: 400, headers: corsHeaders() }
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
    return NextResponse.json({ ok: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error("Erreur lors de la creation du lead:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
