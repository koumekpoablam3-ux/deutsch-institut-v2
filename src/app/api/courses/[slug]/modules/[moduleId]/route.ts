import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;
    const role = (session.user as { role?: string }).role;

    const { slug, moduleId } = await params;
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

    const module_ = await db.courseModule.findUnique({ where: { id: moduleId } });
    if (!module_ || module_.courseId !== course.id) {
      return NextResponse.json({ success: false, error: "Module introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { module: module_ } });
  } catch (error) {
    console.error("Course module detail GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
