"use client";

import { useRef, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function EditableAvatar({
  photoUrl,
  initiales,
  nomComplet,
  editable,
}: {
  photoUrl: string;
  initiales: string;
  nomComplet: string;
  editable: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
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

    setPreview(URL.createObjectURL(fichier));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", fichier);

      const res = await fetch("/api/profil/photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const src = preview || photoUrl;

  return (
    <div className="relative shrink-0">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={nomComplet}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-navylogo text-white flex items-center justify-center font-heading font-bold text-lg">
          {initiales}
        </div>
      )}

      {editable && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Modifier la photo de profil"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-navylogo text-white flex items-center justify-center border-2 border-white hover:bg-navy-2 transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <svg
                className="w-3 h-3 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
                <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}

      {error && (
        <p
          role="alert"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-32 text-center text-[11px] leading-tight text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
