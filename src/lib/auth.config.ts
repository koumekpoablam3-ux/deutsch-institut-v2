import type { NextAuthConfig } from "next-auth";

// Configuration "edge-safe" : ne doit contenir AUCUN import de Prisma / bcrypt,
// car elle est utilisée par le middleware qui tourne dans l'Edge Runtime.
// Le provider Credentials (qui a besoin de Prisma + bcrypt) est ajouté séparément
// dans auth.ts, uniquement pour le runtime Node.js (routes API).
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isProtected =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/entrainement-ia");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as { role?: string } | undefined)?.role;
        if (role !== "admin") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isProtected && !isLoggedIn) {
        return false; // redirige automatiquement vers la page définie dans "pages.signIn"
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role;
        token.niveau = (user as { niveau?: string }).niveau;
      }
      if (trigger === "update" && session) {
        const s = session as { name?: string; niveau?: string };
        if (s.name) token.name = s.name;
        if (s.niveau) token.niveau = s.niveau;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { userId: string }).userId = token.userId as string;
        (session.user as unknown as { role: string }).role = token.role as string;
        (session.user as unknown as { niveau: string }).niveau = token.niveau as string;
      }
      return session;
    },
  },
};
