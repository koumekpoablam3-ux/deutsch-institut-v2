import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const courseUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit être en minuscules, sans espaces ni accents")
    .optional(),
  level: z.string().min(1).optional(),
  lessons: z.coerce.number().int().min(1).optional(),
  duration: z.string().min(1).optional(),
  price: z.string().min(1).optional(),
  badge: z.string().optional().nullable(),
  badgeColor: z.string().optional().nullable(),
  image: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  objectives: z.string().min(1).optional(),
  prerequisites: z.string().optional().nullable(),
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
    const result = courseUpdateSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    if (result.data.slug) {
      const existing = await db.course.findUnique({ where: { slug: result.data.slug } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "Un autre cours utilise déjà ce slug" }, { status: 409 });
      }
    }

    const course = await db.course.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ course, message: "Cours mis à jour avec succès" });
  } catch (err) {
    console.error("Admin course PUT error:", err);
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

    // Supprime d'abord les inscriptions liées pour éviter une erreur de contrainte
    await db.enrollment.deleteMany({ where: { courseId: id } });
    await db.course.delete({ where: { id } });

    return NextResponse.json({ message: "Cours supprimé avec succès" });
  } catch (err) {
    console.error("Admin course DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
