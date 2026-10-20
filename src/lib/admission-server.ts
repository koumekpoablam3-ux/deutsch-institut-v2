import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { createNotification } from "@/lib/notify"
import { getSetting } from "@/lib/site-content-server"
import type { ApplicationStatus } from "@/lib/admission"

export const DOC_META_SELECT = {
  id: true, type: true, filename: true, mimeType: true, size: true, status: true, adminComment: true, uploadedAt: true,
} as const

export interface SessionInfo { userId: string; role: string }

/** Utilisateur connecté (ou null). */
export async function getSessionInfo(): Promise<SessionInfo | null> {
  const session = await auth()
  const u = session?.user as { userId?: string; role?: string } | undefined
  return u?.userId ? { userId: u.userId, role: u.role || "student" } : null
}

export const isEditable = (status: string) => status === "draft" || status === "needs_changes"

/**
 * Un étudiant peut s'inscrire à un cours seulement si son dossier est accepté.
 * Exceptions : les admins, le cas où l'admin a désactivé l'exigence de dossier,
 * et les étudiants déjà inscrits à un cours avant la mise en place du dossier.
 */
export async function getAdmissionState(userId: string, role: string) {
  try {
    const admission = await getSetting("admission")
    const application = await db.application.findUnique({ where: { userId }, select: { status: true } })
    const status = (application?.status ?? "none") as ApplicationStatus | "none"

    let canEnroll = role === "admin" || !admission.required || status === "accepted"
    if (!canEnroll && !application) {
      const legacy = await db.enrollment.count({ where: { userId } })
      canEnroll = legacy > 0
    }
    return { required: admission.required, status, canEnroll }
  } catch (err) {
    // Table Application pas encore créée (npm run db:push à faire) : on ne bloque personne en attendant
    console.error("getAdmissionState error:", err)
    return { required: false, status: "none" as const, canEnroll: true }
  }
}

/** À appeler avant de créer une inscription : retourne une réponse d'erreur 403 si le dossier n'est pas validé. */
export async function assertCanEnroll(userId: string, role: string) {
  const state = await getAdmissionState(userId, role)
  if (state.canEnroll) return null
  return NextResponse.json(
    { success: false, error: "Votre dossier d'inscription doit être validé par l'administration avant de vous inscrire à un cours.", code: "APPLICATION_REQUIRED" },
    { status: 403 }
  )
}

export async function notifyAdmins(title: string, message: string) {
  const admins = await db.user.findMany({ where: { role: "admin" }, select: { id: true } })
  await Promise.all(admins.map((a) => createNotification({ userId: a.id, title, message, type: "info", link: "/admin?tab=dossiers" })))
}

/** Vérifie la signature réelle du fichier (et pas seulement le type annoncé par le navigateur). */
export function matchesSignature(mime: string, b: Uint8Array): boolean {
  const starts = (...bytes: number[]) => bytes.every((v, i) => b[i] === v)
  switch (mime) {
    case "application/pdf": return starts(0x25, 0x50, 0x44, 0x46)
    case "image/jpeg": return starts(0xff, 0xd8, 0xff)
    case "image/png": return starts(0x89, 0x50, 0x4e, 0x47)
    case "image/webp": return starts(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
    default: return false
  }
}
