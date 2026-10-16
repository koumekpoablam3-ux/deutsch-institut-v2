import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const questionUpdateSchema = z.object({
  question: z.string().min(1).optional(),
  options: z.array(z.string().min(1)).min(2).optional(),
  correctIndex: z.coerce.number().int().min(0).optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id, questionId } = await params;
    const existing = await db.quizQuestion.findUnique({ where: { id: questionId } });
    if (!existing || existing.courseId !== id) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const result = questionUpdateSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    const options = result.data.options ?? (JSON.parse(existing.options) as string[]);
    const correctIndex = result.data.correctIndex ?? existing.correctIndex;
    if (correctIndex >= options.length) {
      return NextResponse.json({ error: "L'index de la bonne réponse est invalide" }, { status: 400 });
    }

    const updated = await db.quizQuestion.update({
      where: { id: questionId },
      data: {
        question: result.data.question,
        options: result.data.options ? JSON.stringify(result.data.options) : undefined,
        correctIndex: result.data.correctIndex,
        order: result.data.order,
      },
    });

    return NextResponse.json({ question: { ...updated, options }, message: "Question mise à jour" });
  } catch (err) {
    console.error("Admin quiz question PATCH error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id, questionId } = await params;
    const existing = await db.quizQuestion.findUnique({ where: { id: questionId } });
    if (!existing || existing.courseId !== id) {
      return NextResponse.json({ error: "Question introuvable" }, { status: 404 });
    }

    await db.quizQuestion.delete({ where: { id: questionId } });
    return NextResponse.json({ message: "Question supprimée" });
  } catch (err) {
    console.error("Admin quiz question DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
