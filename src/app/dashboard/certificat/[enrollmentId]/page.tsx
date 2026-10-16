"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, GraduationCap, Printer, ArrowLeft, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Certificate {
  studentName: string
  courseTitle: string
  courseLevel: string
  lessons: number
  duration: string
  completedAt: string
  certificateId: string
}

export default function CertificatePage() {
  const params = useParams()
  const router = useRouter()
  const enrollmentId = params.enrollmentId as string

  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/certificat/${enrollmentId}`)
        const data = await res.json()
        if (res.ok) setCert(data.data?.certificate)
        else setError(data.error || "Certificat indisponible")
      } catch { setError("Erreur de connexion") }
      finally { setLoading(false) }
    })()
  }, [enrollmentId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center max-w-md shadow-sm">
          <Award className="h-10 w-10 text-[#1B3A5C]/20 mx-auto mb-3" />
          <p className="font-semibold text-[#1B3A5C] dark:text-gray-100 mb-2">Certificat non disponible</p>
          <p className="text-sm text-[#1B3A5C]/50 dark:text-gray-400 mb-5">{error}</p>
          <Button onClick={() => router.push("/dashboard")} className="bg-[#1B3A5C] text-white">Retour au tableau de bord</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#1B3A5C]/60 dark:text-gray-400 hover:text-[#1B3A5C] dark:hover:text-gray-100 text-sm">
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>
        <Button onClick={() => window.print()} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
          <Printer className="h-4 w-4 mr-2" /> Imprimer / Télécharger en PDF
        </Button>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg print:shadow-none" style={{ aspectRatio: "1.414 / 1" }}>
        <div className="h-full w-full border-[10px] border-double border-[#D4A843] p-10 sm:p-14 flex flex-col items-center justify-between text-center">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-[#1B3A5C] flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-[#D4A843]" />
            </div>
            <p className="text-xs tracking-[0.3em] text-[#1B3A5C]/50 font-semibold uppercase">Deutsch-Institut</p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1B3A5C] dark:text-gray-100 mt-3">Certificat de réussite</h1>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-sm text-[#1B3A5C]/60 dark:text-gray-400 mb-2">Ce certificat est décerné à</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#D4A843] font-serif mb-4">{cert.studentName}</p>
            <p className="text-sm text-[#1B3A5C]/70 dark:text-gray-300 max-w-md leading-relaxed">
              pour avoir complété avec succès le cours<br />
              <span className="font-bold text-[#1B3A5C] dark:text-gray-100">« {cert.courseTitle} »</span><br />
              niveau {cert.courseLevel} · {cert.lessons} leçons · {cert.duration}
            </p>
          </div>

          <div className="w-full flex items-end justify-between text-xs text-[#1B3A5C]/50 dark:text-gray-400">
            <div className="text-left">
              <p className="border-t border-[#1B3A5C]/30 dark:border-gray-600 pt-1.5">
                Délivré le {new Date(cert.completedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="text-right">
              <p className="border-t border-[#1B3A5C]/30 dark:border-gray-600 pt-1.5">N° {cert.certificateId.slice(0, 10).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
