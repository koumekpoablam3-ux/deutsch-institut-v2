"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Video, Calendar, Clock, Loader2, Radio, LogIn } from "lucide-react"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

interface LiveSession {
  id: string
  title: string
  description: string | null
  startAt: string
  durationMinutes: number
  course: { title: string; slug: string; level: string }
}

export default function DirectPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const sessionRes = await fetch("/api/auth/session")
        const session = await sessionRes.json()
        const isAuth = !!session?.user
        setAuthed(isAuth)

        if (isAuth) {
          const res = await fetch("/api/live-sessions")
          const data = await res.json()
          if (res.ok) setSessions(data.data?.sessions || [])
        }
      } catch { /* noop */ }
      finally { setLoading(false) }
    })()
  }, [])

  const isLive = (s: LiveSession) => {
    const start = new Date(s.startAt).getTime()
    const end = start + s.durationMinutes * 60000
    const now = Date.now()
    return now >= start && now <= end
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 text-[#D4A843] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Radio className="h-3.5 w-3.5" /> Cours en direct
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-3">Sessions en direct</h1>
            <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-xl mx-auto">
              Rejoignez vos formateurs en visioconférence pour des sessions interactives, réservées aux étudiants inscrits au cours concerné.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
          ) : authed === false ? (
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-12 text-center max-w-md mx-auto">
              <LogIn className="h-10 w-10 text-[#D4A843] mx-auto mb-4" />
              <p className="text-[#1B3A5C] dark:text-white font-semibold text-lg mb-2">Connectez-vous pour rejoindre les sessions</p>
              <p className="text-[#1B3A5C]/60 dark:text-white/50 text-sm mb-6">Les sessions en direct sont réservées aux étudiants inscrits.</p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-[#D4A843] hover:bg-[#C49A3A] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors">
                <LogIn className="h-4 w-4" /> Se connecter
              </Link>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-12 text-center">
              <Video className="h-10 w-10 text-[#1B3A5C]/20 dark:text-white/20 mx-auto mb-3" />
              <p className="text-[#1B3A5C]/50 dark:text-white/40">Aucune session en direct programmée pour le moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {sessions.map((s) => (
                <div key={s.id} className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#D4A843] bg-[#D4A843]/10 px-2.5 py-1 rounded-full">{s.course.level}</span>
                    {isLive(s) && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> EN DIRECT
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#1B3A5C] dark:text-white mb-1">{s.title}</h3>
                  <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 mb-3">{s.course.title}</p>
                  {s.description && <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50 mb-4">{s.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-[#1B3A5C]/50 dark:text-white/40 mb-4">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(s.startAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{new Date(s.startAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {s.durationMinutes} min</span>
                  </div>
                  <Link href={`/direct/${s.id}`} className="inline-flex items-center gap-2 bg-[#1B3A5C] hover:bg-[#0f2a45] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
                    <Video className="h-4 w-4" /> Rejoindre la session
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}