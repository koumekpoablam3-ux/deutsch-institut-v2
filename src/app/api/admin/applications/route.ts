import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { getSetting } from "@/lib/site-content-server";

// Liste des dossiers (les plus urgents d'abord : « à vérifier », puis les corrections, puis le reste)
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [rows, config] = await Promise.all([
      db.application.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, telephone: true } },
          documents: { select: { type: true, status: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      getSetting("admission"),
    ]);
    const requiredKeys = config.documents.filter((d) => d.required).map((d) => d.key);
    const order: Record<string, number> = { submitted: 0, needs_changes: 1, draft: 2, accepted: 3, rejected: 4 };

    const applications = rows
      .map((a: (typeof rows)[number]) => ({
        id: a.id,
        status: a.status,
        currentStep: a.currentStep,
        submittedAt: a.submittedAt,
        updatedAt: a.updatedAt,
        user: a.user,
        pathway: (a.data as { pathway?: string } | null)?.pathway ?? null,
        docCount: a.documents.length,
        requiredTotal: requiredKeys.length,
        requiredApproved: requiredKeys.filter((k) => a.documents.some((d: { type: string; status: string }) => d.type === k && d.status === "approved")).length,
      }))
      .sort((x: { status: string; updatedAt: Date }, y: { status: string; updatedAt: Date }) => (order[x.status] ?? 9) - (order[y.status] ?? 9) || +new Date(y.updatedAt) - +new Date(x.updatedAt));

    return NextResponse.json({ applications });
  } catch (err) {
    console.error("Admin applications GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue (la table Application existe-t-elle ? Lancez npm run db:push)" }, { status: 500 });
  }
}
