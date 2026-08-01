import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Important : on utilise ici la config "edge-safe" (sans Prisma/bcrypt) et non
// le module "@/lib/auth" complet, car ce dernier importe Prisma Client, qui
// n'est pas compatible avec l'Edge Runtime utilisé par le middleware Next.js.
// C'était la cause de l'erreur d'authentification en accédant à /dashboard
// et /entrainement-ia.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/entrainement-ia/:path*", "/admin/:path*"],
};
