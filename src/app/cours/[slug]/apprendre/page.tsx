"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, CheckCircle, Circle, FileText, Video, LinkIcon, ArrowLeft,
  Download, Award, Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import { toast } from "sonner"

interface CourseModule {
  id: string
  title: string
  type: "pdf" | "video" | "text" | "link"
  content: string | null
  fileName: string | null
  order: number
  completed: boolean
}

interface FullModule extends CourseModule {
  fileData: string | null
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
}

export default function ApprendrePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [courseTitle, setCourseTitle] = useState("")
  const [modules, setModules] = useState<CourseModule[]>([])
  const [allCompleted, setAllCompleted] = useState(false)
  const [certificate, setCertificate] = useState<{ id: string; certificateNumber: string } | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeModule, setActiveModule] = useState<FullModule | null>(null)
  const [loadingModule, setLoadingModule] = useState(false)
  const [marking, setMarking] = useState(false)

  const [showQuiz, setShowQuiz] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; passed: boolean } | null>(null)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)

  const fetchModules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/courses/${slug}/modules`)
      const data = await res.json()
      if (res.ok && data.success) {
        setCourseTitle(data.data.course.title)
        setModules(data.data.modules)
        setAllCompleted(data.data.allCompleted)
        setCertificate(data.data.certificate)
        if (data.data.modules.length > 0 && !activeId) setActiveId(data.data.modules[0].id)
      } else {
        setError(data.error || "Impossible de charger le cours")
      }
    } catch { setError("Erreur de connexion") }
    finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  useEffect(() => { fetchModules() }, [fetchModules])

  useEffect(() => {
    if (!activeId) return
    setLoadingModule(true)
    setShowQuiz(false)
    fetch(`/api/courses/${slug}/modules/${activeId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setActiveModule(data.data.module) })
      .finally(() => setLoadingModule(false))
  }, [activeId, slug])

  const markComplete = async () => {
    if (!activeId) return
    setMarking(true)
    try {
      const res = await fetch(`/api/courses/${slug}/modules/${activeId}/complete`, { method: "POST" })
      const data = await res.json()
      if (res.ok && data.success) {
        setModules((prev) => prev.map((m) => (m.id === activeId ? { ...m, completed: true } : m)))
        setAllCompleted(data.data.allCompleted)
        toast.success("Module marqué comme terminé")
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setMarking(false) }
  }

  const openQuiz = async () => {
    setShowQuiz(true)
    setActiveId(null)
    setActiveModule(null)
    setQuizResult(null)
    setQuizAnswers({})
    try {
      const res = await fetch(`/api/courses/${slug}/quiz`)
      const data = await res.json()
      if (res.ok && data.success) {
        setQuestions(data.data.questions)
        if (data.data.certificate) setCertificate(data.data.certificate)
      } else {
        toast.error(data.error || "Impossible de charger le quiz")
      }
    } catch { toast.error("Erreur de connexion") }
  }

  const submitQuiz = async () => {
    if (Object.keys(quizAnswers).length < questions.length) {
      toast.error("Merci de répondre à toutes les questions")
      return
    }
    setSubmittingQuiz(true)
    try {
      const answers = Object.entries(quizAnswers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }))
      const res = await fetch(`/api/courses/${slug}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setQuizResult({ score: data.data.score, total: data.data.total, passed: data.data.passed })
        if (data.data.certificate) setCertificate(data.data.certificate)
        if (data.data.passed) toast.success("Félicitations, vous avez réussi le quiz !")
        else toast.error("Score insuffisant, retentez le quiz après avoir revu le cours")
      } else {
        toast.error(data.error || "Erreur lors de la soumission")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setSubmittingQuiz(false) }
  }

  const iconFor = (type: string) => {
    if (type === "pdf") return <FileText className="h-4 w-4" />
    if (type === "video") return <Video className="h-4 w-4" />
    if (type === "link") return <LinkIcon className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" />
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center">
          <Lock className="h-10 w-10 text-[#D4A843] mb-3" />
          <p className="font-semibold text-[#1B3A5C] dark:text-white mb-1">Accès non disponible</p>
          <p className="text-sm text-[#1B3A5C]/50 dark:text-white/40 mb-4">{error}</p>
          <Link href={`/cours/${slug}`}><Button variant="outline">Retour au cours</Button></Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 bg-[#f7f5f0] dark:bg-[#0a1628]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href={`/cours/${slug}`} className="inline-flex items-center gap-2 text-sm text-[#1B3A5C]/60 dark:text-white/50 hover:text-[#1B3A5C] dark:hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /> Retour au cours
          </Link>
          <h1 className="text-2xl font-bold text-[#1B3A5C] dark:text-white mb-6">{courseTitle}</h1>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm p-3 h-fit">
              <p className="text-xs font-semibold text-[#1B3A5C]/40 dark:text-white/30 uppercase px-2 mb-2">Modules</p>
              <div className="space-y-1">
                {modules.length === 0 && (
                  <p className="text-sm text-[#1B3A5C]/40 dark:text-white/30 px-2 py-4">Aucun module n&apos;a encore été publié pour ce cours.</p>
                )}
                {modules.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setActiveId(m.id); setShowQuiz(false) }}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      activeId === m.id && !showQuiz
                        ? "bg-[#D4A843]/15 text-[#1B3A5C] dark:text-white font-semibold"
                        : "text-[#1B3A5C]/70 dark:text-white/60 hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {m.completed ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> : <Circle className="h-4 w-4 shrink-0 opacity-30" />}
                    <span className="flex-1 truncate">{m.title}</span>
                    {iconFor(m.type)}
                  </button>
                ))}
              </div>

              {modules.length > 0 && (
                <>
                  <div className="h-px bg-[#1B3A5C]/10 dark:bg-white/10 my-2" />
                  <button
                    onClick={openQuiz}
                    disabled={!allCompleted}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      showQuiz
                        ? "bg-[#D4A843]/15 text-[#1B3A5C] dark:text-white"
                        : allCompleted
                        ? "text-[#1B3A5C] dark:text-white hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5"
                        : "text-[#1B3A5C]/30 dark:text-white/20 cursor-not-allowed"
                    }`}
                  >
                    <Award className="h-4 w-4 shrink-0" />
                    <span className="flex-1">Quiz final</span>
                    {!allCompleted && <Lock className="h-3.5 w-3.5" />}
                  </button>
                  {!allCompleted && (
                    <p className="text-[11px] text-[#1B3A5C]/40 dark:text-white/30 px-3 mt-1">
                      Termine tous les modules pour débloquer le quiz.
                    </p>
                  )}
                </>
              )}

              {certificate && (
                <a
                  href={`/api/certificates/${certificate.id}/download`}
                  className="mt-3 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg px-3 py-2.5 transition-colors"
                >
                  <Download className="h-4 w-4" /> Mon certificat
                </a>
              )}
            </div>

            {/* Contenu */}
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm p-6 min-h-[400px]">
              {showQuiz ? (
                <div>
                  <h2 className="text-lg font-bold text-[#1B3A5C] dark:text-white mb-1">Quiz final</h2>
                  <p className="text-sm text-[#1B3A5C]/50 dark:text-white/40 mb-6">
                    Réponds correctement à au moins 70% des questions pour obtenir ton certificat.
                  </p>

                  {quizResult ? (
                    <div className="text-center py-10">
                      {quizResult.passed ? (
                        <Award className="h-12 w-12 text-[#D4A843] mx-auto mb-3" />
                      ) : (
                        <Circle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                      )}
                      <p className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-1">
                        {quizResult.score} / {quizResult.total}
                      </p>
                      <p className="text-sm text-[#1B3A5C]/50 dark:text-white/40 mb-6">
                        {quizResult.passed ? "Cours validé, félicitations !" : "Score insuffisant pour valider le cours."}
                      </p>
                      {quizResult.passed && certificate ? (
                        <a
                          href={`/api/certificates/${certificate.id}/download`}
                          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg px-5 py-2.5"
                        >
                          <Download className="h-4 w-4" /> Télécharger mon certificat
                        </a>
                      ) : (
                        <Button onClick={openQuiz} variant="outline">Retenter le quiz</Button>
                      )}
                    </div>
                  ) : questions.length === 0 ? (
                    <p className="text-sm text-[#1B3A5C]/50 dark:text-white/40">Aucun quiz n&apos;a encore été configuré pour ce cours.</p>
                  ) : (
                    <div className="space-y-6">
                      {questions.map((q, qi) => (
                        <div key={q.id}>
                          <p className="font-semibold text-[#1B3A5C] dark:text-white mb-2">{qi + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <label
                                key={oi}
                                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                                  quizAnswers[q.id] === oi
                                    ? "border-[#D4A843] bg-[#D4A843]/10 text-[#1B3A5C] dark:text-white"
                                    : "border-[#1B3A5C]/10 dark:border-white/10 text-[#1B3A5C]/70 dark:text-white/60 hover:border-[#1B3A5C]/30"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  className="accent-[#D4A843]"
                                  checked={quizAnswers[q.id] === oi}
                                  onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button
                        onClick={submitQuiz}
                        disabled={submittingQuiz}
                        className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold"
                      >
                        {submittingQuiz ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider mes réponses"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : loadingModule ? (
                <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 text-[#D4A843] animate-spin" /></div>
              ) : activeModule ? (
                <div>
                  <h2 className="text-lg font-bold text-[#1B3A5C] dark:text-white mb-4">{activeModule.title}</h2>

                  {activeModule.type === "text" && (
                    <p className="text-[#1B3A5C]/80 dark:text-white/70 leading-relaxed whitespace-pre-wrap">{activeModule.content}</p>
                  )}

                  {activeModule.type === "video" && activeModule.content && (
                    <div className="rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                      <iframe
                        title={activeModule.title}
                        src={activeModule.content}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      />
                    </div>
                  )}

                  {activeModule.type === "link" && activeModule.content && (
                    <a href={activeModule.content} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#D4A843] font-semibold underline underline-offset-2">
                      <LinkIcon className="h-4 w-4" /> Ouvrir la ressource
                    </a>
                  )}

                  {activeModule.type === "pdf" && activeModule.fileData && (
                    <div>
                      <iframe
                        title={activeModule.fileName || "Document PDF"}
                        src={activeModule.fileData}
                        className="w-full rounded-xl border border-[#1B3A5C]/10 dark:border-white/10"
                        style={{ height: "70vh" }}
                      />
                      <a
                        href={activeModule.fileData}
                        download={activeModule.fileName || "document.pdf"}
                        className="inline-flex items-center gap-2 text-[#D4A843] font-semibold text-sm mt-3"
                      >
                        <Download className="h-4 w-4" /> Télécharger le PDF
                      </a>
                    </div>
                  )}

                  {activeModule.content === null && activeModule.type !== "pdf" && (
                    <p className="text-sm text-[#1B3A5C]/40 dark:text-white/30">Contenu indisponible pour ce module.</p>
                  )}

                  <div className="mt-8 pt-6 border-t border-[#1B3A5C]/10 dark:border-white/10">
                    {modules.find((m) => m.id === activeModule.id)?.completed ? (
                      <p className="inline-flex items-center gap-2 text-emerald-500 text-sm font-semibold">
                        <CheckCircle className="h-4 w-4" /> Module terminé
                      </p>
                    ) : (
                      <Button onClick={markComplete} disabled={marking} className="bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white font-semibold">
                        {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Marquer comme terminé"}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#1B3A5C]/40 dark:text-white/30">Sélectionne un module pour commencer.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
