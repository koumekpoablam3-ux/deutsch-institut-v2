import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const url = `/api/media/${id}`;

    // On refuse de supprimer une image encore utilisée (sinon le site afficherait une image cassée)
    const used = await db.heroSlide.count({ where: { OR: [{ image: url }, { partnerLogo: url }] } });
    if (used > 0) {
      return NextResponse.json({ error: "Cette image est utilisée par un slide du carrousel. Changez d'abord l'image du slide." }, { status: 409 });
    }

    await db.media.delete({ where: { id } });
    return NextResponse.json({ message: "Image supprimée" });
  } catch (err) {
    console.error("Admin media DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
