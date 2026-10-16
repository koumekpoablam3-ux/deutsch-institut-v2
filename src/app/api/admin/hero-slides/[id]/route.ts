import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { slideUpdateSchema, emptyToNull } from "@/lib/site-content";

const NULLABLE = ["badge", "tagsTitle", "partnerName", "partnerLogo", "partnerText", "primaryLabel", "primaryHref", "secondaryLabel", "secondaryHref"] as const;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const result = slideUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }

    const existing = await db.heroSlide.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Slide introuvable" }, { status: 404 });

    const slide = await db.heroSlide.update({
      where: { id },
      data: emptyToNull(result.data, [...NULLABLE]),
    });
    return NextResponse.json({ slide, message: "Slide enregistré" });
  } catch (err) {
    console.error("Admin hero-slide PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await db.heroSlide.delete({ where: { id } });
    return NextResponse.json({ message: "Slide supprimé" });
  } catch (err) {
    console.error("Admin hero-slide DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
