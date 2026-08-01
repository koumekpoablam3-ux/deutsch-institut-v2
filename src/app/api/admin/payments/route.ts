import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const payments = await db.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    });
    return NextResponse.json({ payments });
  } catch (err) {
    console.error("Admin payments GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
