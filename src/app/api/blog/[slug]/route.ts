import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await db.article.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    });

    if (!article || !article.published) {
      return NextResponse.json({ success: false, error: "Article introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { article } });
  } catch (error) {
    console.error("Blog detail GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
