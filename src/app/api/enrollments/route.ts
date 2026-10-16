import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST: Enroll user in a course
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const userId = (session.user as { userId: string }).userId;
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "L'ID du cours est requis" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Vous êtes déjà inscrit à ce cours" },
        { status: 409 }
      );
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    return NextResponse.json(
      { success: true, data: { enrollment, message: "Inscription réussie !" } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enrollment POST error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// GET: Get user's enrollments
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const userId = (session.user as { userId: string }).userId;

    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { enrollments } });
  } catch (error) {
    console.error("Enrollments GET error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// PATCH: Update enrollment progress
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const userId = (session.user as { userId: string }).userId;
    const { enrollmentId, progress } = await request.json();

    if (!enrollmentId || progress === undefined) {
      return NextResponse.json(
        { success: false, error: "L'ID de l'inscription et la progression sont requis" },
        { status: 400 }
      );
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json(
        { success: false, error: "La progression doit être entre 0 et 100" },
        { status: 400 }
      );
    }

    const result = await db.enrollment.updateMany({
      where: {
        id: enrollmentId,
        userId,
      },
      data: {
        progress,
        status: progress >= 100 ? "completed" : "active",
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Inscription non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Progression mise à jour" },
    });
  } catch (error) {
    console.error("Enrollment PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
