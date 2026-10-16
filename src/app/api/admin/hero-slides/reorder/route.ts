import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({ ids: z.array(z.string().min(1)).min(1).max(100) });

// Enregistre le nouvel ordre des slides (la position = l'index dans la liste reçue)
export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const result = schema.safeParse(await request.json());
    if (!result.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    await db.$transaction(
      result.data.ids.map((id, position) => db.heroSlide.update({ where: { id }, data: { position } }))
    );
    return NextResponse.json({ message: "Ordre enregistré" });
  } catch (err) {
    console.error("Admin hero-slides reorder error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
