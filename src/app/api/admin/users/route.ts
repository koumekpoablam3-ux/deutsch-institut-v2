import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
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

const createSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(100),
  telephone: z.string().trim().max(40).optional(),
  niveau: z.enum(["A1", "A2", "B1", "B2"]).default("A1"),
  role: z.enum(["student", "admin"]).default("student"),
});

// Création d'un compte par l'administrateur (étudiant ou autre admin)
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const result = createSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    const { password, telephone, ...rest } = result.data;

    if (await db.user.findUnique({ where: { email: rest.email }, select: { id: true } })) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 });
    }

    const user = await db.user.create({
      data: { ...rest, telephone: telephone || null, password: await bcrypt.hash(password, 12) },
      select: { id: true, name: true, email: true, telephone: true, niveau: true, role: true, createdAt: true, _count: { select: { enrollments: true } } },
    });
    return NextResponse.json({ user, message: "Compte créé" }, { status: 201 });
  } catch (err) {
    console.error("Admin users POST error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
