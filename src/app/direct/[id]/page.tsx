"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, Lock, ExternalLink, Calendar, Clock, Ban } from "lucide-react"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import { platformInfo, youtubeEmbedUrl } from "@/lib/live-platforms"

interface LiveSession {
  id: string
  title: string
  summary: string | null
  description: string | null
  startAt: string
  durationMinutes: number
  platform: string
  meetingUrl: string | null
  status: string
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

  const info = session ? platformInfo(session.platform) : null
  const platformLabel = info ? info.label.replace(" (intégré au site)", "") : ""
  const closed = session?.status === "ended" || session?.status === "cancelled"
  const embedUrl = session?.platform === "youtube" ? youtubeEmbedUrl(session.meetingUrl) : null

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
              <p className="text-white/40 text-sm mb-1">{session.course.title} · via {platformLabel}</p>
              <p className="flex items-center gap-4 text-white/40 text-xs mb-4">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(session.startAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{new Date(session.startAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {session.durationMinutes} min</span>
              </p>

              {closed ? (
                <div className="bg-[#132d4a] rounded-2xl p-12 text-center max-w-md mx-auto">
                  <Ban className="h-10 w-10 text-[#D4A843] mx-auto mb-3" />
                  <p className="text-white font-semibold mb-2">{session.status === "cancelled" ? "Session annulée" : "Session terminée"}</p>
                  <p className="text-white/50 text-sm">Consultez la liste des prochaines sessions pour en rejoindre une autre.</p>
                </div>
              ) : session.platform === "jitsi" ? (
                <>
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
                </>
              ) : embedUrl ? (
                <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                  <iframe title="YouTube Live" src={embedUrl} className="w-full h-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                </div>
              ) : session.meetingUrl ? (
                // Zoom, Google Meet, StreamYard (et YouTube sans lien intégrable) ne s'ouvrent pas dans une iframe : on ouvre la salle dans un nouvel onglet
                <div className="bg-[#132d4a] rounded-2xl p-10 text-center max-w-xl mx-auto">
                  <p className="text-white font-semibold text-lg mb-2">Cette session a lieu sur {platformLabel}</p>
                  {session.summary || session.description ? <p className="text-white/50 text-sm mb-6 whitespace-pre-line">{session.summary || session.description}</p> : <p className="text-white/50 text-sm mb-6">Cliquez sur le bouton pour ouvrir la salle dans un nouvel onglet.</p>}
                  <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                    <ExternalLink className="h-4 w-4" /> Rejoindre sur {platformLabel}
                  </a>
                </div>
              ) : (
                <div className="bg-[#132d4a] rounded-2xl p-10 text-center max-w-md mx-auto">
                  <p className="text-white/60 text-sm">Le lien de la salle n&apos;a pas encore été communiqué.</p>
                </div>
              )}

              {!closed && session.description && (session.platform === "jitsi" || embedUrl) && (
                <div className="mt-6 bg-[#132d4a] rounded-2xl p-6">
                  <p className="text-white/80 text-sm whitespace-pre-line leading-relaxed">{session.description}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  )
}
