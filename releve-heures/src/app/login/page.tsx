"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft px-4">
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
          Relevé d&apos;heures
        </h1>
        <p className="text-sm text-muted mb-6">
          Connectez-vous pour saisir vos heures
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
            <div className="flex items-baseline justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink"
              >
                Mot de passe
              </label>
              <Link
                href="/mot-de-passe-oublie"
                className="text-xs text-muted hover:text-navy underline underline-offset-2"
              >
                Oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              autoComplete="current-password"
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
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-line">
          <p className="text-sm font-medium text-ink mb-1">
            Vous n&apos;avez pas encore de mot de passe ?
          </p>
          <p className="text-xs text-muted mb-3">
            Si c&apos;est votre première connexion, ou si la direction vient de
            réinitialiser votre accès, créez votre mot de passe ici.
          </p>
          <Link
            href="/activation"
            className="block w-full rounded-lg border border-teal-dark text-teal-dark text-center text-sm font-medium py-2.5 hover:bg-soft-2 transition-colors"
          >
            Créer mon mot de passe
          </Link>
        </div>
      </div>
    </div>
  );
}
