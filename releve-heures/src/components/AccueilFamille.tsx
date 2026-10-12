import Image from "next/image";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import type { EspaceFamille, Suivi } from "@/lib/airtable";
import { formatHeures, formatDateFr, initialesDe } from "@/lib/format";

const MOIS_LABEL = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

const HORODATAGE = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

function formatHorodatage(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : HORODATAGE.format(d);
}

/** Au-delà, la liste complète est dans l'onglet Suivi. */
const REMARQUES_AFFICHEES = 3;

export default function AccueilFamille({
  nomClient,
  espace,
  suivis,
  mois,
}: {
  nomClient: string;
  espace: EspaceFamille;
  suivis: Suivi[];
  mois: Date;
}) {
  const dateParReleve = new Map(espace.interventions.map((i) => [i.id, i.date]));
  const recentes = suivis.slice(0, REMARQUES_AFFICHEES);

  return (
    <div className="min-h-screen bg-soft flex flex-col overflow-x-hidden">
      <AppHeader active="accueil" />
      <main className="flex-1 flex flex-col items-center px-5 sm:px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-2 sm:pt-8">
        <div className="w-full max-w-md lg:max-w-3xl space-y-4">
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
              <div className="w-16 h-16 rounded-full bg-navylogo text-white flex items-center justify-center font-heading font-bold text-lg shrink-0">
                {initialesDe(nomClient)}
              </div>
              <div>
                <p className="text-sm text-muted">Bonjour</p>
                <h1 className="font-heading text-sm font-bold text-ink">
                  {nomClient}
                </h1>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-line p-6">
            <p className="text-sm text-muted capitalize text-center mb-4">
              {MOIS_LABEL.format(mois)}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-heading text-2xl font-bold text-navy">
                  {formatHeures(espace.heuresMois)}
                </p>
                <p className="text-xs text-muted">Heures d&apos;intervention</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-bold text-teal-dark">
                  {espace.montantMois.toLocaleString("fr-FR")} €
                </p>
                <p className="text-xs text-muted">Montant du mois</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <h2 className="text-sm font-medium text-muted">Vos remarques</h2>
              <Link
                href="/suivi"
                className="text-xs font-medium text-teal-dark hover:text-teal underline underline-offset-2"
              >
                {suivis.length > 0 ? "Tout voir" : "En écrire une"}
              </Link>
            </div>

            {recentes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-line p-6 text-center">
                <p className="text-sm text-muted">
                  Vous n&apos;avez encore envoyé aucune remarque à Caparel.
                </p>
              </div>
            ) : (
              <ul className="bg-white rounded-2xl border border-line divide-y divide-line overflow-hidden">
                {recentes.map((s) => (
                  <li key={s.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-xs text-muted">
                        {formatHorodatage(s.ecritLe)}
                        {s.releveId && dateParReleve.has(s.releveId) && (
                          <>
                            {" · intervention du "}
                            {formatDateFr(dateParReleve.get(s.releveId) || "")}
                          </>
                        )}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          s.traite
                            ? "bg-soft-2 text-teal-dark"
                            : "bg-soft text-muted"
                        }`}
                      >
                        {s.traite ? "Pris en compte" : "Transmis"}
                      </span>
                    </div>
                    <p className="text-sm text-ink whitespace-pre-line line-clamp-3">
                      {s.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {suivis.length > REMARQUES_AFFICHEES && (
              <p className="text-xs text-muted mt-2 text-center">
                {suivis.length - REMARQUES_AFFICHEES === 1
                  ? "1 remarque plus ancienne dans l'onglet Suivi."
                  : `${suivis.length - REMARQUES_AFFICHEES} remarques plus anciennes dans l'onglet Suivi.`}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-sm font-medium text-muted mb-2">
              Dernières interventions
            </h2>

            {espace.interventions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-line p-6 text-center">
                <p className="text-sm text-muted">
                  Aucune intervention enregistrée pour le moment.
                </p>
              </div>
            ) : (
              <ul className="bg-white rounded-2xl border border-line divide-y divide-line overflow-hidden">
                {espace.interventions.map((i) => (
                  <li key={i.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">
                          {i.intervenante}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {formatDateFr(i.date)} · {i.heureArrivee} -{" "}
                          {i.heureDepart}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-ink">
                          {formatHeures(i.heures)}
                        </p>
                        <p className="text-xs text-teal-dark">
                          {i.montant.toLocaleString("fr-FR")} €
                        </p>
                      </div>
                    </div>

                    {i.motPourLaFamille && (
                      <p className="mt-3 rounded-lg bg-soft-2 px-3 py-2 text-sm text-ink whitespace-pre-line">
                        {i.motPourLaFamille}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
