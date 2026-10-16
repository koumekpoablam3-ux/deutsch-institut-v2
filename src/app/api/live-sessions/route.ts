import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sessions = await db.liveSession.findMany({
      where: { startAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 2) } }, // garde les sessions récentes/en cours (2h de tolérance) et futures
      orderBy: { startAt: "asc" },
      include: { course: { select: { title: true, slug: true, level: true } } },
    });
    return NextResponse.json({ success: true, data: { sessions } });
  } catch (error) {
    console.error("Live-sessions GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
