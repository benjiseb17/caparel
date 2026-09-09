import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getIntervenantByEmail } from "@/lib/airtable";
import { isDemoMode, DEMO_INTERVENANT } from "@/lib/demo";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const intervenant = isDemoMode()
          ? email.toLowerCase() === DEMO_INTERVENANT.email.toLowerCase()
            ? DEMO_INTERVENANT
            : null
          : await getIntervenantByEmail(email);
        if (!intervenant || !intervenant.actif) return null;
        if (!intervenant.motDePasseHash) return null;

        const valid = await bcrypt.compare(
          password,
          intervenant.motDePasseHash
        );
        if (!valid) return null;

        return {
          id: intervenant.id,
          name: `${intervenant.prenom} ${intervenant.nom}`.trim(),
          email: intervenant.email,
          prenom: intervenant.prenom,
          nom: intervenant.nom,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.intervenantId = user.id;
        token.prenom = user.prenom;
        token.nom = user.nom;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.intervenantId as string;
        session.user.prenom = token.prenom as string | undefined;
        session.user.nom = token.nom as string | undefined;
      }
      return session;
    },
  },
});
