import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const course = await db.course.findUnique({
      where: { slug },
      include: {
        enrollments: {
          select: {
            id: true,
            userId: true,
            progress: true,
            status: true,
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Cours non trouvé" },
        { status: 404 }
      );
    }

    const avgRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : null;

    return NextResponse.json({ success: true, data: { course: { ...course, avgRating } } });
  } catch (error) {
    console.error("Course detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
