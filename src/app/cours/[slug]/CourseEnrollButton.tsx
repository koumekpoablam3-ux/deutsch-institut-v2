"use client"

import { useI18n } from "@/i18n/I18nProvider"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CourseEnrollButton({ courseId, slug, price }: { courseId: string; slug: string; price: string }) {
  const { t } = useI18n()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "enrolled" | "not_logged_in" | "available" | "dossier">("loading")
  const [dossierStatus, setDossierStatus] = useState("none")

  useEffect(() => {
    checkStatus()
  }, [courseId])

  const checkStatus = async () => {
    try {
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()
      if (!session?.user) { setStatus("not_logged_in"); return }

      const enrollRes = await fetch("/api/enrollments")
      if (enrollRes.ok) {
        const data = await enrollRes.json()
        const isEnrolled = (data.data?.enrollments || []).some((e: { courseId: string }) => e.courseId === courseId)
        if (isEnrolled) { setStatus("enrolled"); return }

        // Le dossier d'inscription doit être accepté avant de pouvoir s'inscrire
        const dossierRes = await fetch("/api/application/status")
        if (dossierRes.ok) {
          const dossier = await dossierRes.json()
          if (dossier.needsDossier) { setDossierStatus(dossier.status); setStatus("dossier"); return }
        }
        setStatus("available")
      } else { setStatus("available") }
    } catch { setStatus("available") }
  }

  if (status === "loading") {
    return <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 text-[#D4A843] animate-spin" /></div>
  }

  return (
    <div>
      <p className="text-3xl font-extrabold text-[#1B3A5C] dark:text-[#D4A843] mb-4">{price}</p>
      {status === "enrolled" ? (
        <Button onClick={() => router.push(`/cours/${slug}/apprendre`)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-base">
          {t("Accéder au cours →")}
        </Button>
      ) : status === "dossier" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#1B3A5C]/70 dark:text-white/60">
            {dossierStatus === "submitted"
              ? t("Votre dossier est en cours de vérification. Vous pourrez vous inscrire dès qu'il sera accepté.")
              : t("Pour vous inscrire, votre dossier d'inscription doit d'abord être complété et validé par notre équipe.")}
          </p>
          <Button onClick={() => router.push("/dossier")} className="w-full bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold h-12 text-base">
            {dossierStatus === "submitted" ? t("Suivre mon dossier") : t("Compléter mon dossier")}
          </Button>
        </div>
      ) : status === "not_logged_in" ? (
        <Button onClick={() => router.push("/login")} className="w-full bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold h-12 text-base">
          {t("Connectez-vous pour vous inscrire")}
        </Button>
      ) : (
        <Button onClick={() => router.push(`/cours/${slug}/paiement`)} className="w-full bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold h-12 text-base">
          {t("S'inscrire maintenant")}
        </Button>
      )}
    </div>
  )
}