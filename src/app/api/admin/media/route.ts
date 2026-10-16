import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const MAX_SIZE = 4 * 1024 * 1024; // 4 Mo (limite de corps de requête des fonctions Vercel : 4,5 Mo)
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

// Vérifie la signature réelle du fichier (et pas seulement le type annoncé par le navigateur)
function matchesSignature(mime: string, b: Uint8Array): boolean {
  const startsWith = (...bytes: number[]) => bytes.every((v, i) => b[i] === v);
  switch (mime) {
    case "image/jpeg": return startsWith(0xff, 0xd8, 0xff);
    case "image/png": return startsWith(0x89, 0x50, 0x4e, 0x47);
    case "image/gif": return startsWith(0x47, 0x49, 0x46, 0x38);
    case "image/webp": return startsWith(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
    case "image/svg+xml": return new TextDecoder().decode(b.slice(0, 1024)).toLowerCase().includes("<svg");
    default: return false;
  }
}

// Liste des images (sans le contenu binaire)
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const rows = await db.media.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, filename: true, mimeType: true, size: true, createdAt: true },
    });
    return NextResponse.json({ media: rows.map((m) => ({ ...m, url: `/api/media/${m.id}` })) });
  } catch (err) {
    console.error("Admin media GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Format non accepté (JPG, PNG, WebP, GIF ou SVG)" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image trop lourde (maximum 4 Mo)" }, { status: 413 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesSignature(file.type, bytes)) {
      return NextResponse.json({ error: "Le contenu du fichier ne correspond pas à une image valide" }, { status: 400 });
    }

    const media = await db.media.create({
      data: { filename: file.name.slice(0, 200) || "image", mimeType: file.type, size: bytes.byteLength, data: bytes },
      select: { id: true, filename: true, mimeType: true, size: true, createdAt: true },
    });
    return NextResponse.json({ media: { ...media, url: `/api/media/${media.id}` }, message: "Image enregistrée" }, { status: 201 });
  } catch (err) {
    console.error("Admin media POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
