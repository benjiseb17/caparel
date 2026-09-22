import { formatHeures, formatDateFr } from "@/lib/format";

type Releve = {
  id: string;
  date: string;
  clientNom: string;
  heureArrivee: string;
  heureDepart: string;
  heuresRealisees: number;
  commentaire?: string;
};

export default function HistoriqueReleves({ releves }: { releves: Releve[] }) {
  if (releves.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-line p-8 text-center">
        <p className="text-sm text-muted">
          Aucun relevé enregistré pour le moment.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {releves.map((r) => (
        <li
          key={r.id}
          className="bg-white rounded-2xl border border-line p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-heading font-semibold text-ink truncate">
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
        </li>
      ))}
    </ul>
  );
}
