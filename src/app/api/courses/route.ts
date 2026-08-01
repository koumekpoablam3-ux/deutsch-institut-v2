import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const includeReviews = searchParams.get("reviews") === "true";

    const courses = await db.course.findMany({
      where: level ? { level } : undefined,
      orderBy: { createdAt: "asc" },
      include: includeReviews
        ? {
            reviews: {
              orderBy: { createdAt: "desc" },
              include: { user: { select: { name: true } } },
            },
          }
        : undefined,
    });

    return NextResponse.json({ success: true, data: { courses } });
  } catch (error) {
    console.error("Courses API error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
