import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const moduleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(["pdf", "video", "text", "link"]).default("text"),
  content: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  // Fichier encodé en base64 (data URL ou base64 brut), taille limitée côté client
  fileData: z.string().optional().nullable(),
  order: z.coerce.number().int().min(0).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const modules = await db.courseModule.findMany({
      where: { courseId: id },
      orderBy: { order: "asc" },
      select: {
        id: true, title: true, type: true, content: true, fileName: true,
        order: true, createdAt: true,
        // On ne renvoie jamais fileData en liste (peut être volumineux) : voir /[moduleId] pour le détail
      },
    });
    return NextResponse.json({ modules });
  } catch (err) {
    console.error("Admin modules GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const course = await db.course.findUnique({ where: { id } });
    if (!course) return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });

    const body = await request.json();
    const result = moduleSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json({ error: firstError?.message || "Données invalides" }, { status: 400 });
    }

    if (result.data.type === "pdf" && !result.data.fileData) {
      return NextResponse.json({ error: "Merci d'importer un fichier PDF" }, { status: 400 });
    }
    if (result.data.fileData && result.data.fileData.length > 4_200_000) {
      return NextResponse.json({ error: "Le fichier est trop volumineux (3 Mo maximum)" }, { status: 413 });
    }

    let order = result.data.order;
    if (order === undefined) {
      const last = await db.courseModule.findFirst({ where: { courseId: id }, orderBy: { order: "desc" } });
      order = last ? last.order + 1 : 0;
    }

    const module_ = await db.courseModule.create({
      data: {
        courseId: id,
        title: result.data.title,
        type: result.data.type,
        content: result.data.content || null,
        fileName: result.data.fileName || null,
        fileData: result.data.fileData || null,
        order,
      },
      select: { id: true, title: true, type: true, content: true, fileName: true, order: true, createdAt: true },
    });

    return NextResponse.json({ module: module_, message: "Module ajouté avec succès" });
  } catch (err) {
    console.error("Admin modules POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
