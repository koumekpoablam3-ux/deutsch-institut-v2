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
    const role = (session.user as { role?: string }).role;

    const { slug } = await params;
    const course = await db.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ success: false, error: "Cours non trouvé" }, { status: 404 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (!enrollment && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Vous devez être inscrit à ce cours pour y accéder" },
        { status: 403 }
      );
    }

    const modules = await db.courseModule.findMany({
      where: { courseId: course.id },
      orderBy: { order: "asc" },
      select: { id: true, title: true, type: true, content: true, fileName: true, order: true },
    });

    const progressRows = await db.moduleProgress.findMany({
      where: { userId, module: { courseId: course.id } },
      select: { moduleId: true },
    });
    const completedIds = new Set(progressRows.map((p) => p.moduleId));

    const certificate = await db.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });

    return NextResponse.json({
      success: true,
      data: {
        course: { id: course.id, title: course.title, slug: course.slug },
        modules: modules.map((m) => ({ ...m, completed: completedIds.has(m.id) })),
        allCompleted: modules.length > 0 && modules.every((m) => completedIds.has(m.id)),
        certificate: certificate ? { id: certificate.id, certificateNumber: certificate.certificateNumber } : null,
      },
    });
  } catch (error) {
    console.error("Course modules GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
