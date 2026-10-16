import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const ONE_HOUR = 3_600_000;
const MAX_REQUESTS = 20;

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function POST(request: NextRequest) {
  // Rate limiting: max 20 requests per IP per hour
  const ip = getClientIp(request);
  if (!rateLimit(`assistant:${ip}`, MAX_REQUESTS, ONE_HOUR)) {
    return NextResponse.json(
      { success: false, error: "Trop de requêtes. Veuillez réessayer dans une heure." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const message: string = body?.message || "";
    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Le message est requis" }, { status: 400 });
    }

    const msg = normalize(message);

    // --- Prix ---
    if (/(prix|tarif|combien|cout|coute)/.test(msg)) {
      const courses = await db.course.findMany({ orderBy: { level: "asc" }, take: 8 });
      const list = courses.map((c) => `• ${c.title} (${c.level}) — ${c.price}`).join("\n");
      return NextResponse.json({
        success: true,
        data: {
          reply: `Voici nos tarifs actuels :\n${list}\n\nVous pouvez voir tous les détails sur la page "Cours".`,
        },
      });
    }

    // --- Niveaux (A1, B2, etc.) ---
    const levelMatch = msg.match(/\b(a1|a2|b1|b2|c1|c2)\b/);
    if (levelMatch) {
      const level = levelMatch[1].toUpperCase();
      const courses = await db.course.findMany({ where: { level } });
      if (courses.length > 0) {
        const list = courses.map((c) => `• ${c.title} — ${c.duration}, ${c.price}`).join("\n");
        return NextResponse.json({
          success: true,
          data: {
            reply: `Voici nos cours de niveau ${level} :\n${list}\n\nSouhaitez-vous plus de détails sur l'un d'eux ?`,
          },
        });
      }
      return NextResponse.json({
        success: true,
        data: {
          reply: `Nous n'avons pas de cours actif pour le niveau ${level} pour le moment. Consultez la page "Cours" pour voir tous les niveaux disponibles.`,
        },
      });
    }

    // --- Inscription ---
    if (/(inscri|rejoindre|comment commencer|debuter)/.test(msg)) {
      return NextResponse.json({
        success: true,
        data: {
          reply:
            "Pour vous inscrire : créez un compte gratuit, choisissez votre cours sur la page \"Cours\", puis suivez le processus de paiement sécurisé. Vous pouvez commencer dès aujourd'hui !",
        },
      });
    }

    // --- Contact / horaires ---
    if (/(contact|telephone|email|adresse|joindre)/.test(msg)) {
      return NextResponse.json({
        success: true,
        data: {
          reply:
            "Vous pouvez nous contacter via le formulaire sur la page \"Contact\", et notre équipe vous répondra rapidement. Vous pouvez aussi me poser vos questions ici directement !",
        },
      });
    }

    // --- Cours en direct ---
    if (/(direct|live|visio|session)/.test(msg)) {
      return NextResponse.json({
        success: true,
        data: {
          reply:
            "Nous proposons des sessions en direct avec nos formateurs, réservées aux étudiants inscrits. Consultez la page \"Direct\" pour voir les prochaines sessions programmées.",
        },
      });
    }

    // --- Certificat ---
    if (/(certificat|diplome|attestation)/.test(msg)) {
      return NextResponse.json({
        success: true,
        data: {
          reply:
            "Un certificat de réussite est délivré automatiquement dès que vous terminez un cours à 100%. Vous pourrez le télécharger depuis votre tableau de bord.",
        },
      });
    }

    // --- Salutations ---
    if (/^(bonjour|salut|hallo|guten tag|coucou|hey|hi)\b/.test(msg)) {
      return NextResponse.json({
        success: true,
        data: {
          reply:
            "Bonjour ! 👋 Je suis l'assistant de Deutsch-Institut. Je peux vous renseigner sur nos cours, nos tarifs, l'inscription ou nos sessions en direct. Que voulez-vous savoir ?",
        },
      });
    }

    // --- Nombre de cours / catalogue général ---
    if (/(cours|formation|catalogue|apprendre)/.test(msg)) {
      const count = await db.course.count();
      return NextResponse.json({
        success: true,
        data: {
          reply: `Nous proposons ${count} cours d'allemand, du niveau débutant (A1) à avancé (C1), avec des parcours spécialisés (affaires, université, préparation aux examens). Consultez la page "Cours" pour tout voir, ou dites-moi votre niveau (A1 à C1) pour des suggestions précises.`,
        },
      });
    }

    // --- Réponse par défaut ---
    return NextResponse.json({
      success: true,
      data: {
        reply:
          "Je peux vous renseigner sur nos cours, nos tarifs, les niveaux (A1 à C1), l'inscription, les certificats ou nos sessions en direct. Pouvez-vous préciser votre question ? Sinon, n'hésitez pas à utiliser notre page \"Contact\".",
      },
    });
  } catch (error) {
    console.error("Assistant error:", error);
    return NextResponse.json({ success: false, error: "Une erreur est survenue" }, { status: 500 });
  }
}
