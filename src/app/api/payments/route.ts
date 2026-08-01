import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  courseId: z.string().min(1),
});

const ONE_HOUR = 3_600_000;
const MAX_PAYMENT_ATTEMPTS = 5;

// ⚠️ NOTE IMPORTANTE : Ceci est un paiement SIMULÉ à des fins de démonstration.
// Aucune donnée de carte bancaire n'est envoyée ni traitée ici — le formulaire
// de paiement est purement visuel côté client. Pour la production, il faut
// intégrer un vrai prestataire (Stripe, PayPal, Orange Money, etc.) qui gère
// lui-même la collecte sécurisée des données de carte (jamais côté serveur maison).
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }
  const userId = (session.user as { userId: string }).userId;

  // Rate limiting: max 5 payment attempts per user per hour
  if (!rateLimit(`payment:${userId}`, MAX_PAYMENT_ATTEMPTS, ONE_HOUR)) {
    return NextResponse.json(
      { success: false, error: "Trop de tentatives de paiement. Veuillez réessayer dans une heure." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 });
    }

    const course = await db.course.findUnique({ where: { id: result.data.courseId } });
    if (!course) {
      return NextResponse.json({ success: false, error: "Cours introuvable" }, { status: 404 });
    }

    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: "Vous êtes déjà inscrit à ce cours" }, { status: 409 });
    }

    // Simule un léger délai de traitement du paiement
    await new Promise((r) => setTimeout(r, 400));

    const payment = await db.payment.create({
      data: {
        userId,
        courseId: course.id,
        amount: course.price,
        status: "completed",
        method: "carte (démo)",
      },
    });

    const enrollment = await db.enrollment.create({
      data: { userId, courseId: course.id },
    });

    await createNotification({
      userId,
      title: "Inscription confirmée",
      message: `Votre paiement pour "${course.title}" a été validé. Bon apprentissage !`,
      type: "success",
      link: "/dashboard",
    });

    return NextResponse.json({
      success: true,
      data: {
        payment,
        enrollment,
        message: "Paiement validé et inscription confirmée",
      },
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
