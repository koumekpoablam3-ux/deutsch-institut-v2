"use client"

import { useState } from "react"
import { GraduationCap, Loader2, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSent(true)
      } else {
        setError(data.error || "Une erreur est survenue.")
      }
    } catch {
      setError("Erreur de connexion au serveur. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5C] flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="h-6 w-6 text-[#D4A843]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1B3A5C] dark:text-white">Mot de passe oublié</h1>
          <p className="text-sm text-[#1B3A5C]/50 dark:text-white/40 mt-2">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <Mail className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-sm text-[#1B3A5C]/70 dark:text-white/60 leading-relaxed">
              Si un compte existe avec l&apos;adresse <strong className="text-[#1B3A5C] dark:text-white">{email}</strong>, un lien de réinitialisation vient d&apos;être envoyé.
            </p>
            <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">
              Pensez à vérifier vos courriers indésirables (spam).
            </p>

          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Email</Label>
              <Input
                type="email"
                placeholder="votre@email.com"
                className="h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-[#1B3A5C] hover:bg-[#0f2a45] text-white font-bold h-11">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </span>
              ) : (
                "Envoyer le lien"
              )}
            </Button>
          </form>
        )}

        <p className="text-center text-sm mt-6">
          <Link href="/login" className="text-[#D4A843] font-medium flex items-center justify-center gap-1 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la connexion
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
