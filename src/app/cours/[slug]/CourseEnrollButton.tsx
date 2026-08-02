"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CourseEnrollButton({ courseId, slug, price }: { courseId: string; slug: string; price: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "enrolled" | "not_logged_in" | "available">("loading")

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
        setStatus(isEnrolled ? "enrolled" : "available")
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
          Accéder au cours →
        </Button>
      ) : status === "not_logged_in" ? (
        <Button onClick={() => router.push("/login")} className="w-full bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold h-12 text-base">
          Connectez-vous pour vous inscrire
        </Button>
      ) : (
        <Button onClick={() => router.push(`/cours/${slug}/paiement`)} className="w-full bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold h-12 text-base">
          S&apos;inscrire maintenant
        </Button>
      )}
    </div>
  )
}