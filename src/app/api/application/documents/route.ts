import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/site-content-server";
import { ALLOWED_DOC_MIME, MAX_DOC_BYTES } from "@/lib/admission";
import { DOC_META_SELECT, getSessionInfo, isEditable, matchesSignature } from "@/lib/admission-server";

const MAX_DOCS = 15;

// Dépôt (ou remplacement) d'un document du dossier
export async function POST(request: NextRequest) {
  const me = await getSessionInfo();
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const form = await request.formData();
    const type = String(form.get("type") ?? "");
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });

    const config = await getSetting("admission");
    if (!config.documents.some((d) => d.key === type)) {
      return NextResponse.json({ error: "Type de document inconnu" }, { status: 400 });
    }
    if (!(ALLOWED_DOC_MIME as readonly string[]).includes(file.type)) {
      return NextResponse.json({ error: "Format non accepté (PDF, JPG, PNG ou WebP)" }, { status: 400 });
    }
    if (file.size > MAX_DOC_BYTES) {
      return NextResponse.json({ error: "Fichier trop lourd (maximum 4 Mo)" }, { status: 413 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesSignature(file.type, bytes)) {
      return NextResponse.json({ error: "Le contenu du fichier ne correspond pas à son format" }, { status: 400 });
    }

    // Le dossier est créé à la volée au premier dépôt
    const application = await db.application.upsert({
      where: { userId: me.userId },
      create: { userId: me.userId },
      update: {},
      select: { id: true, status: true },
    });
    if (!isEditable(application.status)) {
      return NextResponse.json({ error: "Votre dossier ne peut plus être modifié pour le moment" }, { status: 409 });
    }

    const existing = await db.applicationDocument.findUnique({
      where: { applicationId_type: { applicationId: application.id, type } },
      select: { id: true, status: true },
    });
    if (existing?.status === "approved") {
      return NextResponse.json({ error: "Ce document a déjà été validé par l'administration" }, { status: 409 });
    }
    if (!existing && (await db.applicationDocument.count({ where: { applicationId: application.id } })) >= MAX_DOCS) {
      return NextResponse.json({ error: "Nombre maximum de documents atteint" }, { status: 400 });
    }

    const data = { filename: file.name.slice(0, 200) || "document", mimeType: file.type, size: bytes.byteLength, data: bytes, status: "pending", adminComment: null, uploadedAt: new Date() };
    const document = await db.applicationDocument.upsert({
      where: { applicationId_type: { applicationId: application.id, type } },
      create: { applicationId: application.id, type, ...data },
      update: data,
      select: DOC_META_SELECT,
    });
    return NextResponse.json({ document, message: "Document enregistré" }, { status: 201 });
  } catch (err) {
    console.error("Application document POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
