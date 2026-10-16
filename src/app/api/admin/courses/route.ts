import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const courseSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z
    .string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit être en minuscules, sans espaces ni accents (ex: mon-cours-a1)"),
  level: z.string().min(1),
  lessons: z.coerce.number().int().min(1),
  duration: z.string().min(1),
  price: z.string().min(1),
  badge: z.string().optional().nullable(),
  badgeColor: z.string().optional().nullable(),
  image: z.string().min(1),
  description: z.string().min(1),
  objectives: z.string().min(1),
  prerequisites: z.string().optional().nullable(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const courses = await db.course.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { enrollments: true } } },
    });
    return NextResponse.json({ courses });
  } catch (err) {
    console.error("Admin courses GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const result = courseSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    const existing = await db.course.findUnique({ where: { slug: result.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Un cours avec ce slug existe déjà" }, { status: 409 });
    }

    const course = await db.course.create({
      data: {
        ...result.data,
        badge: result.data.badge || null,
        badgeColor: result.data.badgeColor || null,
        prerequisites: result.data.prerequisites || null,
      },
    });

    return NextResponse.json({ course, message: "Cours créé avec succès" }, { status: 201 });
  } catch (err) {
    console.error("Admin courses POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
