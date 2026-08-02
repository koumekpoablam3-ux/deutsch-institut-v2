"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Star, ChevronLeft, ChevronRight, Quote, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/sections/Header"
import Features from "@/components/sections/Features"
import Footer from "@/components/sections/Footer"

const heroSlides = [
  {
    image: "/images/hero/hero-1.jpg",
    title: "Maîtrisez l'Allemand,",
    highlight: "Ouvrez vos Horizons",
    subtitle: "Formation intensive certifiée du niveau A1 à C1. Préparation aux examens Goethe, accompagnement visa et intégration en Allemagne.",
  },
  {
    image: "/images/hero/hero-2.jpg",
    title: "Apprenez dans un",
    highlight: "Environnement Professionnel",
    subtitle: "Salles de cours modernes, méthodes pédagogiques innovantes et professeurs certifiés pour une progression rapide et durable.",
  },
  {
    image: "/images/hero/hero-3.jpg",
    title: "Rejoignez une",
    highlight: "Communauté Engagée",
    subtitle: "Plus de 500 étudiants formés avec un taux de réussite de 98%. Des tuteurs bilingues disponibles pour vous accompagner.",
  },
]

const stats = [
  { value: "500+", label: "Étudiants formés" },
  { value: "98%", label: "Taux de réussite" },
  { value: "15+", label: "Années d'expérience" },
  { value: "4.9/5", label: "Note moyenne" },
]

const testimonials = [
  { name: "Maria P.", level: "Étudiante B1", stars: 5, text: "Grâce à Deutsch-Institut, j'ai progressé plus en 3 mois qu'en un an d'apprentissage classique. Les cours sont bien structurés et les professeurs sont très disponibles." },
  { name: "Ahmed B.", level: "Étudiant B1", stars: 5, text: "J'ai obtenu mon Goethe B1 du premier coup. La méthode pédagogique est vraiment efficace et l'accompagnement visa m'a permis de rejoindre l'Allemagne en 6 mois." },
  { name: "Sofia L.", level: "Étudiante A2", stars: 5, text: "En tant que débutante, j'étais inquiète. Mais la plateforme est si bien faite que j'ai pris confiance dès les premières semaines. Je recommande vivement." },
]

