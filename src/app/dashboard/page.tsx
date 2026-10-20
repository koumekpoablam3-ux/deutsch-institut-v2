"use client"

import { useI18n } from "@/i18n/I18nProvider"
import { LEVELS, normalizeLevel } from "@/lib/levels"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, BookOpen, Library, RefreshCw, LogOut, Menu, Lock, CheckCircle, Clock, Star, Zap, BarChart3, GraduationCap, Loader2, User, Target, ClipboardCheck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SessionUser {
  name: string;
  email: string;
  userId: string;
  role: string;
  niveau: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  level: string;
  lessons: number;
  duration: string;
  price: string;
  image: string;
}

interface Enrollment {
  id: string;
  progress: number;
  status: string;
  startedAt: string;
  course: Course;
}

const levelOrder = LEVELS as readonly string[]
const levelNames: Record<string, string> = { A1: "Débutant", A2: "Élémentaire", B1: "Intermédiaire", B2: "Interm. Sup." }

const gradientColors: Record<string, string> = { A1: "from-[#16a34a] to-[#4ade80]", A2: "from-[#D4A843] to-[#E8C76A]", B1: "from-[#1B3A5C] to-[#3b82f6]", B2: "from-[#7c3aed] to-[#a78bfa]" }

export default function DashboardPage() {
  const { t } = useI18n()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  const user = session?.user as SessionUser | undefined

  const fetchEnrollments = useCallback(async () => {
    try {
      const enrollRes = await fetch("/api/enrollments")
      if (enrollRes.ok) {
        const data = await enrollRes.json()
        setEnrollments(data.data?.enrollments || [])
      }
    } catch { /* noop */ }
    finally { setLoading(false) }
  }, [])

  // État du dossier d'inscription (bandeau d'invitation à le compléter)
  const [dossier, setDossier] = useState<{ needsDossier: boolean; status: string } | null>(null)
  useEffect(() => {
    fetch("/api/application/status").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setDossier(d) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "authenticated") { fetchEnrollments() }
  }, [status, router, fetchEnrollments])

  // Niveau de l'étudiant ramené à A1-B2 (les anciens profils C1/C2 comptent comme B2)
  const userLevel = normalizeLevel(user?.niveau)

  const getLevelStatus = (level: string) => {
    const enr = enrollments.find(e => normalizeLevel(e.course.level) === level)
    if (enr && enr.progress >= 100) return { status: "done", progress: 100 }
    if (enr && enr.progress > 0) return { status: "active", progress: enr.progress }
    if (userLevel === level) return { status: "current", progress: 0 }
    // Les niveaux inférieurs à celui de l'étudiant sont considérés comme acquis
    if (levelOrder.indexOf(level) < levelOrder.indexOf(userLevel)) return { status: "done", progress: 100 }
    return { status: "locked", progress: 0 }
  }

  const totalXP = enrollments.reduce((sum, e) => sum + e.progress * 10, 0)
  const totalLessons = enrollments.reduce((sum, e) => sum + Math.round(e.course.lessons * e.progress / 100), 0)
  const totalLessonsAll = enrollments.reduce((sum, e) => sum + e.course.lessons, 0)

  // Série réelle : jours consécutifs (depuis aujourd'hui) où l'utilisateur a des inscriptions
  const streakDays = useMemo(() => {
    if (enrollments.length === 0) return 1

    const dates = new Set<string>()
    enrollments.forEach(e => {
      const d = new Date(e.startedAt)
      dates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`)
    })

    let streak = 0
    const check = new Date()
    while (true) {
      const ds = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, "0")}-${String(check.getDate()).padStart(2, "0")}`
      if (dates.has(ds)) { streak++; check.setDate(check.getDate() - 1) } else break
    }

    return Math.max(1, streak)
  }, [enrollments])

  // Données d'engagement réelles basées sur les jours d'inscription et la progression
  const engagementData = useMemo(() => {
    if (enrollments.length === 0) return [0, 0, 0, 0, 0, 0, 0]

    const dayScores = [0, 0, 0, 0, 0, 0, 0] // Lun-Dim
    enrollments.forEach(e => {
      const dow = new Date(e.startedAt).getDay() // 0=Dim
      const idx = dow === 0 ? 6 : dow - 1
      dayScores[idx] += e.progress
    })

    const activeDays = dayScores.filter(s => s > 0).length

    if (activeDays >= 3) {
      // Distribution par jour de la semaine suffisante
      const maxScore = Math.max(...dayScores, 1)
      return dayScores.map(s => s === 0 ? 0 : Math.max(8, Math.round((s / maxScore) * 100)))
    }

    // Pas assez de données par jour — utiliser les progressions des inscriptions
    const values = enrollments.map(e => e.progress)
    const padded = [...values]
    while (padded.length < 7) padded.push(0)
    const maxVal = Math.max(...padded, 1)
    return padded.slice(0, 7).map(v => v === 0 ? 0 : Math.max(8, Math.round((v / maxVal) * 100)))
  }, [enrollments])

  const completedCount = enrollments.filter(e => e.progress >= 100).length

  if (status === "loading" || loading) return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex">
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className={"fixed top-0 left-0 h-dvh w-64 bg-[#1B3A5C] text-white z-50 transition-transform lg:translate-x-0 flex flex-col " + (open ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-5 flex items-center gap-2.5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-[#D4A843] flex items-center justify-center"><GraduationCap className="h-5 w-5 text-white" /></div>
          <div><p className="font-bold text-sm">{t("Deutsch-Institut")}</p><p className="text-[10px] text-white/50">{userLevel}</p></div>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
          {[{ icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard", active: true }, { icon: BookOpen, label: "Mes cours", href: "/cours" }, { icon: Library, label: "Catalogue", href: "/cours" }, { icon: ClipboardCheck, label: "Mon dossier", href: "/dossier" }, { icon: RefreshCw, label: "Révision IA", href: "/entrainement-ia" }, { icon: User, label: "Mon profil", href: "/dashboard/profil" }].map((item) => (
            <a key={item.label} href={item.href} className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm " + (item.active ? "bg-[#D4A843]/20 text-[#D4A843] font-semibold" : "text-white/60 hover:text-white hover:bg-white/5")}>
              <item.icon className="h-5 w-5" />{t(item.label)}
            </a>
          ))}
        </nav>
        <div className="shrink-0 p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-2"><p className="text-sm font-medium text-white/80">{user?.name || ""}</p><p className="text-[10px] text-white/40">{user?.email || ""}</p></div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full"><LogOut className="h-5 w-5" />{t("Se déconnecter")}</button>
        </div>
      </div>
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setOpen(true)} className="lg:hidden"><Menu className="h-6 w-6 text-[#1B3A5C] dark:text-white" /></button>
            <h1 className="text-xl font-bold text-[#1B3A5C] dark:text-white">{t("Tableau de bord")}</h1>
          </div>
          {dossier?.needsDossier && (
            <a href="/dossier" className={"mb-6 flex items-center justify-between gap-4 rounded-2xl border p-4 " + (dossier.status === "needs_changes" || dossier.status === "rejected" ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800" : "border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700")}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-[#1B3A5C] dark:text-white">
                    {dossier.status === "submitted" ? t("Dossier en cours de vérification")
                      : dossier.status === "needs_changes" ? t("Corrections demandées sur votre dossier")
                      : dossier.status === "rejected" ? t("Dossier refusé")
                      : t("Complétez votre dossier d'inscription")}
                  </p>
                  <p className="text-xs text-[#1B3A5C]/60 dark:text-white/50 mt-0.5">
                    {dossier.status === "submitted" ? t("Notre équipe vérifie vos informations et vos documents. Vous serez notifié dès qu'une décision sera prise.")
                      : t("Votre dossier doit être validé avant de pouvoir vous inscrire à un cours.")}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-[#D4A843] whitespace-nowrap">{t("Mon dossier")} →</span>
            </a>
          )}
          <div className="bg-gradient-to-r from-[#1B3A5C] to-[#0f2a45] rounded-2xl p-6 text-white mb-8 flex items-center justify-between flex-wrap gap-4">
            <div><h2 className="text-2xl font-bold mb-1">{t("Bienvenue,")}{" "}{user?.name?.split(" ")[0] || t("Étudiant")} !</h2><p className="text-white/70">{t("Continuez votre apprentissage. Niveau actuel :")}{" "}{userLevel}</p></div>
            <div className="bg-[#D4A843] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" />{streakDays} {streakDays > 1 ? t("JOURS DE SÉRIE") : t("JOUR DE SÉRIE")}</div>
          </div>
          <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 mb-8 shadow-sm">
            <h3 className="font-bold text-[#1B3A5C] dark:text-white mb-6">{t("Votre chemin vers la maîtrise")}</h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {levelOrder.map((lvl) => {
                const { status, progress } = getLevelStatus(lvl)
                return (
                  <div key={lvl} className={"rounded-xl border-2 p-4 text-center transition-all " + (status === "done" ? "border-green-500" : status === "active" || status === "current" ? "border-[#D4A843]" : "border-gray-200 dark:border-gray-700")}>
                    <div className="flex justify-center mb-2">
                      {status === "done" ? <CheckCircle className="h-5 w-5 text-green-600" /> : status === "active" || status === "current" ? <Star className="h-5 w-5 text-[#D4A843]" /> : status === "locked" ? <Lock className="h-5 w-5 text-gray-400" /> : <Clock className="h-5 w-5 text-gray-400" />}
                    </div>
                    <p className="text-2xl font-extrabold text-[#1B3A5C] dark:text-white">{lvl}</p>
                    <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 mt-1">{t(levelNames[lvl])}</p>
                    {status === "active" && <p className="text-xs font-semibold mt-1 text-[#D4A843]">{progress}%</p>}
                    <p className={"text-xs font-semibold mt-2 px-2 py-0.5 rounded-full inline-block " + (status === "done" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : status === "active" ? "bg-[#D4A843]/20 text-[#D4A843]" : status === "current" ? "bg-[#D4A843]/10 text-[#D4A843]" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>{status === "done" ? t("Terminé") : status === "active" ? t("En cours") : status === "current" ? t("Actuel") : t("Verrouillé")}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white mb-4">{t("Mes Cours")}</h3>
              {enrollments.length === 0 ? (
                <div className="bg-white dark:bg-[#132d4a] rounded-xl p-8 shadow-sm text-center">
                  <BookOpen className="h-10 w-10 text-[#1B3A5C]/20 mx-auto mb-3" />
                  <p className="text-[#1B3A5C]/50 dark:text-white/40 mb-4">{t("Vous n'êtes inscrit à aucun cours")}</p>
                  <a href="/cours"><Button className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">{t("Voir les cours")}</Button></a>
                </div>
              ) : enrollments.map((enr) => (
                <div key={enr.id} className="bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm flex items-center gap-4 mb-4">
                  <div className={"w-24 h-16 rounded-lg bg-gradient-to-br shrink-0 " + (gradientColors[enr.course.level] || "from-[#1B3A5C] to-[#3b82f6]")} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1B3A5C] dark:text-white text-sm mb-1 truncate">{t(enr.course.title)}</p>
                    <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 mb-2">{enr.course.lessons} {t("leçons ·")}{" "}{enr.course.duration}</p>
                    <div className="flex items-center gap-2"><div className="flex-1 h-2 bg-[#f8f9fb] dark:bg-[#0a1628] rounded-full"><div className="h-full rounded-full bg-[#D4A843] transition-all" style={{ width: enr.progress + "%" }} /></div><span className="text-xs font-bold text-[#D4A843]">{enr.progress}%</span></div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <a href={"/cours/" + enr.course.slug + "/apprendre"}><Button className={"w-full text-xs font-semibold h-9 " + (enr.progress >= 100 ? "border border-[#1B3A5C]/20 text-[#1B3A5C]/60 dark:text-white/60 dark:border-white/20" : "bg-[#D4A843] text-white")}>{enr.progress >= 100 ? t("Revoir") : t("Continuer")}</Button></a>
                    {enr.progress >= 100 && (
                      <a href={"/dashboard/certificat/" + enr.id}><Button variant="outline" className="w-full text-xs font-semibold h-9 border-[#D4A843] text-[#D4A843]">{t("Certificat")}</Button></a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-bold text-[#1B3A5C] dark:text-white mb-4">{t("Statistiques")}</h3>
              {[{ v: totalXP.toLocaleString(), l: "Score Total", i: <Star className="h-5 w-5 text-[#D4A843]" /> }, { v: Math.round(totalLessons * 1.5) + "h", l: "Temps d'étude", i: <Clock className="h-5 w-5 text-[#1B3A5C]" /> }, { v: totalLessons + "/" + totalLessonsAll, l: "Leçons complétées", i: <BookOpen className="h-5 w-5 text-green-600" /> }].map((s) => (
                <div key={s.l} className="bg-white dark:bg-[#132d4a] rounded-xl p-4 shadow-sm text-center mb-4"><div className="flex justify-center mb-2">{s.i}</div><p className="text-lg font-extrabold text-[#1B3A5C] dark:text-white">{s.v}</p><p className="text-xs text-[#1B3A5C]/50 dark:text-white/40">{t(s.l)}</p></div>
              ))}
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Votre progression — remplace le faux classement */}
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-[#D4A843]" />{t("Votre progression")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#D4A843]/10">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-[#D4A843]" />
                    <span className="text-sm font-medium text-[#1B3A5C] dark:text-white">{t("Score total")}</span>
                  </div>
                  <span className="font-bold text-[#D4A843]">{totalXP.toLocaleString()} {t("XP")}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-[#1B3A5C] dark:text-white">{t("Cours terminés")}</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">{completedCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#1B3A5C]/5 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-[#1B3A5C] dark:text-white" />
                    <span className="text-sm font-medium text-[#1B3A5C] dark:text-white">{t("Niveau actuel")}</span>
                  </div>
                  <span className="font-bold text-[#1B3A5C] dark:text-white">{userLevel}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#f8f9fb] dark:bg-[#0a1628]">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-[#D4A843]" />
                    <span className="text-sm font-medium text-[#1B3A5C] dark:text-white">{t("Série actuelle")}</span>
                  </div>
                  <span className="font-bold text-[#D4A843]">{streakDays} {streakDays > 1 ? t("jours") : t("jour")}</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-[#D4A843]" />{t("Engagement")}</h3>
              <div className="flex items-end gap-2 h-32">{engagementData.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-[#1B3A5C] dark:bg-[#3b82f6] transition-all" style={{ height: (v * 1.2) + "px" }} />
                  <span className="text-[10px] text-[#1B3A5C]/40 dark:text-white/30">{["L","M","M","J","V","S","D"][i]}</span>
                </div>
              ))}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
