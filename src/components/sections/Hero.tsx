// NOTE: This component is currently UNUSED. The homepage (src/app/page.tsx) has its own inline hero.
// This component could replace the inline hero if desired.
"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Headphones, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A5C] via-[#1B3A5C]/95 to-[#0f2a45]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOHptMCAwYzAtOS45NC04LjA2LTE4LTE4LTE4Ii8+PC9nPjwvZz48L3N2Zz4=')]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] rounded-full px-4 py-1.5 text-sm font-semibold mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#D4A843] animate-pulse" />
              Inscriptions ouvertes - Session 2025
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Maitrisez l&apos;
              <span className="text-[#D4A843]">Allemand</span>,
              <br />
              Ouvrez vos Horizons
            </h1>

            <p className="text-lg text-white/75 mb-8 max-w-lg leading-relaxed">
              Formation intensive certifiee du niveau A1 a C1. Preparation aux examens Goethe,
              accompagnement visa et integration en Allemagne.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/cours">
                <Button
                  size="lg"
                  className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold px-8 h-13 text-base"
                >
                  Voir les cours
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 h-13 text-base"
                >
                  Prendre rendez-vous
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { value: "500+", label: "Etudiants formes" },
                { value: "98%", label: "Taux de reussite" },
                { value: "15+", label: "Annees d'experience" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                >
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#D4A843]">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15 p-8 shadow-2xl">
              <h3 className="text-white font-bold text-lg mb-6">Niveaux de maitrise</h3>
              {[
                { label: "Grammaire", pct: 85, icon: BookOpen },
                { label: "Comprehension orale", pct: 72, icon: Headphones },
                { label: "Expression ecrite", pct: 90, icon: PenTool },
              ].map((skill, i) => (
                <div key={skill.label} className="mb-5 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <skill.icon className="h-4 w-4 text-[#D4A843]" />
                      <span className="text-white/80 text-sm font-medium">{skill.label}</span>
                    </div>
                    <span className="text-[#D4A843] font-bold text-sm">{skill.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.pct}%` }}
                      transition={{ duration: 1.2, delay: 0.8 + i * 0.2, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-[#D4A843] to-[#E8C76A]"
                    />
                  </div>
                </div>
              ))}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4A843]/20 flex items-center justify-center">
                    <span className="text-[#D4A843] font-bold text-sm">B2</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Niveau moyen atteint</p>
                    <p className="text-white/50 text-xs">Apres 6 mois de formation intensive</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
