// Origines autorisées à appeler les routes publiques depuis le site vitrine
// statique (caparel.fr). github.io redirige déjà vers caparel.fr mais reste
// autorisé le temps de la transition.
export const ALLOWED_ORIGINS = [
  "https://caparel.fr",
  "https://www.caparel.fr",
  "https://benjiseb17.github.io",
];

export function corsHeaders(origin: string | null, methods: string) {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
