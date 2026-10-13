import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  creerSuivi,
  getCompteById,
  getInterventionsFamille,
} from "@/lib/airtable";
import { isDemoMode } from "@/lib/demo";

const LONGUEUR_MAX = 2000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Suivi indisponible en mode demo" },
      { status: 400 }
    );
  }

  // Seule une famille écrit dans son propre suivi, et l'autorisation est relue
  // depuis Airtable plutôt que prise dans le jeton de session.
  const profil = await getCompteById(session.user.id);
  if (profil?.role !== "famille") {
    return NextResponse.json(
      { error: "Reserve aux familles." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { message, releveId } = body as {
    message?: string;
    releveId?: string;
  };

  const texte = (message || "").trim();
  if (!texte) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }
  if (texte.length > LONGUEUR_MAX) {
    return NextResponse.json(
      { error: `Le message ne peut pas dépasser ${LONGUEUR_MAX} caractères.` },
      { status: 400 }
    );
  }

  // Un message peut viser une intervention précise — mais seulement parmi
  // celles de cette famille, sans quoi n'importe qui pourrait rattacher un
  // commentaire à l'intervention d'un autre client.
  if (releveId) {
    const interventions = await getInterventionsFamille(profil.id);
    if (!interventions.some((i) => i.id === releveId)) {
      return NextResponse.json(
        { error: "Intervention introuvable." },
        { status: 400 }
      );
    }
  }

  try {
    const id = await creerSuivi({
      clientId: profil.id,
      nomClient: profil.nomComplet,
      releveId,
      message: texte,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la creation du suivi:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer votre message" },
      { status: 500 }
    );
  }
}
