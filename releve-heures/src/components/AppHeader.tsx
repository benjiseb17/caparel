import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Onglet = "accueil" | "familles";

type Lien = { href: string; label: string; key: Onglet };

// L'en-tête d'origine ne sert plus qu'à l'espace référent, seul à ne pas avoir
// encore de maquette. Les espaces intervenante et famille passent par
// `components/charte/Header`.
const LIENS: Lien[] = [
  { href: "/", label: "Accueil", key: "accueil" },
  { href: "/familles", label: "Mes familles", key: "familles" },
];

export default function AppHeader({ active }: { active: Onglet }) {
  const liens = LIENS;

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-8 py-3 sm:py-4 gap-2 sm:gap-3 border-b border-line bg-soft">
      <div className="flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src="/caparel-logo.png"
            alt="Caparel"
            width={1872}
            height={562}
            className="w-32 sm:w-40 h-auto"
            priority
          />
        </Link>
        <div className="sm:hidden">
          <LogoutButton />
        </div>
      </div>
      {/* Aligné à gauche et non centré : centrer rognerait les onglets des
          deux côtés en cas de débordement, et le passage à la ligne évite
          d'en masquer un hors écran. */}
      <nav className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 sm:gap-x-5">
        {liens.map((lien) => (
          <Link
            key={lien.key}
            href={lien.href}
            className={`text-[13px] sm:text-sm font-medium whitespace-nowrap transition-colors ${
              active === lien.key ? "text-navy" : "text-muted hover:text-navy"
            }`}
          >
            {lien.label}
          </Link>
        ))}
        <div className="hidden sm:block">
          <LogoutButton />
        </div>
      </nav>
    </header>
  );
}
