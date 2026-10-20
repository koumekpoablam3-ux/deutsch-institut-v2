import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/site-content-server";
import { applicationDataSchema, FIRST_FORM_STEP, LAST_STEP, isValidBirthDate } from "@/lib/admission";
import { DOC_META_SELECT, getAdmissionState, getSessionInfo, isEditable } from "@/lib/admission-server";

// Dossier de l'étudiant connecté + réglages (documents demandés) + liste des cours pour le choix du cours souhaité
export async function GET() {
  const me = await getSessionInfo();
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const [application, config, courses, user, state] = await Promise.all([
      db.application.findUnique({
        where: { userId: me.userId },
        select: {
          id: true, status: true, currentStep: true, data: true, adminNote: true, submittedAt: true, reviewedAt: true,
          documents: { select: DOC_META_SELECT, orderBy: { uploadedAt: "asc" } },
        },
      }),
      getSetting("admission"),
      db.course.findMany({ select: { id: true, title: true, level: true }, orderBy: { level: "asc" } }),
      db.user.findUnique({ where: { id: me.userId }, select: { name: true, email: true, telephone: true } }),
      getAdmissionState(me.userId, me.role),
    ]);
    return NextResponse.json({ application, config, courses, user, canEnroll: state.canEnroll });
  } catch (err) {
    console.error("Application GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

// Enregistre le brouillon (fusionne les nouvelles valeurs avec celles déjà saisies)
export async function PUT(request: NextRequest) {
  const me = await getSessionInfo();
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = applicationDataSchema.safeParse(body.data ?? {});
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Données invalides" }, { status: 400 });
    }
    if (parsed.data.birthDate && !isValidBirthDate(parsed.data.birthDate)) {
      return NextResponse.json({ error: "La date de naissance est invalide" }, { status: 400 });
    }
    const step = Math.min(LAST_STEP, Math.max(FIRST_FORM_STEP, Number(body.currentStep) || FIRST_FORM_STEP));

    const existing = await db.application.findUnique({ where: { userId: me.userId } });
    if (existing && !isEditable(existing.status)) {
      return NextResponse.json({ error: "Votre dossier ne peut plus être modifié pour le moment" }, { status: 409 });
    }

    // Un cours choisi doit exister
    if (parsed.data.courseId) {
      const course = await db.course.findUnique({ where: { id: parsed.data.courseId }, select: { id: true } });
      if (!course) delete parsed.data.courseId;
    }

    const merged = { ...((existing?.data as object) ?? {}), ...parsed.data };
    const application = await db.application.upsert({
      where: { userId: me.userId },
      create: { userId: me.userId, data: merged, currentStep: step },
      update: { data: merged, currentStep: Math.max(step, existing?.currentStep ?? FIRST_FORM_STEP) },
      select: { id: true, status: true, currentStep: true, data: true },
    });
    return NextResponse.json({ application, message: "Dossier enregistré" });
  } catch (err) {
    console.error("Application PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