interface FeaturedCourse {
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
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [courses, setCourses] = useState<FeaturedCourse[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState(false)

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true)
    setCoursesError(false)
    try {
      const res = await fetch("/api/courses")
      if (!res.ok) throw new Error("Erreur de chargement")
      const data = await res.json()
      setCourses(data.data?.courses?.slice(0, 3) ?? [])
    } catch {
      setCoursesError(true)
    } finally {
      setCoursesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slide = heroSlides[currentSlide]

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <main>
      <Header />

      {/* HERO CAROUSEL */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Background Images */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt="Deutsch-Institut"
              fill
              className="object-cover"
              priority={currentSlide === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C]/95 via-[#1B3A5C]/75 to-[#1B3A5C]/40" />
          </motion.div>
        </AnimatePresence>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-[#D4A843]/5" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#D4A843]/5" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl py-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] rounded-full px-4 py-1.5 text-sm font-semibold mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-[#D4A843] animate-pulse" />
                  Inscriptions ouvertes - Session 2025
                </motion.div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                  {slide.title}<br />
                  <span className="text-[#D4A843]">{slide.highlight}</span>
                </h1>

                <p className="text-lg text-white/70 mb-10 max-w-lg leading-relaxed">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link href="/cours">
                <Button size="lg" className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold px-8 h-13 text-base">
                  Voir les cours <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 h-13 text-base">
                  Prendre rendez-vous
                </Button>
              </Link>
            </motion.div>

            {/* Slide indicators */}
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i) }}
                    className={"h-2 rounded-full transition-all duration-300 " + (i === currentSlide ? "w-8 bg-[#D4A843]" : "w-2 bg-white/40 hover:bg-white/60")}
                  />
                ))}
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={prevSlide} className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button onClick={nextSlide} className="w-10 h-10 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white dark:bg-[#0a1628] py-16 border-b border-[#1B3A5C]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#D4A843]">{s.value}</p>
              <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50 mt-2 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <Features />

      {/* FEATURED COURSES */}
      <section className="py-20 bg-white dark:bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block bg-[#D4A843]/15 text-[#D4A843] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">Nos cours</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-4">Formations populaires</h2>
            <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-xl mx-auto">Découvrez nos formations les plus demandées pour atteindre vos objectifs.</p>
          </motion.div>

          {coursesError ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-[#1B3A5C]/70 dark:text-white/60 mb-4">Impossible de charger les cours pour le moment.</p>
              <Button variant="outline" onClick={fetchCourses} className="border-[#1B3A5C] text-[#1B3A5C] dark:border-white/30 dark:text-white">
                <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
              </Button>
            </div>
          ) : coursesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#f8f9fb] dark:bg-[#132d4a] rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-[#1B3A5C]/10" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-[#1B3A5C]/10 rounded w-2/3" />
                    <div className="h-3 bg-[#1B3A5C]/10 rounded w-full" />
                    <div className="h-3 bg-[#1B3A5C]/10 rounded w-4/5" />
                    <div className="h-6 bg-[#D4A843]/20 rounded w-1/3 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? null : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-[#f8f9fb] dark:bg-[#132d4a] rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image src={course.image} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    {course.badge && (
                      <span className={"absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full text-white " + (course.badgeColor || "bg-[#D4A843]")}>
                        {course.badge}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 dark:bg-[#132d4a]/90 text-[#1B3A5C] dark:text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-[#1B3A5C] dark:text-white mb-2">{course.title}</h3>
                    <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50 leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold text-[#D4A843]">{course.price}</span>
                      <Link href={"/cours/" + course.slug}>
                        <Button variant="outline" size="sm" className="border-[#1B3A5C] text-[#1B3A5C] dark:border-white/30 dark:text-white hover:bg-[#1B3A5C] hover:text-white dark:hover:bg-white/10">
                          Détails
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/cours">
              <Button variant="outline" className="border-[#1B3A5C] text-[#1B3A5C] dark:border-white/30 dark:text-white hover:bg-[#1B3A5C] hover:text-white dark:hover:bg-white/10 font-semibold px-8">
                Voir tous les cours <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-[#f8f9fb] dark:bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block bg-[#D4A843]/15 text-[#D4A843] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">Témoignages</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-4">Ce que disent nos étudiants</h2>
            <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-xl mx-auto">Des centaines d'étudiants ont déjà confiance en notre méthode.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 relative">
                <Quote className="h-10 w-10 text-[#D4A843]/20 absolute top-6 right-6" />
                <div className="flex gap-0.5 mb-5">{Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="h-4 w-4 fill-[#D4A843] text-[#D4A843]" />)}</div>
                <p className="text-[#1B3A5C]/70 dark:text-white/60 leading-relaxed mb-6 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1B3A5C] to-[#D4A843] flex items-center justify-center text-white font-bold text-sm">{t.name.split(" ").map(w => w[0]).join("")}</div>
                  <div>
                    <p className="font-semibold text-sm text-[#1B3A5C] dark:text-white">{t.name}</p>
                    <p className="text-xs text-[#D4A843] font-medium">{t.level}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/temoignages">
              <Button variant="outline" className="border-[#1B3A5C] text-[#1B3A5C] dark:border-white/30 dark:text-white hover:bg-[#1B3A5C] hover:text-white dark:hover:bg-white/10 font-semibold px-8">
                Voir tous les témoignages <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#1B3A5C] to-[#0f2a45] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#D4A843]/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#D4A843]/5 translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Prêt pour la prochaine étape ?</h2>
            <p className="text-white/60 mb-8 text-lg">Rejoignez plus de 500 étudiants. Essai gratuit de 7 jours, sans engagement.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact"><Button size="lg" className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold px-8 h-13 text-base">S'inscrire maintenant</Button></Link>
              <Link href="/processus"><Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 h-13 text-base">Découvrir le processus</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}