import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const questionSchema = z.object({
  question: z.string().min(1, "La question est requise"),
  options: z.array(z.string().min(1)).min(2, "Au moins 2 réponses sont requises"),
  correctIndex: z.coerce.number().int().min(0),
  order: z.coerce.number().int().min(0).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const rows = await db.quizQuestion.findMany({ where: { courseId: id }, orderBy: { order: "asc" } });
    const questions = rows.map((q) => ({ ...q, options: JSON.parse(q.options) as string[] }));
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Admin quiz GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const course = await db.course.findUnique({ where: { id } });
    if (!course) return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });

    const body = await request.json();
    const result = questionSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    if (result.data.correctIndex >= result.data.options.length) {
      return NextResponse.json({ error: "L'index de la bonne réponse est invalide" }, { status: 400 });
    }

    let order = result.data.order;
    if (order === undefined) {
      const last = await db.quizQuestion.findFirst({ where: { courseId: id }, orderBy: { order: "desc" } });
      order = last ? last.order + 1 : 0;
    }

    const created = await db.quizQuestion.create({
      data: {
        courseId: id,
        question: result.data.question,
        options: JSON.stringify(result.data.options),
        correctIndex: result.data.correctIndex,
        order,
      },
    });

    return NextResponse.json({
      question: { ...created, options: result.data.options },
      message: "Question ajoutée",
    });
  } catch (err) {
    console.error("Admin quiz POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
