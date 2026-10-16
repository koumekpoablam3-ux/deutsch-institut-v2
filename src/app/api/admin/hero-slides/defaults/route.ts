import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { DEFAULT_SLIDES } from "@/lib/site-content";

// Charge les 3 slides validés par le client dans la base (uniquement si elle est vide)
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    if ((await db.heroSlide.count()) > 0) {
      return NextResponse.json({ error: "Des slides existent déjà" }, { status: 409 });
    }
    await db.heroSlide.createMany({ data: DEFAULT_SLIDES.map((s, position) => ({ ...s, position })) });
    return NextResponse.json({ message: "Slides par défaut chargés" }, { status: 201 });
  } catch (err) {
    console.error("Admin hero-slides defaults error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
