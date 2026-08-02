"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, BookOpen, CheckCircle, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import { toast } from "sonner"

const tabs = ["Tous", "A1", "A2", "B1", "B2", "C1"]

interface Course {
  id: string
  title: string
  slug: string
  level: string
  lessons: number
  duration: string
  price: string
  badge: string | null
  badgeColor: string | null
  image: string
  description: string
  objectives: string
}

const advantages = [
  "Professeurs natifs allemands certifiés",
  "Petits groupes de 8 à 15 étudiants maximum",
  "Support en ligne 24h/24",
  "Matériel pédagogique inclus",
  "Certification reconnue internationalement",
  "Accompagnement visa et hébergement",
]

export default function CoursPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("Tous")
  const [searchQuery, setSearchQuery] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [session, setSession] = useState<{ user?: { userId: string } } | null>(null)

  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(data => { setCourses(data.data?.courses || []); setLoading(false) }).catch(() => setLoading(false))
    fetch("/api/auth/session").then(r => r.json()).then(s => {
      setSession(s)
      if (s.user?.userId) {
        fetch("/api/enrollments").then(r => r.json()).then(data => {
          const ids = new Set<string>((data.data?.enrollments || []).map((e: { courseId: string }) => e.courseId))
          setEnrolledIds(ids)
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [])

  const filtered = courses
    .filter(c => activeTab === "Tous" || c.level === activeTab)
    .filter(c => searchQuery === "" || c.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleEnroll = async (courseId: string) => {
    if (!session?.user) { router.push("/login"); return }
    setEnrollingId(courseId)
    try {
      const res = await fetch("/api/enrollments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) })
      const data = await res.json()
      if (res.ok) { setEnrolledIds(prev => new Set([...prev, courseId])); toast.success("Inscription réussie !") }
      else toast.error(data.error || "Erreur")
    } catch { toast.error("Erreur de connexion") }
    finally { setEnrollingId(null) }
  }

  return (
    <>
      <Header />
      <section className="relative pt-16">
        <div className="relative h-80 overflow-hidden">
          <Image src="/images/cours/levels.jpg" alt="Nos cours" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C]/95 to-[#1B3A5C]/60" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Nos Cours</h1>
              <p className="text-white/70 max-w-xl text-lg">Des cours structurés et certifiés pour chaque niveau, du débutant A1 jusqu&apos;avancé C1.</p>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-8 bg-white dark:bg-[#0a1628] border-b border-[#1B3A5C]/10 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={"px-4 py-2 rounded-lg text-sm font-semibold transition-colors " + (activeTab === t ? "bg-[#1B3A5C] text-white" : "text-[#1B3A5C]/60 dark:text-white/60 hover:bg-[#1B3A5C]/5")}>{t}</button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B3A5C]/40" />
            <Input placeholder="Rechercher un cours..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10 border-[#1B3A5C]/20 focus:border-[#D4A843]" />
          </div>
        </div>
      </section>
      <section className="py-12 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <Link href={"/cours/" + c.slug}>
                    <div className="h-44 relative overflow-hidden">
                      <Image src={c.image} alt={c.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {c.badge && <span className={"absolute top-3 left-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full " + (c.badgeColor || "bg-[#D4A843]")}>{c.badge}</span>}
                      <span className="absolute bottom-3 right-3 bg-[#D4A843] text-white text-xs font-bold px-2.5 py-1 rounded-full">{c.level}</span>
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={"/cours/" + c.slug}><h3 className="font-bold text-[#1B3A5C] dark:text-white mb-3 text-sm leading-snug hover:text-[#D4A843] transition-colors">{c.title}</h3></Link>
                    <div className="flex items-center gap-3 text-xs text-[#1B3A5C]/50 dark:text-white/40 mb-4">
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{c.lessons} leçons</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#1B3A5C]/5">
                      <p className="text-lg font-extrabold text-[#1B3A5C] dark:text-[#D4A843]">{c.price}</p>
                      {enrolledIds.has(c.id) ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle className="h-4 w-4" />Inscrit</span>
                      ) : (
                        <Button onClick={() => handleEnroll(c.id)} disabled={enrollingId === c.id} variant="outline" size="sm" className="border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843] hover:text-white text-xs font-semibold">
                          {enrollingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "S'inscrire"}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 bg-white dark:bg-[#132d4a] rounded-2xl p-8 lg:p-12 shadow-sm">
            <h2 className="text-2xl font-extrabold text-[#1B3A5C] dark:text-white mb-8">Pourquoi choisir nos cours ?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {advantages.map((adv, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#D4A843] shrink-0 mt-0.5" />
                  <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm">{adv}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-br from-[#1B3A5C] to-[#0f2a45]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Vous ne savez pas quel cours choisir ?</h2>
          <p className="text-white/60 mb-8">Passez notre test de niveau gratuit et obtenez une recommandation personnalisée.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/test-de-niveau"><Button size="lg" className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold px-8">Passer le test de niveau</Button></Link>
            <Link href="/contact"><Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8">Nous contacter</Button></Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}