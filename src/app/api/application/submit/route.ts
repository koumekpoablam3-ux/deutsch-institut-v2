import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/site-content-server";
import { applicationDataSchema, validateApplicationForSubmit } from "@/lib/admission";
import { getSessionInfo, isEditable, notifyAdmins } from "@/lib/admission-server";
import { createNotification } from "@/lib/notify";

export async function POST() {
  const me = await getSessionInfo();
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const [application, config, user] = await Promise.all([
      db.application.findUnique({ where: { userId: me.userId }, include: { documents: { select: { type: true, status: true } } } }),
      getSetting("admission"),
      db.user.findUnique({ where: { id: me.userId }, select: { name: true } }),
    ]);
    if (!application) return NextResponse.json({ error: "Commencez par remplir votre dossier" }, { status: 400 });
    if (!isEditable(application.status)) return NextResponse.json({ error: "Votre dossier a déjà été envoyé" }, { status: 409 });

    const data = applicationDataSchema.parse(application.data ?? {});
    const problems = validateApplicationForSubmit(data, application.documents.map((d: { type: string }) => d.type), config.documents);
    if (problems.length > 0) {
      return NextResponse.json({ error: problems[0], problems }, { status: 400 });
    }

    // Documents refusés qui n'ont pas été remplacés : on ne laisse pas partir un dossier incomplet
    const stillRejected = application.documents.filter((d: { status: string }) => d.status === "rejected");
    if (stillRejected.length > 0) {
      return NextResponse.json({ error: "Remplacez les documents refusés avant de renvoyer votre dossier" }, { status: 400 });
    }

    await db.application.update({
      where: { id: application.id },
      data: { status: "submitted", submittedAt: new Date(), adminNote: null, currentStep: 5 },
    });

    await notifyAdmins("Nouveau dossier à vérifier", `${user?.name ?? "Un candidat"} a envoyé son dossier d'inscription.`);
    await createNotification({
      userId: me.userId,
      title: "Dossier envoyé",
      message: "Votre dossier d'inscription a bien été envoyé. Notre équipe le vérifie et vous répondra rapidement.",
      type: "success",
      link: "/dossier",
    });
    return NextResponse.json({ message: "Dossier envoyé" });
  } catch (err) {
    console.error("Application submit error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
