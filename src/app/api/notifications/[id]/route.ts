import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    const { id } = await params;

    // On vérifie que la notification appartient bien à l'utilisateur connecté
    const notif = await db.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) {
      return NextResponse.json({ success: false, error: "Notification introuvable" }, { status: 404 });
    }

    const updated = await db.notification.update({ where: { id }, data: { read: true } });
    return NextResponse.json({ success: true, data: { notification: updated } });
  } catch (error) {
    console.error("Notification PATCH error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
