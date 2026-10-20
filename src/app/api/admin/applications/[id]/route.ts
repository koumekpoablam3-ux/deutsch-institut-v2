import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { getSetting } from "@/lib/site-content-server";
import { createNotification } from "@/lib/notify";

const DOC_SELECT = { id: true, type: true, filename: true, mimeType: true, size: true, status: true, adminComment: true, uploadedAt: true } as const;

// Détail d'un dossier : informations saisies, documents (sans le contenu binaire), réglages
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const [application, config] = await Promise.all([
      db.application.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true, telephone: true, createdAt: true } },
          documents: { select: DOC_SELECT, orderBy: { uploadedAt: "asc" } },
        },
      }),
      getSetting("admission"),
    ]);
    if (!application) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });

    const courseId = (application.data as { courseId?: string } | null)?.courseId;
    const course = courseId ? await db.course.findUnique({ where: { id: courseId }, select: { title: true } }) : null;
    return NextResponse.json({ application, documentSpecs: config.documents, courseTitle: course?.title ?? null });
  } catch (err) {
    console.error("Admin application GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

const actionSchema = z.object({
  action: z.enum(["accept", "request_changes", "reject", "reopen"]),
  message: z.string().trim().max(1000).optional(),
});

// Décision de l'admin sur le dossier
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const parsed = actionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    const { action } = parsed.data;
    const message = parsed.data.message || null;
    const adminId = (session!.user as { userId?: string }).userId ?? null;

    const [application, config] = await Promise.all([
      db.application.findUnique({ where: { id }, include: { documents: { select: { type: true, status: true } } } }),
      getSetting("admission"),
    ]);
    if (!application) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });

    if (action === "accept") {
      if (application.status !== "submitted") {
        return NextResponse.json({ error: "Seul un dossier envoyé par l'étudiant peut être accepté" }, { status: 400 });
      }
      // L'admin doit avoir vérifié (validé) chaque document obligatoire avant d'accepter
      const notApproved = config.documents.filter(
        (d) => d.required && !application.documents.some((x: { type: string; status: string }) => x.type === d.key && x.status === "approved")
      );
      if (notApproved.length > 0) {
        return NextResponse.json(
          { error: `Validez d'abord ces documents obligatoires : ${notApproved.map((d) => d.label).join(", ")}` },
          { status: 400 }
        );
      }
    }
    if ((action === "request_changes" || action === "reject") && !message) {
      return NextResponse.json({ error: action === "reject" ? "Indiquez le motif du refus" : "Indiquez ce que l'étudiant doit corriger" }, { status: 400 });
    }
    if (action === "request_changes" && application.status !== "submitted") {
      return NextResponse.json({ error: "Seul un dossier envoyé peut faire l'objet d'une demande de corrections" }, { status: 400 });
    }

    const status = { accept: "accepted", request_changes: "needs_changes", reject: "rejected", reopen: "submitted" }[action];
    const updated = await db.application.update({
      where: { id },
      data: {
        status,
        adminNote: action === "accept" ? message : action === "reopen" ? null : message,
        reviewedAt: action === "reopen" ? null : new Date(),
        reviewedById: action === "reopen" ? null : adminId,
      },
      select: { id: true, status: true, adminNote: true, reviewedAt: true },
    });

    const notif = {
      accept: { title: "Dossier accepté", message: "Votre dossier est validé. Vous pouvez maintenant vous inscrire à un cours.", type: "success" as const, link: "/cours" },
      request_changes: { title: "Corrections demandées sur votre dossier", message: message ?? "", type: "warning" as const, link: "/dossier" },
      reject: { title: "Dossier refusé", message: message ?? "", type: "error" as const, link: "/dossier" },
      reopen: null,
    }[action];
    if (notif) await createNotification({ userId: application.userId, ...notif });

    return NextResponse.json({ application: updated, message: "Décision enregistrée" });
  } catch (err) {
    console.error("Admin application PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await db.application.delete({ where: { id } });
    return NextResponse.json({ message: "Dossier supprimé" });
  } catch (err) {
    console.error("Admin application DELETE error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
