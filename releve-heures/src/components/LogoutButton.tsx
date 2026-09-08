"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-muted hover:text-navy transition-colors"
    >
      Se déconnecter
    </button>
  );
}
