import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const unreadCount = await db.notification.count({ where: { userId, read: false } });

    return NextResponse.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
