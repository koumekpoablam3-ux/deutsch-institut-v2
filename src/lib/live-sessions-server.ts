import { z } from "zod"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notify"
import { LIVE_PLATFORM_VALUES, LIVE_STATUS_VALUES, platformInfo, validateMeetingUrl } from "@/lib/live-platforms"

export const sessionInputSchema = z
  .object({
    courseId: z.string().min(1, "Choisissez un cours"),
    title: z.string().trim().min(1, "Le titre est requis").max(150),
    summary: z.string().trim().max(200).optional().nullable(),
    description: z.string().trim().max(4000).optional().nullable(),
    startAt: z.string().min(1, "La date est requise").refine((v) => !Number.isNaN(new Date(v).getTime()), "Date invalide"),
    durationMinutes: z.coerce.number().int().min(15, "Durée minimale : 15 minutes").max(480, "Durée maximale : 8 heures"),
    platform: z.enum(LIVE_PLATFORM_VALUES).default("jitsi"),
    meetingUrl: z.string().trim().max(500).optional().nullable(),
    status: z.enum(LIVE_STATUS_VALUES).optional(),
  })
  .superRefine((d, ctx) => {
    const err = validateMeetingUrl(d.platform, d.meetingUrl)
    if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err, path: ["meetingUrl"] })
  })

export const statusOnlySchema = z.object({ status: z.enum(LIVE_STATUS_VALUES) })

/** Notifie tous les étudiants inscrits au cours (une notification manquée ne bloque jamais l'action). */
export async function notifyEnrolled(courseId: string, title: string, message: string, type: "info" | "success" | "warning" = "info") {
  const enrollments = await db.enrollment.findMany({ where: { courseId }, select: { userId: true } })
  await Promise.all(enrollments.map((e) => createNotification({ userId: e.userId, title, message, type, link: "/direct" })))
}

export const formatSessionDate = (d: Date) =>
  d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }) + " (GMT)"

export const platformName = (p: string) => platformInfo(p).label.replace(" (intégré au site)", "")
