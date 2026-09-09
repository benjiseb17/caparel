import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Onglet = "accueil" | "saisie" | "historique";

const LIENS: { href: string; label: string; key: Onglet }[] = [
  { href: "/", label: "Accueil", key: "accueil" },
  { href: "/saisie", label: "Relevé d'heure", key: "saisie" },
  { href: "/historique", label: "Historique", key: "historique" },
];

export default function AppHeader({ active }: { active: Onglet }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-8 py-4 gap-3">
      <div className="flex items-center justify-between">
        <Image
          src="/caparel-logo.png"
          alt="Caparel"
          width={1872}
          height={562}
          className="w-24 sm:w-28 h-auto"
          priority
        />
        <div className="sm:hidden">
          <LogoutButton />
        </div>
      </div>
      <nav className="flex items-center gap-4 sm:gap-5 overflow-x-auto">
        {LIENS.map((lien) => (
          <Link
            key={lien.key}
            href={lien.href}
            className={`text-sm font-medium whitespace-nowrap transition-colors ${
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
