import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploaderPhotoIntervenant } from "@/lib/airtable";
import { isDemoMode } from "@/lib/demo";

const TAILLE_MAX = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Modification de la photo indisponible en mode demo" },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const fichier = formData.get("photo");

  if (!(fichier instanceof File)) {
    return NextResponse.json({ error: "Aucune image recue" }, { status: 400 });
  }

  if (!fichier.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Le fichier doit etre une image" },
      { status: 400 }
    );
  }

  if (fichier.size > TAILLE_MAX) {
    return NextResponse.json(
      { error: "Image trop lourde (5 Mo maximum)" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await fichier.arrayBuffer());
    const url = await uploaderPhotoIntervenant(session.user.id, {
      base64: buffer.toString("base64"),
      contentType: fichier.type,
      filename: fichier.name || "photo.jpg",
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la photo:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer la photo" },
      { status: 500 }
    );
  }
}
