"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Star, Quote, Button as ButtonIcon, Loader2, MessageSquareOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

interface ReviewData {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { name: string }
  course: { title: string; level: string }
}

const stats = [
  { value: "500+", label: "Étudiants formés" },
  { value: "98%", label: "Taux de réussite examen" },
  { value: "95%", label: "Satisfaction étudiants" },
  { value: "87%", label: "Obtention visa" },
]

export default function TemoignagesPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/courses?reviews=true")
      if (!res.ok) throw new Error()
      const data = await res.json()
      const allReviews: ReviewData[] = []
      for (const course of data.data?.courses ?? []) {
        for (const review of course.reviews ?? []) {
          allReviews.push({
            ...review,
            course: { title: course.title, level: course.level },
          })
        }
      }
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setReviews(allReviews)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="relative h-72 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A5C] via-[#1B3A5C] to-[#0f2a45]" />
          <div className="absolute bottom-10 right-20 w-72 h-72 rounded-full bg-[#D4A843]/10" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-[#D4A843]/20 text-[#D4A843] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">Témoignages</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Ils nous font confiance</h1>
              <p className="text-white/70 max-w-xl text-lg">Découvrez les parcours de nos étudiants qui ont réussi leur projet en Allemagne.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-[#0a1628] py-12 border-b border-[#1B3A5C]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#D4A843]">{s.value}</p>
              <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50 mt-2 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 animate-pulse">
                  <div className="flex gap-0.5 mb-5">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="h-4 w-4 rounded bg-[#D4A843]/20" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-[#1B3A5C]/10 rounded w-full" />
                    <div className="h-3 bg-[#1B3A5C]/10 rounded w-4/5" />
                    <div className="h-3 bg-[#1B3A5C]/10 rounded w-3/5" />
                  </div>
                  <div className="border-t border-[#1B3A5C]/5 pt-5 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1B3A5C]/10" />
                    <div className="space-y-1.5">
                      <div className="h-3 bg-[#1B3A5C]/10 rounded w-24" />
                      <div className="h-2.5 bg-[#D4A843]/20 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <MessageSquareOff className="h-12 w-12 text-[#1B3A5C]/30 mx-auto mb-4" />
              <p className="text-[#1B3A5C]/60 dark:text-white/50 mb-6">Impossible de charger les témoignages pour le moment.</p>
              <Button variant="outline" onClick={fetchReviews} className="border-[#1B3A5C] text-[#1B3A5C] dark:border-white/30 dark:text-white">
                Réessayer
              </Button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquareOff className="h-12 w-12 text-[#1B3A5C]/30 mx-auto mb-4" />
              <p className="text-[#1B3A5C]/60 dark:text-white/50 mb-2">Aucun témoignage pour le moment.</p>
              <p className="text-sm text-[#1B3A5C]/40 dark:text-white/30 mb-6">Soyez le premier à partager votre expérience !</p>
              <Link href="/contact">
                <Button className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold px-8">Nous contacter</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 relative hover:shadow-xl transition-shadow duration-300">
                  <Quote className="h-10 w-10 text-[#D4A843]/15 absolute top-6 right-6" />
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={"h-4 w-4 " + (j < review.rating ? "fill-[#D4A843] text-[#D4A843]" : "text-gray-200 dark:text-white/10")} />
                    ))}
                  </div>
                  <p className="text-[#1B3A5C]/70 dark:text-white/60 leading-relaxed mb-6 text-sm italic">
                    {review.comment || "Aucun commentaire laissé."}
                  </p>
                  <div className="border-t border-[#1B3A5C]/5 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1B3A5C] to-[#D4A843] flex items-center justify-center text-white font-bold text-sm">
                          {review.user.name.split(" ").map(w => w[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#1B3A5C] dark:text-white">{review.user.name}</p>
                          <p className="text-xs text-[#D4A843] font-medium">{review.course.level} - Étudiant</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#D4A843]/10 rounded-lg px-3 py-2">
                      <ButtonIcon className="h-4 w-4 text-[#D4A843] shrink-0" />
                      <p className="text-xs font-medium text-[#1B3A5C] dark:text-white/70">{review.course.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#1B3A5C] to-[#0f2a45]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Rejoignez-les !</h2>
          <p className="text-white/60 mb-8">Commencez votre formation et écrivez votre propre réussite.</p>
          <Link href="/contact"><Button size="lg" className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold px-8">S'inscrire maintenant</Button></Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
