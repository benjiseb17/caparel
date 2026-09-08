import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getActiveClients } from "@/lib/airtable";
import { isDemoMode, DEMO_CLIENTS } from "@/lib/demo";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const clients = isDemoMode() ? DEMO_CLIENTS : await getActiveClients();
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Erreur lors de la recuperation des clients:", error);
    return NextResponse.json(
      { error: "Impossible de recuperer les clients" },
      { status: 500 }
    );
  }
}
