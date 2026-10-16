import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const updateSchema = z.object({
  status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
  method: z.enum(["carte", "mobile_money", "virement", "espece"]).optional(),
  amount: z.string().trim().min(1, "Le montant est requis").max(40).optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const result = updateSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    const payment = await db.payment.update({
      where: { id },
      data: result.data,
      include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
    });
    return NextResponse.json({ payment, message: "Paiement mis à jour" });
  } catch (err) {
    console.error("Admin payment PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await db.payment.delete({ where: { id } });
    return NextResponse.json({ message: "Paiement supprimé" });
  } catch (err) {
    console.error("Admin payment DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
