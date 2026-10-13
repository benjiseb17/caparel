"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import CarteAuth from "@/components/charte/CarteAuth";
import Icone from "@/components/charte/Icone";
import { LONGUEUR_MIN_MOT_DE_PASSE as LONGUEUR_MIN } from "@/lib/mot-de-passe";

export default function ActivationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, motDePasse }),
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
    <CarteAuth
      titre="Première connexion"
      intro="Saisissez l'adresse email que vous avez communiquée à Caparel, puis choisissez votre mot de passe."
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
          <label className="cp-label" htmlFor="motDePasse">
            Nouveau mot de passe
          </label>
          <input
            className="cp-input"
            id="motDePasse"
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="new-password"
          />
          <p className="cp-hint">{LONGUEUR_MIN} caractères minimum.</p>
        </div>

        <div className="cp-field">
          <label className="cp-label" htmlFor="confirmation">
            Confirmer le mot de passe
          </label>
          <input
            className="cp-input"
            id="confirmation"
            type="password"
            required
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="new-password"
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
          {loading ? "Enregistrement..." : "Définir mon mot de passe"}
        </button>
      </form>

      <p className="a-auth__retour">
        <Link className="cp-link" href="/login">
          Retour à la connexion
        </Link>
      </p>
    </CarteAuth>
  );
}
