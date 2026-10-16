"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Award, Plane, Home, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Award,
    title: "Cours Certifiés A1 - C1",
    description:
      "Programme aligné sur le Cadre Européen Commun de Référence. Préparation complète aux examens Goethe-Zertifikat avec un taux de réussite de 98%. Nos instructeurs certifiés vous accompagnent à chaque niveau avec des méthodes pédagogiques éprouvées.",
    image: "/images/features/certification.jpg",
    color: "from-[#1B3A5C] to-[#2a5a8c]",
  },
  {
    icon: Plane,
    title: "Accompagnement Visa",
    description:
      "Assistance complète pour vos démarches administratives : dossier visa étudiant, lettres de motivation, justificatifs d'inscription. Notre équipe juridique partenaire vous guide de la constitution du dossier jusqu'à l'obtention du visa.",
    image: "/images/features/visa.jpg",
    color: "from-[#D4A843] to-[#E8C76A]",
  },
  {
    icon: Home,
    title: "Hébergement & Intégration",
    description:
      "Recherche de logement adapté à votre budget en Allemagne : résidence étudiante, colocation ou famille d'accueil. Programme d'intégration culturelle incluant visites guidées, événements communautaires et ateliers de vie quotidienne.",
    image: "/images/features/hebergement.jpg",
    color: "from-[#1B3A5C] to-[#0f2a45]",
  },
  {
    icon: Users,
    title: "Tuteurs Bilingues",
    description:
      "Professeurs natifs allemands parlant couramment le français. Sessions individuelles de tutorat, groupes de conversation hebdomadaires et pratique immersive. Un accompagnement personnalisé pour progresser rapidement et avec confiance.",
    image: "/images/features/tuteurs.jpg",
    color: "from-[#D4A843] to-[#C49A3A]",
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function Features() {
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
            Pourquoi nous choisir
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-4">
            Une formation complète et certifiée
          </h2>
          <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-2xl mx-auto text-lg">
            Plus qu'un simple cours de langue : un accompagnement global pour votre projet de vie en Allemagne.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-[#132d4a] hover:-translate-y-1 overflow-hidden">
                <div className="h-48 relative overflow-hidden">
                  <Image src={feature.image} alt={feature.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardContent className="pt-6 pb-6 px-6">
                  <h3 className="font-bold text-lg text-[#1B3A5C] dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#1B3A5C]/60 dark:text-white/50 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
