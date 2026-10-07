import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  creerReleve,
  getIntervenantById,
  getRelevesByIntervenant,
} from "@/lib/airtable";
import { isDemoMode, addDemoReleve, getDemoReleves } from "@/lib/demo";
import { calculerHeures, dateSaisissable } from "@/lib/heures";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const releves = isDemoMode()
      ? await getDemoReleves()
      : await getRelevesByIntervenant(session.user.id);

    return NextResponse.json({ releves });
  } catch (error) {
    console.error("Erreur lors de la recuperation des releves:", error);
    return NextResponse.json(
      { error: "Impossible de recuperer l'historique" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  // Un référent ne figure pas dans la table Intervenants : un relevé à son nom
  // serait refusé par Airtable. On le dit clairement plutôt que de laisser
  // remonter une erreur 500.
  if (!isDemoMode() && (await getIntervenantById(session.user.id))?.referent) {
    return NextResponse.json(
      { error: "Les référents ne saisissent pas de relevés d'heures." },
      { status: 403 }
    );
  }

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

  // Une intervention se saisit après coup : une date future signalerait une
  // erreur de saisie, ou une tentative de déclarer des heures non effectuées.
  if (!dateSaisissable(date)) {
    return NextResponse.json(
      {
        error:
          "Cette date n'est pas encore arrivée. Un relevé s'enregistre une fois l'intervention terminée.",
      },
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

  const nouveauReleve = {
    intervenantId: session.user.id,
    clientId,
    date,
    heureArrivee,
    heureDepart,
    heuresRealisees,
    commentaire,
    certifie,
  };

  try {
    const id = isDemoMode()
      ? await addDemoReleve(nouveauReleve)
      : await creerReleve(nouveauReleve);

    return NextResponse.json({ id, heuresRealisees }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la creation du releve:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer le releve" },
      { status: 500 }
    );
  }
}
