import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  comment: z.string().trim().max(500).optional(),
});

// Vérification d'un document : validé ou refusé (le refus doit être motivé)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id, docId } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    if (parsed.data.status === "rejected" && !parsed.data.comment) {
      return NextResponse.json({ error: "Indiquez pourquoi le document est refusé" }, { status: 400 });
    }

    const doc = await db.applicationDocument.findUnique({ where: { id: docId }, select: { applicationId: true, application: { select: { status: true } } } });
    if (!doc || doc.applicationId !== id) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    if (doc.application.status === "draft") return NextResponse.json({ error: "Le dossier n'a pas encore été envoyé par l'étudiant" }, { status: 400 });

    const document = await db.applicationDocument.update({
      where: { id: docId },
      data: { status: parsed.data.status, adminComment: parsed.data.status === "approved" ? null : parsed.data.comment || null },
      select: { id: true, type: true, status: true, adminComment: true },
    });
    return NextResponse.json({ document, message: "Document mis à jour" });
  } catch (err) {
    console.error("Admin application document PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
