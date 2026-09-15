import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { activerCompteIntervenant } from "@/lib/airtable";
import { isDemoMode } from "@/lib/demo";

export const LONGUEUR_MIN_MOT_DE_PASSE = 8;

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Activation indisponible en mode demo" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { email, code, motDePasse } = body as {
    email?: string;
    code?: string;
    motDePasse?: string;
  };

  if (!email || !code || !motDePasse) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 }
    );
  }

  if (motDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
    return NextResponse.json(
      {
        error: `Le mot de passe doit faire au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caracteres.`,
      },
      { status: 400 }
    );
  }

  try {
    const hash = bcrypt.hashSync(motDePasse, 10);
    const active = await activerCompteIntervenant(email.trim(), code.trim(), hash);

    if (!active) {
      // Message volontairement vague : ne pas reveler quels emails existent.
      return NextResponse.json(
        { error: "Email ou code d'activation invalide." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur lors de l'activation du compte:", error);
    return NextResponse.json(
      { error: "Impossible de definir le mot de passe" },
      { status: 500 }
    );
  }
}
