"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import IconeFamille from "@/components/famille/IconeFamille";

export type OngletFamille = "accueil" | "suivi";

const LIENS: { href: string; label: string; cle: OngletFamille }[] = [
  { href: "/", label: "Accueil", cle: "accueil" },
  { href: "/suivi", label: "Suivi", cle: "suivi" },
];

export default function HeaderFamille({ actif }: { actif: OngletFamille }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <header className="a-header">
      <div className="cp-container a-header__inner">
        <Link className="cp-logo" href="/" aria-label="Caparel, accueil">
          <Image
            className="cp-logo__img"
            src="/caparel-logo.png"
            alt="Caparel — Aide à domicile aux personnes âgées"
            width={1872}
            height={562}
            priority
          />
        </Link>

        <button
          className="a-menu-btn"
          type="button"
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={ouvert}
          aria-controls="nav-principale"
          onClick={() => setOuvert((o) => !o)}
        >
          <IconeFamille nom="menu" />
        </button>

        <nav
          className={`a-nav${ouvert ? " is-open" : ""}`}
          id="nav-principale"
          aria-label="Navigation principale"
        >
          {LIENS.map((lien) => (
            <Link
              key={lien.cle}
              className="a-nav__link"
              href={lien.href}
              aria-current={actif === lien.cle ? "page" : undefined}
              onClick={() => setOuvert(false)}
            >
              <IconeFamille nom={lien.cle === "accueil" ? "home" : "suivi"} taille="sm" />
              {lien.label}
            </Link>
          ))}
          <button
            className="a-nav__link"
            type="button"
            style={{ border: 0, background: "transparent" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <IconeFamille nom="logout" taille="sm" />
            Se déconnecter
          </button>
        </nav>
      </div>
    </header>
  );
}
