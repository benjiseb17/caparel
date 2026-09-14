import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { modifierProfilIntervenant } from "@/lib/airtable";
import { isDemoMode } from "@/lib/demo";

const TAILLE_MAX = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Modification du profil indisponible en mode demo" },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const email = formData.get("email");
  const telephone = formData.get("telephone");
  const certifie = formData.get("certifie");
  const photo = formData.get("photo");

  if (certifie !== "true") {
    return NextResponse.json(
      { error: "Vous devez certifier l'exactitude des informations." },
      { status: 400 }
    );
  }

  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json(
      { error: "L'email est requis." },
      { status: 400 }
    );
  }

  let fichierPhoto:
    | { base64: string; contentType: string; filename: string }
    | undefined;

  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit etre une image." },
        { status: 400 }
      );
    }
    if (photo.size > TAILLE_MAX) {
      return NextResponse.json(
        { error: "Image trop lourde (5 Mo maximum)." },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await photo.arrayBuffer());
    fichierPhoto = {
      base64: buffer.toString("base64"),
      contentType: photo.type,
      filename: photo.name || "photo.jpg",
    };
  }

  try {
    await modifierProfilIntervenant(session.user.id, {
      email: email.trim(),
      telephone: typeof telephone === "string" ? telephone.trim() : "",
      photo: fichierPhoto,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur lors de la mise a jour du profil:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer les modifications" },
      { status: 500 }
    );
  }
}
