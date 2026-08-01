import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email("Email invalide"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Email invalide" },
        { status: 400 }
      );
    }

    const { email } = result.data;

    const user = await db.user.findUnique({ where: { email } });

    // On répond toujours avec le même message, que le compte existe ou non,
    // pour ne pas laisser un tiers deviner quels emails sont enregistrés.
    const genericMessage =
      "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.";

    if (!user) {
      return NextResponse.json({ success: true, data: { message: genericMessage } });
    }

    // Supprime les anciens tokens de cet utilisateur
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // valable 1h

    await db.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // ⚠️ NOTE IMPORTANTE POUR LA PRODUCTION :
    // Aucun service d'envoi d'email (SMTP, Resend, SendGrid...) n'est configuré
    // dans ce projet. Pour l'instant, le lien est simplement loggé côté serveur.
    // En production, il faut brancher un vrai service d'email ici.
    console.log(`[Reset de mot de passe] Lien pour ${email} : ${resetLink}`);

    return NextResponse.json({
      success: true,
      data: { message: genericMessage },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
