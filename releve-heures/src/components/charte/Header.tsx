"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Icone, { type NomIcone } from "@/components/charte/Icone";

export type LienCharte = {
  href: string;
  label: string;
  icone: NomIcone;
};

/**
 * L'en-tête de la charte Caparel : logo, navigation, déconnexion, et menu
 * repliable sous 640 px.
 *
 * Les liens sont fournis par l'appelant : chaque espace a les siens, mais tous
 * partagent la même barre.
 */
export default function Header({
  liens,
  actif,
}: {
  liens: LienCharte[];
  /** Le `href` du lien à marquer comme page courante. */
  actif: string;
}) {
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
          <Icone nom="menu" />
        </button>

        <nav
          className={`a-nav${ouvert ? " is-open" : ""}`}
          id="nav-principale"
          aria-label="Navigation principale"
        >
          {liens.map((lien) => (
            <Link
              key={lien.href}
              className="a-nav__link"
              href={lien.href}
              aria-current={actif === lien.href ? "page" : undefined}
              onClick={() => setOuvert(false)}
            >
              <Icone nom={lien.icone} taille="sm" />
              {lien.label}
            </Link>
          ))}
          <button
            className="a-nav__link a-nav__link--bouton"
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <Icone nom="logout" taille="sm" />
            Se déconnecter
          </button>
        </nav>
      </div>
    </header>
  );
}
