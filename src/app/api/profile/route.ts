import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  telephone: z.string().optional(),
  niveau: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères").optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        telephone: true,
        niveau: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
    }
    const userId = (session.user as { userId: string }).userId;

    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const { name, telephone, niveau, currentPassword, newPassword } = result.data;

    const dataToUpdate: {
      name?: string;
      telephone?: string | null;
      niveau?: string;
      password?: string;
    } = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (telephone !== undefined) dataToUpdate.telephone = telephone || null;
    if (niveau !== undefined) dataToUpdate.niveau = niveau;

    // Changement de mot de passe : on exige l'ancien mot de passe pour confirmer
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Veuillez saisir votre mot de passe actuel pour le modifier" },
          { status: 400 }
        );
      }

      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user || !user.password) {
        return NextResponse.json({ success: false, error: "Utilisateur introuvable" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Le mot de passe actuel est incorrect" },
          { status: 400 }
        );
      }

      dataToUpdate.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        telephone: true,
        niveau: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, data: { user: updated, message: "Profil mis à jour avec succès" } });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
