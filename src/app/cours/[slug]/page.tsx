import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import Image from "next/image"
import { ArrowLeft, BookOpen, Clock, CheckCircle, Users, Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CourseEnrollButton from "./CourseEnrollButton"
import CourseReviews from "./CourseReviews"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params

  let course
  try {
    course = await db.course.findUnique({ where: { slug } })
  } catch {
    notFound()
  }

  if (!course) {
    notFound()
  }

  const objectives = course.objectives
    ? course.objectives.split(".").filter((s: string) => s.trim().length > 0).map((s: string) => s.trim() + ".")
    : []

  return (
    <>
      <Header />
      <div className="pt-16">
        <div className="relative h-72 sm:h-80 overflow-hidden">
          <Image src={course.image} alt={course.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B3A5C]/95 to-[#1B3A5C]/60" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div>
              <Link href="/cours" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />Retour aux cours
              </Link>
              <div className="flex items-center gap-3 mb-3">
                {course.badge && (
                  <span className={"text-white text-[10px] font-bold px-2.5 py-1 rounded-full " + (course.badgeColor || "bg-[#D4A843]")}>{course.badge}</span>
                )}
                <span className="bg-[#D4A843] text-white text-xs font-bold px-2.5 py-1 rounded-full">{course.level}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{course.title}</h1>
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{course.lessons} leçons</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{course.duration}</span>
                <span className="text-[#D4A843] font-bold text-lg">{course.price}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 lg:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-4">Description du cours</h2>
                <p className="text-[#1B3A5C]/70 dark:text-white/60 leading-relaxed">{course.description}</p>
              </div>

              {objectives.length > 0 && (
                <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 lg:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#D4A843]" />Objectifs
                  </h2>
                  <div className="space-y-3">
                    {objectives.map((obj: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#D4A843] shrink-0 mt-0.5" />
                        <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">{obj}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.prerequisites && (
                <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 lg:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-4">Prérequis</h2>
                  <p className="text-[#1B3A5C]/70 dark:text-white/60 leading-relaxed">{course.prerequisites}</p>
                </div>
              )}

              <CourseReviews slug={course.slug} courseId={course.id} />
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 shadow-sm sticky top-24">
                <CourseEnrollButton courseId={course.id} slug={course.slug} price={course.price} />
                <div className="mt-6 space-y-3 pt-6 border-t border-[#1B3A5C]/10">
                  <div className="flex items-center gap-3 text-sm text-[#1B3A5C]/60 dark:text-white/50">
                    <BookOpen className="h-4 w-4 text-[#D4A843]" />
                    <span>{course.lessons} leçons</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#1B3A5C]/60 dark:text-white/50">
                    <Clock className="h-4 w-4 text-[#D4A843]" />
                    <span>Durée : {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#1B3A5C]/60 dark:text-white/50">
                    <Users className="h-4 w-4 text-[#D4A843]" />
                    <span>8 à 15 étudiants</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#1B3A5C]/60 dark:text-white/50">
                    <Award className="h-4 w-4 text-[#D4A843]" />
                    <span>Certificat inclus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}