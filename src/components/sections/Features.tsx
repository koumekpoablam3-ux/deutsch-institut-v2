"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Award, Plane, Home, Users, BookOpen, Globe, Star, GraduationCap, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/i18n/I18nProvider"
import type { FeatureIcon, FeaturesSettings } from "@/lib/site-content"

const ICONS: Record<FeatureIcon, LucideIcon> = {
  award: Award, plane: Plane, home: Home, users: Users, book: BookOpen, globe: Globe, star: Star, graduation: GraduationCap,
}

// Dégradés des pastilles d'icône, répétés dans l'ordre
const COLORS = [
  "from-[#1B3A5C] to-[#2a5a8c]",
  "from-[#D4A843] to-[#E8C76A]",
  "from-[#1B3A5C] to-[#0f2a45]",
  "from-[#D4A843] to-[#C49A3A]",
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Features({ content }: { content: FeaturesSettings }) {
  const { t } = useI18n()
  if (content.items.length === 0) return null
  return (
    <section id="features" className="py-20 lg:py-28 bg-[#f8f9fb] dark:bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-[#D4A843]/15 text-[#D4A843] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
            {t(content.eyebrow)}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-4">
            {t(content.title)}
          </h2>
          {content.subtitle && (
            <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-2xl mx-auto text-lg">
              {t(content.subtitle)}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8"
        >
          {content.items.map((feature, i) => {
            const Icon = ICONS[feature.icon] ?? Award
            return (
            <motion.div key={feature.title + i} variants={cardVariants}>
              <Card className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-[#132d4a] hover:-translate-y-1 overflow-hidden">
                <div className="h-48 relative overflow-hidden">
                  <Image src={feature.image} alt={t(feature.title)} fill unoptimized={!feature.image.startsWith("/images/")} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} flex items-center justify-center shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardContent className="pt-6 pb-6 px-6">
                  <h3 className="font-bold text-lg text-[#1B3A5C] dark:text-white mb-3">
                    {t(feature.title)}
                  </h3>
                  <p className="text-[#1B3A5C]/60 dark:text-white/50 text-sm leading-relaxed">
                    {t(feature.description)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
