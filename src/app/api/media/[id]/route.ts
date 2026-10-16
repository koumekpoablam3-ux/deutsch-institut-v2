import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Sert une image stockée en base. Publique (les images s'affichent sur le site).
// L'identifiant est unique et le contenu ne change jamais : cache navigateur/CDN longue durée.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const media = await db.media.findUnique({ where: { id }, select: { data: true, mimeType: true } });
    if (!media) return new NextResponse("Image introuvable", { status: 404 });

    return new NextResponse(new Uint8Array(media.data), {
      headers: {
        "Content-Type": media.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // Empêche l'exécution de scripts si un SVG est ouvert directement
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch (err) {
    console.error("Media GET error:", err);
    return new NextResponse("Erreur", { status: 500 });
  }
}
