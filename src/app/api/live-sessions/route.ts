import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Liste des sessions visibles par les étudiants.
// IMPORTANT : on ne renvoie JAMAIS le lien de la salle ni le nom de la salle Jitsi ici :
// ils ne sont communiqués que par /api/live-sessions/[id], après vérification de l'inscription au cours.
export async function GET() {
  try {
    const rows = await db.liveSession.findMany({
      where: {
        status: { in: ["scheduled", "live"] },
        startAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 9) }, // marge pour les sessions longues en cours
      },
      orderBy: { startAt: "asc" },
      select: {
        id: true, title: true, summary: true, description: true, startAt: true, durationMinutes: true, platform: true, status: true,
        course: { select: { title: true, slug: true, level: true } },
      },
    });

    // On garde les sessions « En direct » (forcées par l'admin) et celles dont la fin n'est pas dépassée de plus de 30 min
    const now = Date.now();
    const sessions = rows.filter((s) => s.status === "live" || s.startAt.getTime() + s.durationMinutes * 60000 >= now - 30 * 60000);

    return NextResponse.json({ success: true, data: { sessions } });
  } catch (error) {
    console.error("Live-sessions GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
