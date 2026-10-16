import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit être en minuscules, sans espaces ni accents"),
  excerpt: z.string().min(1, "Le résumé est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  coverImage: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const articles = await db.article.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    });
    return NextResponse.json({ articles });
  } catch (err) {
    console.error("Admin articles GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    const existing = await db.article.findUnique({ where: { slug: result.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Un article avec ce slug existe déjà" }, { status: 409 });
    }

    const userId = (session!.user as { userId: string }).userId;

    const article = await db.article.create({
      data: {
        title: result.data.title,
        slug: result.data.slug,
        excerpt: result.data.excerpt,
        content: result.data.content,
        coverImage: result.data.coverImage || null,
        published: result.data.published ?? true,
        authorId: userId,
      },
    });

    return NextResponse.json({ article, message: "Article créé avec succès" }, { status: 201 });
  } catch (err) {
    console.error("Admin articles POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
