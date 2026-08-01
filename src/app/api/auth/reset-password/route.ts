import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  token: z.string().min(1, "Token manquant"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: "Ce lien de réinitialisation est invalide." },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { success: false, error: "Ce lien de réinitialisation a expiré. Veuillez en redemander un." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Le token ne doit servir qu'une seule fois
    await db.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });

    return NextResponse.json({
      success: true,
      message: "Votre mot de passe a été réinitialisé avec succès.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
