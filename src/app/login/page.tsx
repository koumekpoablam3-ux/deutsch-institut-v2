"use client"

import { useState } from "react"
import { Eye, EyeOff, Globe, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

const LEVELS = [
  { label: "Débutant (A1)", value: "A1" },
  { label: "Élémentaire (A2)", value: "A2" },
  { label: "Intermédiaire (B1)", value: "B1" },
  { label: "Interm. Supérieur (B2)", value: "B2" },
  { label: "Avancé (C1)", value: "C1" },
  { label: "Maîtrise (C2)", value: "C2" },
]

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login")
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  // Register state
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirmPw, setRegConfirmPw] = useState("")
  const [regTelephone, setRegTelephone] = useState("")
  const [regLevel, setRegLevel] = useState("A1")
  const [regLoading, setRegLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      }) as { error?: string; ok?: boolean } | undefined;

      if (result?.error) {
        setLoginError("Email ou mot de passe incorrect")
        setLoginLoading(false)
        return
      }

      // Connexion réussie : on redirige manuellement
      window.location.href = "/dashboard"
    } catch {
      setLoginError("Une erreur est survenue. Veuillez réessayer.")
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (regPassword !== regConfirmPw) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    setRegLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          telephone: regTelephone || undefined,
          niveau: regLevel,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.")
        setTab("login")
        setLoginEmail(regEmail)
        // Reset register fields
        setRegName("")
        setRegEmail("")
        setRegPassword("")
        setRegConfirmPw("")
        setRegTelephone("")
        setRegLevel("A1")
      } else {
        toast.error(data.error || "Erreur lors de la création du compte")
      }
    } catch {
      toast.error("Erreur de connexion au serveur. Veuillez réessayer.")
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5C] flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="h-6 w-6 text-[#D4A843]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1B3A5C] dark:text-white">Deutsch-Institut</h1>
          <p className="text-sm text-[#1B3A5C]/50 dark:text-white/40 mt-1">Deutsch Für Alle</p>
        </div>

        <div className="flex mb-6 bg-[#f8f9fb] dark:bg-[#0a1628] rounded-lg p-1">
          <button onClick={() => { setTab("login"); setLoginError("") }} className={"flex-1 py-2 rounded-md text-sm font-semibold transition-colors " + (tab === "login" ? "bg-white dark:bg-[#132d4a] shadow text-[#1B3A5C] dark:text-white" : "text-[#1B3A5C]/50 dark:text-white/40")}>Se connecter</button>
          <button onClick={() => setTab("register")} className={"flex-1 py-2 rounded-md text-sm font-semibold transition-colors " + (tab === "register" ? "bg-white dark:bg-[#132d4a] shadow text-[#1B3A5C] dark:text-white" : "text-[#1B3A5C]/50 dark:text-white/40")}>Créer un compte</button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Email</Label>
              <Input
                type="email"
                placeholder="votre@email.com"
                className="h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Mot de passe</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Mot de passe"
                  className="h-11 pr-10 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3A5C]/40">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center">{loginError}</p>
            )}

            <Button type="submit" disabled={loginLoading} className="w-full bg-[#1B3A5C] hover:bg-[#0f2a45] text-white font-bold h-11">
              {loginLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
            <p className="text-center text-sm"><Link href="/forgot-password" className="text-[#D4A843] font-medium hover:underline">Mot de passe oublié ?</Link></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Nom complet</Label>
              <Input
                placeholder="Votre nom"
                className="h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Email</Label>
              <Input
                type="email"
                placeholder="votre@email.com"
                className="h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Mot de passe</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Mot de passe (min. 6 caractères)"
                  className="h-11 pr-10 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
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
                  value={regConfirmPw}
                  onChange={(e) => setRegConfirmPw(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3A5C]/40">
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Téléphone</Label>
              <Input
                type="tel"
                placeholder="+33 6 12 34 56 78 (optionnel)"
                className="h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                value={regTelephone}
                onChange={(e) => setRegTelephone(e.target.value)}
                autoComplete="tel"
              />
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Niveau d&apos;allemand</Label>
              <Select value={regLevel} onValueChange={(v) => setRegLevel(v ?? "A1")}>
                <SelectTrigger className="w-full h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]">
                  <SelectValue placeholder="Sélectionner votre niveau" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={regLoading} className="w-full bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold h-11">
              {regLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création...
                </span>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>
        )}

        <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-[#1B3A5C]/10" /><span className="text-xs text-[#1B3A5C]/40 dark:text-white/30">ou</span><div className="flex-1 h-px bg-[#1B3A5C]/10" /></div>
        <div className="relative group">
          <Button type="button" variant="outline" disabled className="w-full border-[#1B3A5C]/20 text-[#1B3A5C]/40 dark:text-white/30 font-medium h-11 cursor-not-allowed">
            <Globe className="mr-2 h-4 w-4" />S&apos;inscrire avec Google
          </Button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1B3A5C] dark:bg-white text-white dark:text-[#1B3A5C] text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            Bientôt disponible
          </div>
        </div>
        <p className="text-center text-sm text-[#1B3A5C]/50 dark:text-white/40 mt-6"><Link href="/" className="text-[#D4A843] font-medium">Retour à l&apos;accueil</Link></p>
      </motion.div>
    </div>
  )
}
