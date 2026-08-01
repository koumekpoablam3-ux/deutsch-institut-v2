import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        telephone: true,
        niveau: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    });
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Admin users GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
