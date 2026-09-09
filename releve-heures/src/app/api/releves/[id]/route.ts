import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProprietaireReleve, modifierReleve } from "@/lib/airtable";
import {
  isDemoMode,
  demoReleveExiste,
  modifierDemoReleve,
} from "@/lib/demo";
import { calculerHeures } from "@/lib/heures";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { id } = await context.params;

  const body = await request.json();
  const { clientId, date, heureArrivee, heureDepart, commentaire, certifie } =
    body as {
      clientId?: string;
      date?: string;
      heureArrivee?: string;
      heureDepart?: string;
      commentaire?: string;
      certifie?: boolean;
    };

  if (!clientId || !date || !heureArrivee || !heureDepart) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 }
    );
  }

  if (!certifie) {
    return NextResponse.json(
      { error: "Vous devez certifier l'exactitude des informations." },
      { status: 400 }
    );
  }

  const heuresRealisees = calculerHeures(heureArrivee, heureDepart);
  if (heuresRealisees === null || heuresRealisees <= 0) {
    return NextResponse.json(
      { error: "Heures d'arrivee/depart invalides" },
      { status: 400 }
    );
  }

  const modification = {
    clientId,
    date,
    heureArrivee,
    heureDepart,
    heuresRealisees,
    commentaire,
    certifie,
  };

  try {
    if (isDemoMode()) {
      const existe = await demoReleveExiste(id);
      if (!existe) {
        return NextResponse.json({ error: "Relevé introuvable" }, { status: 404 });
      }
      await modifierDemoReleve(id, modification);
    } else {
      const proprietaireId = await getProprietaireReleve(id);
      if (!proprietaireId) {
        return NextResponse.json({ error: "Relevé introuvable" }, { status: 404 });
      }
      if (proprietaireId !== session.user.id) {
        return NextResponse.json({ error: "Non autorise" }, { status: 403 });
      }
      await modifierReleve(id, modification);
    }

    return NextResponse.json({ id, heuresRealisees });
  } catch (error) {
    console.error("Erreur lors de la modification du releve:", error);
    return NextResponse.json(
      { error: "Impossible de modifier le releve" },
      { status: 500 }
    );
  }
}
