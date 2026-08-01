"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, ArrowRight, ArrowLeft, RotateCcw, GraduationCap, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

interface Question {
  id: number
  category: "vocabulaire" | "grammaire" | "comprehension"
  level: string
  question: string
  options: string[]
  correct: number
}

const questions: Question[] = [
  // VOCABULAIRE (3 questions)
  {
    id: 1, category: "vocabulaire", level: "A1",
    question: "Comment dit-on \"bonjour\" en allemand ?",
    options: ["Auf Wiedersehen", "Guten Morgen", "Gute Nacht", "Danke"],
    correct: 1,
  },
  {
    id: 2, category: "vocabulaire", level: "B1",
    question: "Quel est le contraire de \"teuer\" (cher) ?",
    options: ["schön", "billig", "schnell", "klein"],
    correct: 1,
  },
  {
    id: 3, category: "vocabulaire", level: "B2",
    question: "Le mot \"die Nachhaltigkeit\" correspond à :",
    options: ["La nostalgie", "La durabilité", "La ponctualité", "La confidentialité"],
    correct: 1,
  },
  // GRAMMAIRE (4 questions)
  {
    id: 4, category: "grammaire", level: "A1",
    question: "Quelle est la forme correcte du verbe \"sein\" (être) à la 3ème personne du singulier ?",
    options: ["Ich bin", "Du bist", "Er ist", "Wir sind"],
    correct: 2,
  },
  {
    id: 5, category: "grammaire", level: "A2",
    question: "Complétez : \"Ich ___ gestern ins Kino gegangen.\"",
    options: ["habe", "bin", "war", "wurde"],
    correct: 1,
  },
  {
    id: 6, category: "grammaire", level: "B1",
    question: "Quelle est la bonne déclinaison ? \"Ich helfe ___ Mann.\"",
    options: ["der", "dem", "den", "des"],
    correct: 1,
  },
  {
    id: 7, category: "grammaire", level: "C1",
    question: "Quelle phrase utilise correctement le subjonctif II ?",
    options: [
      "Wenn ich reich bin, kaufe ich ein Haus.",
      "Wenn ich reich wäre, würde ich ein Haus kaufen.",
      "Wenn ich reich habe, kaufte ich ein Haus.",
      "Wenn ich reich geworden bin, kaufte ich ein Haus."
    ],
    correct: 1,
  },
  // COMPRÉHENSION (3 questions)
  {
    id: 8, category: "comprehension", level: "A1",
    question: "\"Mein Name ist Anna. Ich komme aus Frankreich und wohne jetzt in Berlin.\" - D'où vient Anna ?",
    options: ["D'Allemagne", "De France", "D'Autriche", "De Suisse"],
    correct: 1,
  },
  {
    id: 9, category: "comprehension", level: "B2",
    question: "\"Trotz der schwierigen wirtschaftlichen Lage hat das Unternehmen seine Ziele erreicht.\" - Que signifie cette phrase ?",
    options: [
      "L'entreprise a échoué à cause de l'économie.",
      "L'entreprise a réussi malgré les difficultés économiques.",
      "L'entreprise a dû fermer ses portes.",
      "Les objectifs de l'entreprise étaient trop ambitieux."
    ],
    correct: 1,
  },
  {
    id: 10, category: "comprehension", level: "B1",
    question: "\"Bitte bringen Sie das Formular bis spätestens Freitag zurückschicken.\" - Que faut-il faire ?",
    options: [
      "Venir au bureau le vendredi.",
      "Renvoyer le formulaire avant le vendredi au plus tard.",
      "Remplir le formulaire le vendredi.",
      "Appeler le vendredi pour le formulaire."
    ],
    correct: 1,
  },
]

function getResult(score: number) {
  if (score <= 3) return { level: "A1", label: "Débutant", description: "Vous êtes au début de votre parcours en allemand. Nos cours A1 sont faits pour vous !", color: "from-[#16a34a] to-[#4ade80]" }
  if (score <= 5) return { level: "A2", label: "Élémentaire", description: "Vous avez les bases. Le niveau A2 vous permettra de consolider vos acquis.", color: "from-[#D4A843] to-[#E8C76A]" }
  if (score <= 7) return { level: "B1", label: "Intermédiaire", description: "Bon niveau ! Le B1 vous ouvrira de nouvelles perspectives professionnelles.", color: "from-[#1B3A5C] to-[#3b82f6]" }
  if (score <= 9) return { level: "B2", label: "Intermédiaire supérieur", description: "Excellent ! Vous maîtrisez bien l'allemand. Passez au B2 pour vous perfectionner.", color: "from-[#7c3aed] to-[#a78bfa]" }
  return { level: "C1", label: "Avancé", description: "Impressionnant ! Vous avez un niveau avancé. Le C1 est le chemin vers l'excellence.", color: "from-[#dc2626] to-[#f87171]" }
}

