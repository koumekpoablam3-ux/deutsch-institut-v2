import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    const { enrollmentId } = await params;
    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true, user: { select: { name: true } } },
    });

    if (!enrollment || enrollment.userId !== userId) {
      return NextResponse.json({ success: false, error: "Certificat introuvable" }, { status: 404 });
    }

    const quizQuestionCount = await db.quizQuestion.count({ where: { courseId: enrollment.courseId } });

    if (quizQuestionCount > 0) {
      // Un quiz existe pour ce cours : le certificat n'est délivré qu'après l'avoir réussi
      const certificate = await db.certificate.findUnique({
        where: { userId_courseId: { userId, courseId: enrollment.courseId } },
      });
      if (!certificate) {
        return NextResponse.json(
          { success: false, error: "Réponds d'abord correctement au quiz du cours pour obtenir ton certificat." },
          { status: 403 }
        );
      }
    } else if (enrollment.status !== "completed" && enrollment.progress < 100) {
      return NextResponse.json(
        { success: false, error: "Ce cours n'est pas encore terminé. Le certificat sera disponible à 100% de progression." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        certificate: {
          studentName: enrollment.user.name,
          courseTitle: enrollment.course.title,
          courseLevel: enrollment.course.level,
          lessons: enrollment.course.lessons,
          duration: enrollment.course.duration,
          completedAt: enrollment.updatedAt,
          certificateId: enrollment.id,
        },
      },
    });
  } catch (error) {
    console.error("Certificate GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
