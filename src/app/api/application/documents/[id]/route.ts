import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionInfo, isEditable } from "@/lib/admission-server";

// Lecture d'un document : réservée à son propriétaire et aux administrateurs
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionInfo();
  if (!me) return new NextResponse("Non autorisé", { status: 401 });

  try {
    const { id } = await params;
    const doc = await db.applicationDocument.findUnique({
      where: { id },
      select: { data: true, mimeType: true, filename: true, application: { select: { userId: true } } },
    });
    if (!doc || (me.role !== "admin" && doc.application.userId !== me.userId)) {
      return new NextResponse("Document introuvable", { status: 404 });
    }
    return new NextResponse(new Uint8Array(doc.data), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.filename)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Application document GET error:", err);
    return new NextResponse("Erreur", { status: 500 });
  }
}

// Suppression d'un document (tant que le dossier est modifiable et que le document n'est pas validé)
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionInfo();
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { id } = await params;
    const doc = await db.applicationDocument.findUnique({
      where: { id },
      select: { status: true, application: { select: { userId: true, status: true } } },
    });
    if (!doc || doc.application.userId !== me.userId) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    if (!isEditable(doc.application.status)) return NextResponse.json({ error: "Votre dossier ne peut plus être modifié pour le moment" }, { status: 409 });
    if (doc.status === "approved") return NextResponse.json({ error: "Ce document a déjà été validé par l'administration" }, { status: 409 });

    await db.applicationDocument.delete({ where: { id } });
    return NextResponse.json({ message: "Document supprimé" });
  } catch (err) {
    console.error("Application document DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
