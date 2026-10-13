import Image from "next/image";
import AppHeader from "@/components/AppHeader";
import BlocDirection from "@/components/BlocDirection";
import type { StatsAdmin } from "@/lib/airtable";
import { initialesDe } from "@/lib/format";

/**
 * L'accueil des référents, dans l'habillage d'origine.
 *
 * L'espace référent n'a pas encore de maquette : il garde donc les couleurs et
 * les composants Tailwind de la première version, le temps qu'on la dessine.
 */
export default function AccueilReferent({
  nomComplet,
  photoUrl,
  stats,
  jour,
}: {
  nomComplet: string;
  photoUrl: string;
  stats: StatsAdmin;
  jour: Date;
}) {
  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="accueil" />
      <main className="flex-1 flex flex-col items-center px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-2 sm:pt-8">
        <div className="w-full max-w-md lg:max-w-4xl space-y-4">
          <div className="relative rounded-2xl border border-line bg-white p-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-navylogo via-teal to-teal-dark" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 h-full sm:h-[155%] aspect-square rounded-full bg-teal/10 flex items-center justify-center">
              <Image
                src="/caparel-icon.png"
                alt=""
                width={200}
                height={200}
                className="w-[49%] h-[49%] object-contain opacity-90 mix-blend-multiply pointer-events-none -translate-x-3"
                aria-hidden="true"
              />
            </div>
            <div className="relative flex items-center gap-4">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={nomComplet}
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-navylogo text-white flex items-center justify-center font-heading font-bold text-lg shrink-0">
                  {initialesDe(nomComplet)}
                </div>
              )}
              <div>
                <p className="text-sm text-muted">Bonjour</p>
                <h1 className="font-heading text-sm font-bold text-ink">
                  {nomComplet}
                </h1>
              </div>
            </div>
          </div>

          <BlocDirection stats={stats} jour={jour} />
        </div>
      </main>
    </div>
  );
}
