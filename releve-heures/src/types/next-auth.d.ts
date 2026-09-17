import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nomComplet?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    nomComplet?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    intervenantId?: string;
    nomComplet?: string;
  }
}
