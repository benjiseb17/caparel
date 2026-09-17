import type { Client } from "@/lib/airtable";

export default function ClientsAssignes({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-line p-8 text-center">
        <p className="text-sm text-muted">
          Aucun client ne vous est assigné pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-line divide-y divide-line overflow-hidden">
      {clients.map((client) => (
        <div key={client.id} className="p-4">
          <p className="text-sm font-medium text-ink truncate">{client.nom}</p>
          {client.adresse && (
            <p className="text-xs text-muted mt-0.5 truncate">
              {client.adresse}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
