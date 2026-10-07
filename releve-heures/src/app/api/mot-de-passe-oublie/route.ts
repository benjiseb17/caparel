import { NextResponse } from "next/server";
import { demanderReinitialisation } from "@/lib/airtable";
import { isDemoMode } from "@/lib/demo";

// Réponse unique, quelle que soit l'issue : dire « cette adresse est inconnue »
// transformerait la page en annuaire des comptes Caparel.
const REPONSE = {
  ok: true,
  message:
    "Si cette adresse correspond à un compte, la direction vient d'être prévenue. Elle vous recontactera pour réinitialiser votre accès.",
};

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json(REPONSE);
  }

  const body = await request.json();
  const { email } = body as { email?: string };

  if (!email) {
    return NextResponse.json({ error: "Email manquant" }, { status: 400 });
  }

  try {
    await demanderReinitialisation(email.trim());
  } catch (error) {
    // Une panne Airtable ne doit pas non plus distinguer les cas : on la trace
    // côté serveur sans rien en dire à la personne.
    console.error("Erreur lors de la demande de reinitialisation:", error);
  }

  return NextResponse.json(REPONSE);
}
