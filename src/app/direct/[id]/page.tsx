"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, Lock } from "lucide-react"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

interface LiveSession {
  id: string
  title: string
  roomName: string
  course: { title: string; slug: string }
}

export default function LiveRoomPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [session, setSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    (async () => {
      try {
        const authRes = await fetch("/api/auth/session")
        const authSession = await authRes.json()
        if (!authSession?.user) { router.push("/login"); return }

        const res = await fetch(`/api/live-sessions/${id}`)
        const data = await res.json()
        if (res.ok) setSession(data.data?.session)
        else setError(data.error || "Impossible de rejoindre cette session")
      } catch { setError("Erreur de connexion") }
      finally { setLoading(false) }
    })()
  }, [id, router])

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 bg-[#050d1a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/direct" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Retour aux sessions
          </Link>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
          ) : error ? (
            <div className="bg-[#132d4a] rounded-2xl p-12 text-center max-w-md mx-auto">
              <Lock className="h-10 w-10 text-[#D4A843] mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">Accès non disponible</p>
              <p className="text-white/50 text-sm">{error}</p>
            </div>
          ) : session ? (
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{session.title}</h1>
              <p className="text-white/40 text-sm mb-4">{session.course.title}</p>
              <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                <iframe
                  title="Salle de visioconférence"
                  src={`https://meet.jit.si/${session.roomName}`}
                  className="w-full h-full border-0"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                />
              </div>
              <p className="text-white/30 text-xs mt-3 text-center">
                Propulsé par Jitsi Meet — aucune installation requise, votre navigateur vous demandera l&apos;accès à la caméra/micro.
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  )
}
