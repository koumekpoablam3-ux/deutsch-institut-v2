import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const articles = await db.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, data: { articles } });
  } catch (error) {
    console.error("Blog GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
