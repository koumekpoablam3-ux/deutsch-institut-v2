import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    const { slug } = await params;
    const course = await db.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ success: false, error: "Cours non trouvé" }, { status: 404 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Vous devez être inscrit à ce cours pour y accéder" },
        { status: 403 }
      );
    }

    const rows = await db.quizQuestion.findMany({ where: { courseId: course.id }, orderBy: { order: "asc" } });
    const questions = rows.map((q) => ({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options) as string[],
      // correctIndex volontairement omis : ne jamais l'envoyer au client avant la correction
    }));

    const certificate = await db.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    return NextResponse.json({
      success: true,
      data: { questions, certificate: certificate ? { id: certificate.id } : null },
    });
  } catch (error) {
    console.error("Course quiz GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
