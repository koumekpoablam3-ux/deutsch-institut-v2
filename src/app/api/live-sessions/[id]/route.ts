import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;
    const role = (session.user as { role?: string }).role;

    const { id } = await params;
    const liveSession = await db.liveSession.findUnique({
      where: { id },
      include: { course: { select: { id: true, title: true, slug: true } } },
    });

    if (!liveSession) {
      return NextResponse.json({ success: false, error: "Session introuvable" }, { status: 404 });
    }

    if (role !== "admin") {
      const enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: liveSession.course.id } },
      });
      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: "Vous devez être inscrit à ce cours pour rejoindre cette session" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, data: { session: liveSession } });
  } catch (error) {
    console.error("Live-session GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
