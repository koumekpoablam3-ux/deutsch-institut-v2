import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
