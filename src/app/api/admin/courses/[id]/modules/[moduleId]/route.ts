import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const moduleUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["pdf", "video", "text", "link"]).optional(),
  content: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  fileData: z.string().optional().nullable(),
  order: z.coerce.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id, moduleId } = await params;
    const body = await request.json();
    const result = moduleUpdateSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    const existing = await db.courseModule.findUnique({ where: { id: moduleId } });
    if (!existing || existing.courseId !== id) {
      return NextResponse.json({ error: "Module introuvable" }, { status: 404 });
    }

    const module_ = await db.courseModule.update({
      where: { id: moduleId },
      data: result.data,
      select: { id: true, title: true, type: true, content: true, fileName: true, order: true, createdAt: true },
    });

    return NextResponse.json({ module: module_, message: "Module mis à jour" });
  } catch (err) {
    console.error("Admin module PATCH error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id, moduleId } = await params;
    const existing = await db.courseModule.findUnique({ where: { id: moduleId } });
    if (!existing || existing.courseId !== id) {
      return NextResponse.json({ error: "Module introuvable" }, { status: 404 });
    }

    await db.courseModule.delete({ where: { id: moduleId } });
    return NextResponse.json({ message: "Module supprimé" });
  } catch (err) {
    console.error("Admin module DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
