import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { db } from "@/lib/db";
import { settingSchemas, SETTING_KEYS } from "@/lib/site-content";
import { getSetting } from "@/lib/site-content-server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [hero, stats, cta, features, testimonials, contact] = await Promise.all([
      getSetting("hero"), getSetting("stats"), getSetting("cta"),
      getSetting("features"), getSetting("testimonials"), getSetting("contact"),
    ]);
    return NextResponse.json({ hero, stats, cta, features, testimonials, contact });
  } catch (err) {
    console.error("Admin settings GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

const bodySchema = z.object({ key: z.enum(SETTING_KEYS), value: z.unknown() });

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = bodySchema.safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const value = settingSchemas[body.data.key].safeParse(body.data.value);
    if (!value.success) {
      return NextResponse.json({ error: value.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }

    await db.siteSetting.upsert({
      where: { key: body.data.key },
      create: { key: body.data.key, value: value.data },
      update: { value: value.data },
    });
    return NextResponse.json({ message: "Réglages enregistrés", value: value.data });
  } catch (err) {
    console.error("Admin settings PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
