import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { slideSchema, emptyToNull } from "@/lib/site-content";

const NULLABLE = ["badge", "tagsTitle", "partnerName", "partnerLogo", "partnerText", "primaryLabel", "primaryHref", "secondaryLabel", "secondaryHref"] as const;

// Liste complète des slides (actifs et masqués) pour l'admin
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const slides = await db.heroSlide.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
    return NextResponse.json({ slides });
  } catch (err) {
    console.error("Admin hero-slides GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const result = slideSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }

    const last = await db.heroSlide.aggregate({ _max: { position: true } });
    const position = (last._max.position ?? -1) + 1;

    const slide = await db.heroSlide.create({
      data: { ...emptyToNull(result.data, [...NULLABLE]), position },
    });
    return NextResponse.json({ slide, message: "Slide créé" }, { status: 201 });
  } catch (err) {
    console.error("Admin hero-slides POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
