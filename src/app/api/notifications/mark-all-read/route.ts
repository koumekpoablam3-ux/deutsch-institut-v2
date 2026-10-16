import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    await db.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return NextResponse.json({ success: true, data: { message: "Toutes les notifications ont été marquées comme lues" } });
  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
