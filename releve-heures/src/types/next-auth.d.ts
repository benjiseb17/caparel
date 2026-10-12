import type { DefaultSession, DefaultUser } from "next-auth";

import type { RoleCompte } from "@/lib/airtable";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nomComplet?: string;
      role?: RoleCompte;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    nomComplet?: string;
    role?: RoleCompte;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    intervenantId?: string;
    nomComplet?: string;
    role?: RoleCompte;
  }
}
