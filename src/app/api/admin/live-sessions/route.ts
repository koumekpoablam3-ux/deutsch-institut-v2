import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { sessionInputSchema, notifyEnrolled, formatSessionDate, platformName } from "@/lib/live-sessions-server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const sessions = await db.liveSession.findMany({
      orderBy: { startAt: "desc" },
      include: { course: { select: { title: true, slug: true } } },
    });
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("Admin live-sessions GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const result = sessionInputSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    const d = result.data;

    const course = await db.course.findUnique({ where: { id: d.courseId } });
    if (!course) return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });

    const startAt = new Date(d.startAt);
    const session = await db.liveSession.create({
      data: {
        courseId: course.id,
        title: d.title,
        summary: d.summary || null,
        description: d.description || null,
        startAt,
        durationMinutes: d.durationMinutes,
        platform: d.platform,
        meetingUrl: d.platform === "jitsi" ? null : d.meetingUrl?.trim() || null,
        status: d.status ?? "scheduled",
        roomName: `deutsch-institut-${course.slug}-${randomBytes(4).toString("hex")}`,
      },
    });

    await notifyEnrolled(
      course.id,
      "Nouvelle session en direct",
      `"${d.title}" (${platformName(d.platform)}) pour ${course.title}, le ${formatSessionDate(startAt)}.`
    );

    return NextResponse.json({ session, message: "Session programmée" }, { status: 201 });
  } catch (err) {
    console.error("Admin live-sessions POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
