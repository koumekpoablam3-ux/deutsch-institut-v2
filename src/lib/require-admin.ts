import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Vérifie côté serveur que l'utilisateur connecté a le rôle "admin".
 * À appeler en tout premier dans chaque route API réservée à l'admin,
 * même si le middleware protège déjà /admin/* — c'est une sécurité en
 * profondeur (defense in depth) qui protège aussi les routes /api/admin/*
 * dans le cas où elles seraient appelées directement.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non autorisé" }, { status: 401 }), session: null };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}
