import Link from "next/link";
import Header from "@/components/charte/Header";
import Icone from "@/components/charte/Icone";
import BlocDirection from "@/components/referent/BlocDirection";
import { NAV_REFERENT } from "@/lib/navigation";
import type { StatsAdmin } from "@/lib/airtable";
import { initialesDe } from "@/lib/format";

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
    <div className="cp-root">
      <Header liens={NAV_REFERENT} actif="/" />

      <main className="cp-container a-main">
        <section className="a-hero">
          <div className="a-hero__who">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="a-hero__photo"
                src={photoUrl}
                alt=""
                aria-hidden="true"
              />
            ) : (
              <span
                className="cp-avatar cp-avatar--lg cp-avatar--teal"
                aria-hidden="true"
              >
                {initialesDe(nomComplet)}
              </span>
            )}
            <div>
              <p className="a-hero__hello">Bonjour,</p>
              <h1 className="a-hero__name">{nomComplet}</h1>
              <p className="a-hero__intro">
                Voici l&apos;activité de Caparel aujourd&apos;hui.
              </p>
            </div>
          </div>

          <Link
            className="cp-btn cp-btn--outline"
            href="/familles"
            style={{ position: "relative", zIndex: 1 }}
          >
            <Icone nom="user" taille="sm" />
            Mes familles
          </Link>
        </section>

        <BlocDirection stats={stats} jour={jour} />
      </main>
    </div>
  );
}
