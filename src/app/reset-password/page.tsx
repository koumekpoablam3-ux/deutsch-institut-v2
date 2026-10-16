"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GraduationCap, Loader2, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { motion } from "framer-motion"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Lien de réinitialisation invalide ou incomplet.")
      return
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess(true)
        setTimeout(() => router.push("/login"), 2500)
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
          <h1 className="text-2xl font-extrabold text-[#1B3A5C] dark:text-white">Nouveau mot de passe</h1>
          <p className="text-sm text-[#1B3A5C]/50 dark:text-white/40 mt-1">Choisissez un mot de passe d&apos;au moins 6 caractères.</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-sm text-[#1B3A5C]/70 dark:text-white/60">
              Votre mot de passe a été réinitialisé avec succès. Redirection vers la connexion...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 caractères"
                  className="h-11 pr-10 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3A5C]/40">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  className="h-11 pr-10 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3A5C]/40">
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-[#1B3A5C] hover:bg-[#0f2a45] text-white font-bold h-11">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </span>
              ) : (
                "Réinitialiser le mot de passe"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
