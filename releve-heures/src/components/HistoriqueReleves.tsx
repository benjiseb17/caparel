"use client";

import { useMemo, useState } from "react";
import { formatHeures, formatDateFr } from "@/lib/format";
import { calculerHeures } from "@/lib/heures";
import TimeSelect from "@/components/TimeSelect";

type Releve = {
  id: string;
  date: string;
  clientId: string;
  clientNom: string;
  heureArrivee: string;
  heureDepart: string;
  heuresRealisees: number;
  commentaire?: string;
};

type Client = {
  id: string;
  nom: string;
};

function EditForm({
  releve,
  clients,
  onCancel,
  onSaved,
}: {
  releve: Releve;
  clients: Client[];
  onCancel: () => void;
  onSaved: (updated: Releve) => void;
}) {
  const [clientId, setClientId] = useState(releve.clientId);
  const [date, setDate] = useState(releve.date);
  const [heureArrivee, setHeureArrivee] = useState(releve.heureArrivee);
  const [heureDepart, setHeureDepart] = useState(releve.heureDepart);
  const [commentaire, setCommentaire] = useState(releve.commentaire || "");
  const [certifie, setCertifie] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heuresRealisees = useMemo(
    () => calculerHeures(heureArrivee, heureDepart),
    [heureArrivee, heureDepart]
  );

  async function handleSave() {
    setError(null);

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
      const res = await fetch(`/api/releves/${releve.id}`, {
        method: "PATCH",
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

      onSaved({
        ...releve,
        clientId,
        clientNom: clients.find((c) => c.id === clientId)?.nom || releve.clientNom,
        date,
        heureArrivee,
        heureDepart,
        heuresRealisees: data.heuresRealisees,
        commentaire,
      });
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 space-y-4 border-t border-line">
      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Client
        </label>
        <select
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
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
        <label className="block text-sm font-medium text-ink mb-1">
          Date
        </label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TimeSelect
          id={`edit-arrivee-${releve.id}`}
          label="Heure d'arrivée"
          value={heureArrivee}
          onChange={setHeureArrivee}
        />
        <TimeSelect
          id={`edit-depart-${releve.id}`}
          label="Heure de départ"
          value={heureDepart}
          onChange={setHeureDepart}
        />
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
        <label className="block text-sm font-medium text-ink mb-1">
          Commentaire{" "}
          <span className="text-muted font-normal">(optionnel)</span>
        </label>
        <textarea
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

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-lg border border-line text-ink text-sm font-medium py-2.5 hover:bg-soft transition-colors disabled:opacity-60"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="flex-1 rounded-lg bg-navylogo text-white text-sm font-medium py-2.5 hover:bg-navy-2 transition-colors disabled:opacity-60"
        >
          {submitting ? "Enregistrement..." : "Revalider"}
        </button>
      </div>
    </div>
  );
}

export default function HistoriqueReleves({
  releves: initialReleves,
  clients,
}: {
  releves: Releve[];
  clients: Client[];
}) {
  const [releves, setReleves] = useState(initialReleves);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (releves.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-line p-8 text-center">
        <p className="text-sm text-muted">
          Aucun relevé enregistré pour le moment.
        </p>
      </div>
    );
  }

  function toggle(id: string) {
    if (editingId) return;
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <ul className="space-y-3">
      {releves.map((r) => (
        <li
          key={r.id}
          className="bg-white rounded-2xl border border-line overflow-hidden"
        >
          <button
            type="button"
            onClick={() => toggle(r.id)}
            className="w-full text-left p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading font-semibold text-ink">
                  {r.clientNom}
                </p>
                <p className="text-sm text-muted">
                  {formatDateFr(r.date)} · {r.heureArrivee} - {r.heureDepart}
                </p>
              </div>
              <span className="font-heading text-sm font-bold text-teal-dark shrink-0">
                {formatHeures(r.heuresRealisees)}
              </span>
            </div>
            {r.commentaire && (
              <p className="text-sm text-ink mt-2 pt-2 border-t border-line">
                {r.commentaire}
              </p>
            )}
          </button>

          {openId === r.id && editingId !== r.id && (
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={() => setEditingId(r.id)}
                className="text-sm font-medium text-teal-dark hover:text-teal underline underline-offset-2"
              >
                Modifier
              </button>
            </div>
          )}

          {editingId === r.id && (
            <EditForm
              releve={r}
              clients={clients}
              onCancel={() => setEditingId(null)}
              onSaved={(updated) => {
                setReleves((prev) =>
                  prev.map((item) => (item.id === updated.id ? updated : item))
                );
                setEditingId(null);
                setOpenId(null);
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
