import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { sessionInputSchema, statusOnlySchema, notifyEnrolled, formatSessionDate, platformName } from "@/lib/live-sessions-server";

// Modification complète (formulaire) ou simple changement de statut ({ status })
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.liveSession.findUnique({ where: { id }, include: { course: { select: { id: true, title: true } } } });
    if (!existing) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

    // --- Changement de statut seul (boutons « Passer en direct », « Terminer », « Annuler »)
    if (Object.keys(body).length === 1 && "status" in body) {
      const parsed = statusOnlySchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      const session = await db.liveSession.update({ where: { id }, data: { status: parsed.data.status } });

      if (parsed.data.status !== existing.status) {
        if (parsed.data.status === "live") {
          await notifyEnrolled(existing.course.id, "Session en direct maintenant", `"${existing.title}" vient de commencer. Rejoignez-la !`, "success");
        } else if (parsed.data.status === "cancelled") {
          await notifyEnrolled(existing.course.id, "Session annulée", `La session "${existing.title}" a été annulée.`, "warning");
        }
      }
      return NextResponse.json({ session, message: "Statut mis à jour" });
    }

    // --- Modification complète
    const result = sessionInputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    const d = result.data;
    const course = await db.course.findUnique({ where: { id: d.courseId } });
    if (!course) return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });

    const startAt = new Date(d.startAt);
    const session = await db.liveSession.update({
      where: { id },
      data: {
        courseId: course.id,
        title: d.title,
        summary: d.summary || null,
        description: d.description || null,
        startAt,
        durationMinutes: d.durationMinutes,
        platform: d.platform,
        meetingUrl: d.platform === "jitsi" ? null : d.meetingUrl?.trim() || null,
        ...(d.status ? { status: d.status } : {}),
      },
    });

    // Prévient les étudiants si la date ou la plateforme change
    if (startAt.getTime() !== existing.startAt.getTime() || d.platform !== existing.platform) {
      await notifyEnrolled(
        course.id,
        "Session en direct modifiée",
        `"${d.title}" : nouvelle date ${formatSessionDate(startAt)} (${platformName(d.platform)}).`,
        "warning"
      );
    }
    return NextResponse.json({ session, message: "Session mise à jour" });
  } catch (err) {
    console.error("Admin live-session PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await db.liveSession.delete({ where: { id } });
    return NextResponse.json({ message: "Session supprimée" });
  } catch (err) {
    console.error("Admin live-session DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
