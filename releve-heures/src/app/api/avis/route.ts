import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

// Route publique appelée par le site vitrine (caparel.fr) pour afficher les
// avis Google dans un bandeau. La clé Google reste côté serveur. Les
// réponses sont mises en cache pour limiter les appels (et donc la facture).
const METHODS = "GET, OPTIONS";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const PLACES_BASE = "https://places.googleapis.com/v1";
// Identifiant de la fiche Google de Caparel (public, pas un secret). Une
// recherche par nom tombait sur un autre établissement, d'où l'ID fixe.
const PLACE_ID = process.env.GOOGLE_PLACE_ID || "ChIJB7YyA1LKp04RfnyoUXlpk6s";

type GoogleReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: { displayName?: string };
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GoogleReview[];
};

type AvisPayload = {
  nom: string;
  note: number | null;
  nombreAvis: number;
  lien: string | null;
  diag?: Record<string, unknown>;
  avis: {
    auteur: string;
    note: number;
    texte: string;
    date: string;
  }[];
};

const FIELDS =
  "id,displayName,rating,userRatingCount,googleMapsUri,reviews";

let cache: { at: number; data: AvisPayload } | null = null;

async function fetchPlace(apiKey: string, lang = "fr"): Promise<GooglePlace> {
  const res = await fetch(
    `${PLACES_BASE}/places/${encodeURIComponent(PLACE_ID)}${lang ? `?languageCode=${lang}` : ""}`,
    { headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": FIELDS } }
  );
  if (!res.ok) throw new Error(`Places details ${res.status}`);
  return (await res.json()) as GooglePlace;
}

function toPayload(place: GooglePlace): AvisPayload {
  const avis = (place.reviews || [])
    .map((r) => ({
      auteur: r.authorAttribution?.displayName || "Client Google",
      note: r.rating ?? 0,
      texte: (r.text?.text || r.originalText?.text || "").trim(),
      date: r.relativePublishTimeDescription || "",
      publie: r.publishTime ? Date.parse(r.publishTime) : 0,
    }))
    .filter((r) => r.texte.length > 0)
    .sort((a, b) => b.publie - a.publie)
    .map(({ publie, ...reste }) => {
      void publie;
      return reste;
    });

  return {
    nom: place.displayName?.text || "Caparel",
    note: place.rating ?? null,
    nombreAvis: place.userRatingCount ?? 0,
    lien: place.googleMapsUri ?? null,
    avis,
    diag: { recus: (place.reviews || []).length, avecTexte: avis.length, cles: Object.keys(place) },
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin"), METHODS),
  });
}

export async function GET(request: Request) {
  const headers = corsHeaders(request.headers.get("origin"), METHODS);
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Service d'avis non configure" },
      { status: 503, headers }
    );
  }

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: {
        ...headers,
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const place = await fetchPlace(apiKey);
    if (!place.displayName?.text?.toLowerCase().includes("caparel")) {
      console.error("Fiche Google inattendue:", place.displayName?.text);
      return NextResponse.json(
        { error: "Fiche inattendue" },
        { status: 404, headers }
      );
    }
    const data = toPayload(place);
    try {
      const alt = await fetchPlace(apiKey, "");
      data.diag = { ...data.diag, sansLangue: (alt.reviews || []).length, clesSansLangue: Object.keys(alt) };
    } catch (e) {
      data.diag = { ...data.diag, sansLangueErreur: String(e) };
    }
    cache = { at: Date.now(), data };
    return NextResponse.json(data, {
      headers: {
        ...headers,
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation des avis Google:", error);
    return NextResponse.json(
      { error: "Impossible de recuperer les avis" },
      { status: 502, headers }
    );
  }
}