export default function TestDeNiveauPage() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [showResult, setShowResult] = useState(false)

  const score = answers.filter((a, i) => a === questions[i].correct).length
  const result = getResult(score)
  const progress = ((current + 1) / questions.length) * 100

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[current] = optionIndex
    setAnswers(newAnswers)
  }

  const goNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1)
    else setShowResult(true)
  }

  const goPrev = () => {
    if (current > 0) setCurrent(current - 1)
  }

  const restart = () => {
    setCurrent(0)
    setAnswers(new Array(questions.length).fill(null))
    setShowResult(false)
  }

  const q = questions[current]
  const categoryLabels = { vocabulaire: "Vocabulaire", grammaire: "Grammaire", comprehension: "Compréhension" }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 text-[#D4A843] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <GraduationCap className="h-3.5 w-3.5" /> Test de niveau
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-3">Évaluez votre niveau d'allemand</h1>
            <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-xl mx-auto">10 questions pour déterminer votre niveau. Répondez honnêtement pour obtenir une recommandation personnalisée.</p>
          </div>

          {/* Progress bar */}
          {!showResult && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#1B3A5C]/50 dark:text-white/40">Question {current + 1} / {questions.length}</span>
                <span className="text-xs font-semibold text-[#D4A843]">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#1B3A5C]/10 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#D4A843] to-[#E8C76A]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold bg-[#1B3A5C]/10 dark:bg-white/10 text-[#1B3A5C]/60 dark:text-white/60 px-2.5 py-1 rounded-full">{categoryLabels[q.category]}</span>
                  <span className="text-xs font-bold bg-[#D4A843]/10 text-[#D4A843] px-2.5 py-1 rounded-full">Niveau {q.level}</span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-[#1B3A5C] dark:text-white mb-6">{q.question}</h2>

                <div className="space-y-3">
                  {q.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={"w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all " + (
                        answers[current] === i
                          ? "border-[#D4A843] bg-[#D4A843]/10 text-[#1B3A5C] dark:text-white"
                          : "border-[#1B3A5C]/10 dark:border-white/10 text-[#1B3A5C]/70 dark:text-white/60 hover:border-[#D4A843]/30 hover:bg-[#D4A843]/5"
                      )}
                    >
                      <span className={"inline-flex items-center justify-center w-7 h-7 rounded-full border-2 mr-3 text-xs font-bold " + (
                        answers[current] === i
                          ? "border-[#D4A843] text-[#D4A843] bg-[#D4A843]/10"
                          : "border-[#1B3A5C]/20 dark:border-white/20 text-[#1B3A5C]/40"
                      )}>{String.fromCharCode(65 + i)}</span>
                      {option}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={goPrev} disabled={current === 0} className="text-sm">
                    <ArrowLeft className="h-4 w-4 mr-1.5" /> Précédent
                  </Button>
                  <Button onClick={goNext} disabled={answers[current] === null} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">
                    {current === questions.length - 1 ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 shadow-sm text-center"
              >
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${result.color} mb-6`}>
                  <Trophy className="h-10 w-10 text-white" />
                </div>

                <h2 className="text-2xl font-extrabold text-[#1B3A5C] dark:text-white mb-2">Votre niveau estimé : {result.level}</h2>
                <p className="text-[#D4A843] font-semibold mb-4">{result.label}</p>
                <p className="text-[#1B3A5C]/60 dark:text-white/50 mb-2">Score : {score} / {questions.length}</p>
                <p className="text-[#1B3A5C]/70 dark:text-white/60 mb-8 max-w-md mx-auto">{result.description}</p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button onClick={restart} variant="outline" className="text-sm">
                    <RotateCcw className="h-4 w-4 mr-1.5" /> Recommencer
                  </Button>
                  <Link href="/cours">
                    <Button className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold text-sm px-6">
                      <CheckCircle className="h-4 w-4 mr-1.5" /> Voir les cours {result.level}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  )
}