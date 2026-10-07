import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { reinitialiserMotDePasse } from "@/lib/airtable";
import { isDemoMode } from "@/lib/demo";
import { LONGUEUR_MIN_MOT_DE_PASSE } from "@/lib/mot-de-passe";

export async function POST(request: Request) {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Reinitialisation indisponible en mode demo" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { email, motDePasse } = body as {
    email?: string;
    motDePasse?: string;
  };

  if (!email || !motDePasse) {
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
    const reinitialise = await reinitialiserMotDePasse(email.trim(), hash);

    if (!reinitialise) {
      // Adresse inconnue ou compte desactive : meme message, pour ne pas
      // reveler quels comptes existent.
      return NextResponse.json(
        {
          error:
            "Cette adresse ne permet pas de reinitialiser un mot de passe. Contactez Caparel.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur lors de la reinitialisation:", error);
    return NextResponse.json(
      { error: "Impossible de reinitialiser le mot de passe" },
      { status: 500 }
    );
  }
}
