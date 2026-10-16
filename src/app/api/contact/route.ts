import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const contactSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("L'email est invalide"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  niveau: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

const ONE_HOUR = 3_600_000;
const MAX_MESSAGES = 5;

export async function POST(request: NextRequest) {
  // Rate limiting: max 5 messages per IP per hour
  const ip = getClientIp(request);
  if (!rateLimit(`contact:${ip}`, MAX_MESSAGES, ONE_HOUR)) {
    return NextResponse.json(
      { success: false, error: "Trop de messages envoyés. Veuillez réessayer dans une heure." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return NextResponse.json(
        { success: false, error: firstError?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const validated = result.data;

    await db.contactMessage.create({
      data: {
        nom: validated.nom,
        prenom: validated.prenom,
        email: validated.email,
        telephone: validated.telephone,
        niveau: validated.niveau || null,
        message: validated.message,
      },
    });

    return NextResponse.json(
      { success: true, data: { message: "Votre message a été envoyé avec succès !" } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
