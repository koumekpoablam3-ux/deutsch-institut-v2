import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    const { slug, moduleId } = await params;
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

    const module_ = await db.courseModule.findUnique({ where: { id: moduleId } });
    if (!module_ || module_.courseId !== course.id) {
      return NextResponse.json({ success: false, error: "Module introuvable" }, { status: 404 });
    }

    await db.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: {},
      create: { userId, moduleId },
    });

    // Recalcule la progression globale de l'inscription (% de modules terminés)
    const totalModules = await db.courseModule.count({ where: { courseId: course.id } });
    const completedModules = await db.moduleProgress.count({
      where: { userId, module: { courseId: course.id } },
    });
    const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    await db.enrollment.update({
      where: { userId_courseId: { userId, courseId: course.id } },
      data: { progress },
    });

    return NextResponse.json({ success: true, data: { progress, allCompleted: completedModules === totalModules && totalModules > 0 } });
  } catch (error) {
    console.error("Module complete POST error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
