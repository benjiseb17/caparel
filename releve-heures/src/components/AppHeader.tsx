import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader({ active }: { active: "saisie" | "historique" }) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-4">
      <Image
        src="/caparel-logo.png"
        alt="Caparel"
        width={1872}
        height={562}
        className="w-28 h-auto"
        priority
      />
      <nav className="flex items-center gap-5">
        <Link
          href="/"
          className={`text-sm font-medium transition-colors ${
            active === "saisie" ? "text-navy" : "text-muted hover:text-navy"
          }`}
        >
          Saisie
        </Link>
        <Link
          href="/historique"
          className={`text-sm font-medium transition-colors ${
            active === "historique" ? "text-navy" : "text-muted hover:text-navy"
          }`}
        >
          Historique
        </Link>
        <LogoutButton />
      </nav>
    </header>
  );
}
