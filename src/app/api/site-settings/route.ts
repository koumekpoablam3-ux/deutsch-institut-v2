import { NextResponse } from "next/server";
import { getSetting } from "@/lib/site-content-server";

// Réglages publics du site (coordonnées, pied de page, WhatsApp). Mis en cache 15 s côté CDN.
export async function GET() {
  const contact = await getSetting("contact");
  return NextResponse.json(
    { contact },
    { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } }
  );
}
