import type { Client } from "@/lib/airtable";

export default function ClientsAssignes({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;

  return (
    <div className="w-full max-w-md mb-4">
      <h2 className="text-sm font-medium text-muted mb-2">
        {clients.length > 1 ? "Vos clients" : "Votre client"}
      </h2>
      <div className="space-y-2">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-2xl border border-line p-4"
          >
            <p className="font-heading font-semibold text-navy">
              {client.nom}
            </p>
            {client.adresse && (
              <p className="text-sm text-muted mt-0.5">{client.adresse}</p>
            )}
            {client.numeroClient && (
              <p className="text-xs text-muted mt-1">
                N° client : {client.numeroClient}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
