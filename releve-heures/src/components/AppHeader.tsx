import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "@/components/LogoutButton";

type Onglet = "accueil" | "saisie" | "historique" | "fiches" | "familles";

const LIENS: { href: string; label: string; key: Onglet }[] = [
  { href: "/", label: "Accueil", key: "accueil" },
  { href: "/saisie", label: "Relevé d'heure", key: "saisie" },
  { href: "/historique", label: "Historique", key: "historique" },
  { href: "/fiches-de-paie", label: "Fiches de paie", key: "fiches" },
];

const LIEN_FAMILLES = {
  href: "/familles",
  label: "Mes familles",
  key: "familles" as Onglet,
};

export default async function AppHeader({ active }: { active: Onglet }) {
  // Le jeton de session sert uniquement à décider de l'affichage de l'onglet,
  // ce qui évite un appel Airtable sur chaque page. L'accès à /familles est,
  // lui, vérifié contre Airtable : promouvoir quelqu'un demande une
  // reconnexion pour voir l'onglet, mais retirer le droit coupe l'accès
  // immédiatement.
  const session = await auth();
  const liens = session?.user?.admin ? [...LIENS, LIEN_FAMILLES] : LIENS;

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
