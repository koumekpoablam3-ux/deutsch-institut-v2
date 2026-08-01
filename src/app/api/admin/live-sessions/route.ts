import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { createNotification } from "@/lib/notify";

const schema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(15).max(480),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const sessions = await db.liveSession.findMany({
      orderBy: { startAt: "asc" },
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
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    const course = await db.course.findUnique({ where: { id: result.data.courseId } });
    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const roomName = `deutsch-institut-${course.slug}-${randomBytes(4).toString("hex")}`;

    const session = await db.liveSession.create({
      data: {
        courseId: course.id,
        title: result.data.title,
        description: result.data.description || null,
        startAt: new Date(result.data.startAt),
        durationMinutes: result.data.durationMinutes,
        roomName,
      },
    });

    // Notifie tous les étudiants inscrits à ce cours
    const enrollments = await db.enrollment.findMany({
      where: { courseId: course.id },
      select: { userId: true },
    });
    const dateStr = new Date(result.data.startAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
    for (const enr of enrollments) {
      await createNotification({
        userId: enr.userId,
        title: "Nouvelle session en direct",
        message: `"${result.data.title}" pour ${course.title}, le ${dateStr}.`,
        type: "info",
        link: "/direct",
      });
    }

    return NextResponse.json({ session, message: "Session créée avec succès" }, { status: 201 });
  } catch (err) {
    console.error("Admin live-sessions POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
