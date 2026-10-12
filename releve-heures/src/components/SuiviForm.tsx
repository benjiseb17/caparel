"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatDateFr, formatHeures } from "@/lib/format";
import type { InterventionVueFamille } from "@/lib/airtable";

export default function SuiviForm({
  interventions,
}: {
  interventions: InterventionVueFamille[];
}) {
  const router = useRouter();
  const [releveId, setReleveId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!message.trim()) {
      setError("Merci d'écrire votre message avant d'envoyer.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/suivi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, releveId: releveId || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setMessage("");
      setReleveId("");
      setSuccess("Votre message a bien été transmis à l'équipe Caparel.");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-line p-5 sm:p-6 space-y-4"
    >
      <div>
        <label
          htmlFor="intervention"
          className="block text-sm font-medium text-ink mb-1"
        >
          Intervention concernée{" "}
          <span className="text-muted font-normal">(optionnel)</span>
        </label>
        <select
          id="intervention"
          value={releveId}
          onChange={(e) => setReleveId(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">Remarque générale</option>
          {interventions.map((i) => (
            <option key={i.id} value={i.id}>
              {formatDateFr(i.date)} · {i.intervenante} ·{" "}
              {formatHeures(i.heures)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-ink mb-1"
        >
          Votre message
        </label>
        <textarea
          id="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Un besoin, une remarque, un changement d'habitude à signaler…"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal resize-none"
        />
      </div>

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
        {submitting ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
