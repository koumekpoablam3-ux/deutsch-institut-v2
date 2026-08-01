import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const course = await db.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ success: false, error: "Cours non trouvé" }, { status: 404 });
    }

    const reviews = await db.review.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, data: { reviews } });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Vous devez être connecté pour laisser un avis" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    const { slug } = await params;
    const course = await db.course.findUnique({ where: { slug } });
    if (!course) {
      return NextResponse.json({ success: false, error: "Cours non trouvé" }, { status: 404 });
    }

    // On exige d'être inscrit au cours pour laisser un avis
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Vous devez être inscrit à ce cours pour laisser un avis" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ success: false, error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    const review = await db.review.upsert({
      where: { userId_courseId: { userId, courseId: course.id } },
      update: { rating: result.data.rating, comment: result.data.comment || null },
      create: {
        userId,
        courseId: course.id,
        rating: result.data.rating,
        comment: result.data.comment || null,
      },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, data: { review, message: "Merci pour votre avis !" } });
  } catch (error) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
