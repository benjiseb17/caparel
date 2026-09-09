"use client";

import { useMemo, useState, FormEvent } from "react";
import { formatHeures } from "@/lib/format";

type Client = {
  id: string;
  nom: string;
};

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function calculerHeures(heureArrivee: string, heureDepart: string): number | null {
  if (!heureArrivee || !heureDepart) return null;
  const [ha, ma] = heureArrivee.split(":").map(Number);
  const [hd, md] = heureDepart.split(":").map(Number);
  if ([ha, ma, hd, md].some((n) => Number.isNaN(n))) return null;

  const minutesArrivee = ha * 60 + ma;
  let minutesDepart = hd * 60 + md;
  if (minutesDepart < minutesArrivee) minutesDepart += 24 * 60;

  const minutes = minutesDepart - minutesArrivee;
  return Math.round((minutes / 60) * 100) / 100;
}

export default function ReleveForm({
  intervenantNom,
  clients,
}: {
  intervenantNom: string;
  clients: Client[];
}) {
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [heureArrivee, setHeureArrivee] = useState("");
  const [heureDepart, setHeureDepart] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [certifie, setCertifie] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const heuresRealisees = useMemo(
    () => calculerHeures(heureArrivee, heureDepart),
    [heureArrivee, heureDepart]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!clientId) {
      setError("Merci de sélectionner un client.");
      return;
    }
    if (heuresRealisees === null || heuresRealisees <= 0) {
      setError("Merci de renseigner une heure d'arrivée et de départ valides.");
      return;
    }
    if (!certifie) {
      setError("Merci de certifier l'exactitude des informations avant de valider.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/releves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          date,
          heureArrivee,
          heureDepart,
          commentaire,
          certifie,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setSuccess(
        `Relevé enregistré : ${formatHeures(data.heuresRealisees)} le ${date}. (ID : ${data.id})`
      );
      setHeureArrivee("");
      setHeureDepart("");
      setCommentaire("");
      setCertifie(false);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-line p-6 sm:p-8">
      <p className="text-sm text-muted mb-1">Bonjour</p>
      <h1 className="font-heading text-xl font-bold text-navy mb-6">
        {intervenantNom}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="client"
            className="block text-sm font-medium text-ink mb-1"
          >
            Client
          </label>
          <select
            id="client"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal disabled:bg-soft"
          >
            <option value="" disabled>
              Sélectionner un client
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-ink mb-1"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="arrivee"
              className="block text-sm font-medium text-ink mb-1"
            >
              Heure d&apos;arrivée
            </label>
            <input
              id="arrivee"
              type="time"
              required
              value={heureArrivee}
              onChange={(e) => setHeureArrivee(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <div>
            <label
              htmlFor="depart"
              className="block text-sm font-medium text-ink mb-1"
            >
              Heure de départ
            </label>
            <input
              id="depart"
              type="time"
              required
              value={heureDepart}
              onChange={(e) => setHeureDepart(e.target.value)}
              className="w-full min-w-0 rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>

        <div className="rounded-lg bg-soft-2 border border-line px-3 py-2.5 flex items-center justify-between">
          <span className="text-sm text-muted">Heures réalisées</span>
          <span className="font-heading text-sm font-bold text-teal-dark">
            {heuresRealisees !== null && heuresRealisees > 0
              ? formatHeures(heuresRealisees)
              : "—"}
          </span>
        </div>

        <div>
          <label
            htmlFor="commentaire"
            className="block text-sm font-medium text-ink mb-1"
          >
            Commentaire{" "}
            <span className="text-muted font-normal">(optionnel)</span>
          </label>
          <textarea
            id="commentaire"
            rows={2}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal resize-none"
          />
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={certifie}
            onChange={(e) => setCertifie(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-navylogo focus:ring-teal"
          />
          <span className="text-xs text-muted leading-relaxed">
            Je certifie sur l&apos;honneur l&apos;exactitude des informations
            et horaires renseignés ci-dessus, et je m&apos;engage à leur
            véracité.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-teal-dark" role="status">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-navylogo text-white text-sm font-medium py-2.5 hover:bg-navy-2 transition-colors disabled:opacity-60"
        >
          {submitting ? "Enregistrement..." : "Valider"}
        </button>
      </form>
    </div>
  );
}
