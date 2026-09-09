import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      prenom?: string;
      nom?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    prenom?: string;
    nom?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    intervenantId?: string;
    prenom?: string;
    nom?: string;
  }
}
