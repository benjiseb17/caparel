"use client";

import { useRef, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function ReglagesForm({
  emailInitial,
  telephoneInitial,
  photoUrlInitiale,
  initiales,
  nomComplet,
}: {
  emailInitial: string;
  telephoneInitial: string;
  photoUrlInitiale: string;
  initiales: string;
  nomComplet: string;
}) {
  const router = useRouter();
  const inputPhotoRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(emailInitial);
  const [telephone, setTelephone] = useState(telephoneInitial);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoApercu, setPhotoApercu] = useState<string | null>(null);
  const [certifie, setCertifie] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setError(null);
    if (!fichier.type.startsWith("image/")) {
      setError("Merci de choisir une image.");
      return;
    }
    if (fichier.size > 5 * 1024 * 1024) {
      setError("Image trop lourde (5 Mo max).");
      return;
    }

    setPhotoFile(fichier);
    setPhotoApercu(URL.createObjectURL(fichier));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("L'email est requis.");
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
      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("telephone", telephone.trim());
      formData.append("certifie", "true");
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch("/api/profil", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setSuccess(
        "Vos informations ont été mises à jour. La direction Caparel en a été informée."
      );
      setCertifie(false);
      setPhotoFile(null);
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  const photoAffichee = photoApercu || photoUrlInitiale;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-line p-6 sm:p-8 space-y-5"
    >
      <div className="flex items-center gap-4">
        {photoAffichee ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoAffichee}
            alt={nomComplet}
            className="w-16 h-16 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-navylogo text-white flex items-center justify-center font-heading font-bold text-lg shrink-0">
            {initiales}
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => inputPhotoRef.current?.click()}
            className="text-sm font-medium text-teal-dark hover:text-teal underline underline-offset-2"
          >
            Changer la photo
          </button>
          <input
            ref={inputPhotoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-ink mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
        />
      </div>

      <div>
        <label
          htmlFor="telephone"
          className="block text-sm font-medium text-ink mb-1"
        >
          Téléphone
        </label>
        <input
          id="telephone"
          type="tel"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
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
          renseignées ci-dessus. La direction Caparel sera informée de cette
          modification.
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
        {submitting ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
