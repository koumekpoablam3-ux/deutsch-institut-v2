import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const updateSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100).optional(),
  telephone: z.string().trim().max(40).nullable().optional(),
  niveau: z.enum(["A1", "A2", "B1", "B2"]).optional(),
  role: z.enum(["student", "admin"]).optional(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(100).optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const result = updateSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    const { password, telephone, ...rest } = result.data;

    const target = await db.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    // Protection : on ne peut pas retirer le rôle admin à soi-même ni au dernier administrateur
    if (rest.role && rest.role !== "admin" && target.role === "admin") {
      const selfId = (session!.user as { userId?: string }).userId;
      if (selfId === id) {
        return NextResponse.json({ error: "Vous ne pouvez pas retirer vos propres droits d'administrateur" }, { status: 400 });
      }
      const admins = await db.user.count({ where: { role: "admin" } });
      if (admins <= 1) {
        return NextResponse.json({ error: "Il doit rester au moins un administrateur" }, { status: 400 });
      }
    }

    const data: Record<string, unknown> = { ...rest };
    if (telephone !== undefined) data.telephone = telephone || null;
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, telephone: true, niveau: true, role: true, createdAt: true, _count: { select: { enrollments: true } } },
    });
    return NextResponse.json({ user, message: password ? "Utilisateur et mot de passe mis à jour" : "Utilisateur mis à jour" });
  } catch (err) {
    console.error("Admin user PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const selfId = (session!.user as { userId?: string }).userId;
    if (selfId === id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    if (target.role === "admin" && (await db.user.count({ where: { role: "admin" } })) <= 1) {
      return NextResponse.json({ error: "Il doit rester au moins un administrateur" }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    // P2003 : violation de clé étrangère (ex. l'utilisateur est l'auteur d'articles de blog)
    if ((err as { code?: string }).code === "P2003") {
      return NextResponse.json({ error: "Impossible de supprimer : cet utilisateur est l'auteur d'articles du blog. Supprimez ou republiez d'abord ces articles." }, { status: 409 });
    }
    console.error("Admin user DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
