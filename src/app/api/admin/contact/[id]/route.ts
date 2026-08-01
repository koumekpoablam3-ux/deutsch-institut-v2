import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const patchSchema = z.object({
  read: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const message = await db.contactMessage.update({
      where: { id },
      data: { read: result.data.read },
    });

    return NextResponse.json({ message });
  } catch (err) {
    console.error("Admin contact PATCH error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await db.contactMessage.delete({ where: { id } });
    return NextResponse.json({ message: "Message supprimé" });
  } catch (err) {
    console.error("Admin contact DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
