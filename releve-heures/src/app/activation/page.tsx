"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LONGUEUR_MIN = 8;

export default function ActivationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (motDePasse.length < LONGUEUR_MIN) {
      setError(`Le mot de passe doit faire au moins ${LONGUEUR_MIN} caractères.`);
      return;
    }
    if (motDePasse !== confirmation) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, motDePasse }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      // Le mot de passe vient d'être défini : on connecte directement.
      const result = await signIn("credentials", {
        email,
        password: motDePasse,
        redirect: false,
      });

      if (result?.error) {
        setError("Mot de passe défini, mais la connexion a échoué.");
        return;
      }

      router.push("/");
      router.refresh();
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
          Première connexion
        </h1>
        <p className="text-sm text-muted mb-6">
          Définissez votre mot de passe à l&apos;aide du code d&apos;activation
          que Caparel vous a transmis.
        </p>

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

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-ink mb-1"
            >
              Code d&apos;activation
            </label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="motDePasse"
              className="block text-sm font-medium text-ink mb-1"
            >
              Nouveau mot de passe
            </label>
            <input
              id="motDePasse"
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              autoComplete="new-password"
            />
            <p className="text-xs text-muted mt-1">
              {LONGUEUR_MIN} caractères minimum.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmation"
              className="block text-sm font-medium text-ink mb-1"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmation"
              type="password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              autoComplete="new-password"
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
            {loading ? "Enregistrement..." : "Définir mon mot de passe"}
          </button>
        </form>

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
