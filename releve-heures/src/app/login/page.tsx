"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import CarteAuth from "@/components/charte/CarteAuth";
import Icone from "@/components/charte/Icone";

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
    <CarteAuth
      titre="Relevé d'heures"
      intro="Connectez-vous pour accéder à votre espace."
    >
      <form onSubmit={handleSubmit}>
        <div className="cp-field">
          <label className="cp-label" htmlFor="email">
            Email
          </label>
          <input
            className="cp-input"
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="cp-field">
          <label className="cp-label" htmlFor="password">
            Mot de passe
          </label>
          <input
            className="cp-input"
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="cp-error" role="alert">
            <Icone nom="alert" taille="sm" />
            {error}
          </p>
        )}

        <button
          className="cp-btn cp-btn--primary cp-btn--block"
          style={{ marginTop: "var(--cp-s-5)" }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="a-auth__retour">
        <Link className="cp-link" href="/mot-de-passe-oublie">
          Mot de passe oublié ?
        </Link>
      </p>

      <div className="a-auth__sep">
        <p className="a-auth__sep-title">
          Vous n&apos;avez pas encore de mot de passe ?
        </p>
        <p className="a-auth__sep-text">
          Si c&apos;est votre première connexion, ou si la direction vient de
          réinitialiser votre accès, créez votre mot de passe ici.
        </p>
        <Link className="cp-btn cp-btn--outline cp-btn--block" href="/activation">
          Première connexion
        </Link>
      </div>
    </CarteAuth>
  );
}
