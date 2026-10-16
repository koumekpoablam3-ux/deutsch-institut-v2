import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit être en minuscules, sans espaces ni accents")
    .optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    if (result.data.slug) {
      const existing = await db.article.findUnique({ where: { slug: result.data.slug } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Un autre article utilise déjà ce slug" }, { status: 409 });
      }
    }

    const article = await db.article.update({ where: { id }, data: result.data });
    return NextResponse.json({ article, message: "Article mis à jour" });
  } catch (err) {
    console.error("Admin article PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await db.article.delete({ where: { id } });
    return NextResponse.json({ message: "Article supprimé" });
  } catch (err) {
    console.error("Admin article DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
