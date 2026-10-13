"use client";

import { useMemo, useState, FormEvent } from "react";
import Icone from "@/components/charte/Icone";
import ChoixHeure from "@/components/intervenante/ChoixHeure";
import { formatDateFr, formatHeures } from "@/lib/format";
import { calculerHeures } from "@/lib/heures";

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

export default function ReleveForm({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState("");
  // Figé au premier rendu : la date du jour sert à la fois de valeur par défaut
  // et de borne supérieure, une intervention ne pouvant être saisie à l'avance.
  const [aujourdhui] = useState(todayIso);
  const [date, setDate] = useState(aujourdhui);
  const [heureArrivee, setHeureArrivee] = useState("");
  const [heureDepart, setHeureDepart] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [motPourLaFamille, setMotPourLaFamille] = useState("");
  const [certifie, setCertifie] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const heuresRealisees = useMemo(
    () => calculerHeures(heureArrivee, heureDepart),
    [heureArrivee, heureDepart]
  );

  // Les deux chaînes sont au format AAAA-MM-JJ : les comparer revient à
  // comparer les dates. Le champ est déjà borné par `max`, mais rien
  // n'empêche de saisir la date au clavier.
  const dateFuture = date > aujourdhui;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!clientId) {
      setError("Merci de sélectionner un client.");
      return;
    }
    if (dateFuture) {
      // Le message rouge sous le champ dit déjà tout : inutile d'en afficher
      // un second en bas du formulaire.
      return;
    }
    if (heuresRealisees === null || heuresRealisees <= 0) {
      setError("Merci de renseigner une heure d'arrivée et de départ valides.");
      return;
    }
    if (!certifie) {
      setError(
        "Merci de certifier l'exactitude des informations avant de valider."
      );
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
          motPourLaFamille,
          certifie,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setSuccess(
        `Relevé enregistré : ${formatHeures(data.heuresRealisees)} le ${formatDateFr(date)}.`
      );
      setHeureArrivee("");
      setHeureDepart("");
      setCommentaire("");
      setMotPourLaFamille("");
      setCertifie(false);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="cp-field">
        <label className="cp-label" htmlFor="client">
          Client
        </label>
        <select
          className="cp-select"
          id="client"
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
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

      <div className="cp-field">
        <label className="cp-label" htmlFor="date">
          Date
        </label>
        {/* Un label, pour que toucher n'importe où dans l'encart ouvre le
            sélecteur : le contrôle natif ne couvre pas toute sa hauteur. */}
        <label className={`cp-date${dateFuture ? " is-invalid" : ""}`}>
          <input
            id="date"
            type="date"
            required
            max={aujourdhui}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={dateFuture}
            aria-describedby={dateFuture ? "date-erreur" : undefined}
          />
        </label>
        {dateFuture && (
          <p className="cp-error" id="date-erreur" role="alert">
            <Icone nom="alert" taille="sm" />
            <span>
              Le {formatDateFr(date)} n&apos;est pas encore arrivé. Vous pourrez
              enregistrer ce relevé une fois l&apos;intervention terminée.
            </span>
          </p>
        )}
      </div>

      <ChoixHeure
        id="arrivee"
        label="Heure d'arrivée"
        value={heureArrivee}
        onChange={setHeureArrivee}
      />
      <ChoixHeure
        id="depart"
        label="Heure de départ"
        value={heureDepart}
        onChange={setHeureDepart}
      />

      <div className="cp-result" style={{ marginTop: "var(--cp-s-5)" }}>
        <span className="cp-result__label">Heures réalisées</span>
        <span className="cp-result__value">
          {heuresRealisees !== null && heuresRealisees > 0
            ? formatHeures(heuresRealisees)
            : "—"}
        </span>
      </div>

      <div className="cp-field">
        <label className="cp-label" htmlFor="commentaire">
          Commentaire <span className="cp-label__option">(optionnel)</span>
        </label>
        <textarea
          className="cp-textarea"
          id="commentaire"
          rows={2}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
        <p className="cp-hint">Interne à Caparel. La famille ne le voit pas.</p>
      </div>

      <div className="cp-field">
        <label className="cp-label" htmlFor="motPourLaFamille">
          Mot pour la famille{" "}
          <span className="cp-label__option">(optionnel)</span>
        </label>
        <textarea
          className="cp-textarea"
          id="motPourLaFamille"
          rows={2}
          value={motPourLaFamille}
          onChange={(e) => setMotPourLaFamille(e.target.value)}
        />
        <p className="cp-hint">Visible par la famille dans son espace.</p>
      </div>

      <label className="cp-check" style={{ marginTop: "var(--cp-s-5)" }}>
        <input
          type="checkbox"
          checked={certifie}
          onChange={(e) => setCertifie(e.target.checked)}
        />
        <span>
          Je certifie sur l&apos;honneur l&apos;exactitude des informations et
          horaires renseignés ci-dessus, et je m&apos;engage à leur véracité.
        </span>
      </label>

      {error && (
        <p className="cp-error" role="alert">
          <Icone nom="alert" taille="sm" />
          {error}
        </p>
      )}
      {success && (
        <p
          className="cp-success"
          style={{ marginTop: "var(--cp-s-4)" }}
          role="status"
        >
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
        {submitting ? "Enregistrement..." : "Valider"}
      </button>
    </form>
  );
}
