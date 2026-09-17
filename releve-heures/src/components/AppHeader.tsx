import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "@/components/LogoutButton";

type Onglet = "accueil" | "saisie" | "historique" | "fiches" | "admin";

const LIENS: { href: string; label: string; key: Onglet }[] = [
  { href: "/", label: "Accueil", key: "accueil" },
  { href: "/saisie", label: "Relevé d'heure", key: "saisie" },
  { href: "/historique", label: "Historique", key: "historique" },
  { href: "/fiches-de-paie", label: "Fiches de paie", key: "fiches" },
];

const LIEN_ADMIN = { href: "/admin", label: "Direction", key: "admin" as Onglet };

export default async function AppHeader({ active }: { active: Onglet }) {
  // L'onglet Direction s'affiche d'après le jeton de session, qui évite un
  // appel Airtable à chaque page. L'accès réel à /admin, lui, est vérifié
  // contre Airtable. Promouvoir quelqu'un exige donc une reconnexion pour
  // que l'onglet apparaisse, mais l'accès fonctionne immédiatement.
  const session = await auth();
  const liens = session?.user?.admin ? [...LIENS, LIEN_ADMIN] : LIENS;

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
      {/* Aligné à gauche et non centré : centrer rognerait les onglets des deux
          côtés en cas de débordement. Le passage à la ligne évite de masquer
          un onglet hors écran, ce qui arrive en mobile avec l'onglet
          Direction en plus. */}
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
