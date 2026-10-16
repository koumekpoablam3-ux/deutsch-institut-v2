"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, BookOpen, Award, Plane, CheckCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

const steps = [
  {
    icon: FileText,
    title: "Inscription & Évaluation",
    description: "Remplissez le formulaire d'inscription en ligne et passez notre test de niveau gratuit pour déterminer votre point de départ. Notre équipe vous contacte sous 24h pour valider votre inscription et planifier votre emploi du temps.",
    details: ["Test de niveau gratuit en ligne", "Entretien individuel avec un conseiller", "Choix du créneau horaire", "Validation de l'inscription sous 24h"],
  },
  {
    icon: BookOpen,
    title: "Formation Intensive",
    description: "Suivez vos cours avec nos professeurs natifs allemands certifiés. Bénéficiez de petits groupes, de matériel pédagogique inclus et d'un suivi personnalisé tout au long de votre parcours de formation.",
    details: ["Cours en présentiel ou en ligne", "Groupes de 8 à 15 étudiants", "Matériel pédagogique inclus", "Suivi hebdomadaire de progression"],
  },
  {
    icon: Award,
    title: "Examen & Certification",
    description: "Passez l'examen Goethe-Zertifikat officiel dans notre centre agréé. Notre préparation ciblée vous garantit une réussite optimale avec un taux de réussite de 98%.",
    details: ["Préparation spécifique à l'examen", "Examens blancs réguliers", "Centre d'examen agréé", "Certificat reconnu internationalement"],
  },
  {
    icon: Plane,
    title: "Visa & Départ",
    description: "Notre équipe juridique partenaire vous accompagne dans vos démarches de visa étudiant. Nous vous aidons également dans la recherche de logement et votre installation en Allemagne.",
    details: ["Accompagnement dossier visa", "Recherche de logement", "Aide à l'installation", "Réseau d'alumni en Allemagne"],
  },
]

const faqs = [
  { q: "Quelle est la durée typique d'une formation ?", a: "La durée dépend de votre niveau de départ et de votre objectif. En général, comptez 8 semaines par niveau (A1, A2, B1, B2). Une formation complète A1 à B2 dure environ 10 mois avec un rythme intensif." },
  { q: "Les cours sont-ils en présentiel ou en ligne ?", a: "Nous proposons les deux formules. Les cours en présentiel se déroulent dans notre centre à Dakar. Les cours en ligne sont disponibles en visioconférence avec les mêmes professeurs et le même suivi pédagogique." },
  { q: "Quel est le prix des formations ?", a: "Les tarifs varient de 50 000 FCFA à 150 000 FCFA selon le niveau et la durée. Des bourses partielles sont disponibles sur dossier. Consultez notre page Cours pour les détails." },
  { q: "Le certificat est-il reconnu en Allemagne ?", a: "Oui, nous préparons aux examens Goethe-Zertifikat qui sont reconnus par toutes les ambassades d'Allemagne, les universités et les employeurs allemands. C'est le standard international pour la langue allemande." },
  { q: "Proposez-vous un accompagnement visa ?", a: "Oui, nous proposons un accompagnement complet pour le visa étudiant : constitution du dossier, lettre de motivation, justificatifs d'inscription, et préparation à l'entretien consulaire." },
]

export default function ProcessusPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index)
  }

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="relative h-72 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A5C] via-[#1B3A5C] to-[#0f2a45]" />
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-[#D4A843]/10" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-[#D4A843]/20 text-[#D4A843] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">Notre Méthode</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Comment ça marche ?</h1>
              <p className="text-white/70 max-w-xl text-lg">Un processus simple et accompagné, de l'inscription jusqu'à votre départ pour l'Allemagne.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Timeline */}
      <section className="py-20 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className={"flex flex-col lg:flex-row gap-8 items-start " + (i % 2 === 1 ? "lg:flex-row-reverse" : "")}>
                <div className={"flex-1 " + (i % 2 === 1 ? "lg:text-right" : "")}>
                  <div className={"inline-flex items-center gap-3 mb-4 " + (i % 2 === 1 ? "lg:flex-row-reverse" : "")}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B3A5C] to-[#2a5a8c] flex items-center justify-center shadow-lg">
                      <step.icon className="h-7 w-7 text-[#D4A843]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#D4A843]">ETAPE {i + 1}</span>
                      <h3 className="text-xl font-bold text-[#1B3A5C] dark:text-white">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-[#1B3A5C]/60 dark:text-white/50 leading-relaxed mb-6">{step.description}</p>
                  <div className={"space-y-2.5 " + (i % 2 === 1 ? "lg:space-y-2.5" : "")}>
                    {step.details.map((detail, j) => (
                      <div key={j} className={"flex items-center gap-2.5 " + (i % 2 === 1 ? "lg:justify-end" : "")}>
                        <CheckCircle className="h-4 w-4 text-[#D4A843] shrink-0" />
                        <span className="text-sm text-[#1B3A5C]/70 dark:text-white/50">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden lg:flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#D4A843] text-white font-extrabold flex items-center justify-center text-lg shadow-lg">{i + 1}</div>
                  {i < steps.length - 1 && <div className="w-0.5 h-24 bg-[#D4A843]/30 mt-2" />}
                </div>
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-[#0a1628]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block bg-[#D4A843]/15 text-[#D4A843] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">FAQ</span>
            <h2 className="text-3xl font-extrabold text-[#1B3A5C] dark:text-white">Questions fréquentes</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i
              return (
                <motion.div
                  key={f.q}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#f8f9fb] dark:bg-[#132d4a] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between gap-3 p-5 text-left cursor-pointer"
                  >
                    <h3 className="font-bold text-[#1B3A5C] dark:text-white text-sm sm:text-base">{f.q}</h3>
                    <ChevronDown className={"h-5 w-5 text-[#D4A843] shrink-0 transition-transform duration-300 " + (isOpen ? "rotate-180" : "")} />
                  </button>
                  <div className={"grid transition-all duration-300 ease-in-out " + (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                      <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50 leading-relaxed px-5 pb-5 pt-0">{f.a}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#1B3A5C] to-[#0f2a45]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Prêt à commencer votre parcours ?</h2>
          <p className="text-white/60 mb-8">Inscrivez-vous maintenant et commencez votre formation en allemand.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact"><Button size="lg" className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold px-8">S'inscrire maintenant</Button></Link>
            <Link href="/cours"><Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8">Voir les cours</Button></Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
