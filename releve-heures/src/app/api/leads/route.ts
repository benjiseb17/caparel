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
  const { nom, prenom, telephone, email, besoins, message, societe } =
    (body || {}) as {
      nom?: string;
      prenom?: string;
      telephone?: string;
      email?: string;
      besoins?: string;
      message?: string;
      societe?: string; // champ piège anti-bot, doit rester vide
    };

  // Honeypot : un humain ne remplit jamais ce champ (masqué en CSS côté site).
  // On répond succès sans rien enregistrer pour ne pas alerter le bot.
  if (societe) {
    return NextResponse.json({ ok: true }, { headers: corsHeaders() });
  }

  if (!nom || !prenom || !telephone || !email) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    await creerLead({ nom, prenom, telephone, email, besoins, message });
    return NextResponse.json({ ok: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error("Erreur lors de la creation du lead:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
