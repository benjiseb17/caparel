"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Icone from "@/components/charte/Icone";
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
    <form onSubmit={handleSubmit}>
      <div className="cp-field">
        <label className="cp-label" htmlFor="intervention">
          Intervention concernée{" "}
          <span className="cp-label__option">(optionnel)</span>
        </label>
        <select
          className="cp-select"
          id="intervention"
          value={releveId}
          onChange={(e) => setReleveId(e.target.value)}
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

      <div className="cp-field">
        <label className="cp-label" htmlFor="message">
          Votre message
        </label>
        <textarea
          className="cp-textarea"
          id="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Un besoin, une remarque, un changement d'habitude à signaler…"
        />
      </div>

      {error && (
        <p className="cp-error" role="alert">
          <Icone nom="alert" taille="sm" />
          {error}
        </p>
      )}
      {success && (
        <p className="cp-success" style={{ marginTop: "var(--cp-s-4)" }} role="status">
          <Icone nom="check" taille="sm" />
          {success}
        </p>
      )}

      <button
        className="cp-btn cp-btn--primary cp-btn--block"
        style={{ marginTop: "var(--cp-s-5)" }}
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
