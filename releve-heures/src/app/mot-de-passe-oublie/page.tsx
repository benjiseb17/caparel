"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/mot-de-passe-oublie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setMessage(data.message);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-line p-8">
        <Image
          src="/caparel-logo.png"
          alt="Caparel — Aide à domicile aux personnes âgées"
          width={1872}
          height={562}
          className="w-44 h-auto mb-6"
          priority
        />

        <h1 className="font-heading text-xl font-bold text-navy mb-1">
          Mot de passe oublié
        </h1>
        <p className="text-sm text-muted mb-6">
          Indiquez votre adresse email : la direction sera prévenue et
          réinitialisera votre accès.
        </p>

        {message ? (
          <>
            <div className="rounded-lg bg-soft-2 border border-line p-4">
              <p className="text-sm text-ink" role="status">
                {message}
              </p>
            </div>
            <p className="text-xs text-muted mt-4">
              Une fois votre accès réinitialisé, revenez sur la page de
              connexion et choisissez « Créer mon mot de passe ».
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navylogo text-white text-sm font-medium py-2.5 hover:bg-navy-2 transition-colors disabled:opacity-60"
            >
              {loading ? "Envoi..." : "Envoyer ma demande"}
            </button>
          </form>
        )}

        <p className="text-sm text-muted mt-6 text-center">
          <Link
            href="/login"
            className="font-medium text-teal-dark hover:text-teal underline underline-offset-2"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
