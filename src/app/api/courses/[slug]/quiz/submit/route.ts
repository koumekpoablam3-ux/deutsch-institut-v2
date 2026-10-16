import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notify";

const submitSchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), selectedIndex: z.number().int().min(0) })),
});

const PASS_THRESHOLD = 0.7; // 70% de bonnes réponses pour obtenir le certificat

function generateCertificateNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DI-${year}-${random}`;
}

export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const result = submitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Réponses invalides" }, { status: 400 });
    }

    const questions = await db.quizQuestion.findMany({ where: { courseId: course.id } });
    if (questions.length === 0) {
      return NextResponse.json({ success: false, error: "Aucun quiz n'est configuré pour ce cours" }, { status: 400 });
    }

    let score = 0;
    for (const q of questions) {
      const answer = result.data.answers.find((a) => a.questionId === q.id);
      if (answer && answer.selectedIndex === q.correctIndex) score++;
    }
    const total = questions.length;
    const passed = score / total >= PASS_THRESHOLD;

    await db.quizAttempt.create({
      data: { userId, courseId: course.id, score, total, passed },
    });

    let certificate = await db.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    if (passed && !certificate) {
      certificate = await db.certificate.create({
        data: { userId, courseId: course.id, certificateNumber: generateCertificateNumber() },
      });
      await db.enrollment.update({
        where: { userId_courseId: { userId, courseId: course.id } },
        data: { status: "completed", progress: 100 },
      });
      await createNotification({
        userId,
        title: "🎉 Certificat obtenu !",
        message: `Félicitations, vous avez validé le cours "${course.title}" et votre certificat est prêt.`,
        type: "success",
        link: "/dashboard",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        score, total, passed,
        certificate: certificate ? { id: certificate.id, certificateNumber: certificate.certificateNumber } : null,
      },
    });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
