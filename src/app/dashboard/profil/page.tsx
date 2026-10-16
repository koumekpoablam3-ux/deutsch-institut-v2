"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import {
  LayoutDashboard, BookOpen, Library, RefreshCw, LogOut, Menu,
  GraduationCap, Loader2, User, Lock, Eye, EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const LEVELS = [
  { label: "Débutant (A1)", value: "A1" },
  { label: "Élémentaire (A2)", value: "A2" },
  { label: "Intermédiaire (B1)", value: "B1" },
  { label: "Avancé (B2)", value: "B2" },
  { label: "Confirmé (C1)", value: "C1" },
]

interface Profile {
  id: string
  name: string
  email: string
  telephone: string | null
  niveau: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { update } = useSession()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [telephone, setTelephone] = useState("")
  const [niveau, setNiveau] = useState("A1")

  const [showPwFields, setShowPwFields] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPw, setShowPw] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile")
      if (res.status === 401) { router.push("/login"); return }
      const data = await res.json()
      if (res.ok) {
        const user = data.data?.user
        setProfile(user)
        setName(user.name)
        setTelephone(user.telephone || "")
        setNiveau(user.niveau)
      }
    } catch { /* noop */ }
    finally { setLoading(false) }
  }, [router])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, string> = { name, telephone, niveau }
      if (showPwFields && newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success("Profil mis à jour avec succès")
        setProfile(data.data?.user)
        setCurrentPassword("")
        setNewPassword("")
        setShowPwFields(false)
        // Rafraîchit immédiatement la session côté client (nom / niveau affichés)
        const updatedUser = data.data?.user
        await update({ name: updatedUser.name, niveau: updatedUser.niveau })
      } else {
        toast.error(data.error || "Erreur lors de la mise à jour")
      }
    } catch {
      toast.error("Erreur de connexion au serveur")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex">
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className={"fixed top-0 left-0 h-full w-64 bg-[#1B3A5C] text-white z-50 transition-transform lg:translate-x-0 " + (open ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-5 flex items-center gap-2.5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-[#D4A843] flex items-center justify-center"><GraduationCap className="h-5 w-5 text-white" /></div>
          <div><p className="font-bold text-sm">Deutsch-Institut</p><p className="text-[10px] text-white/50">{profile?.niveau || "A1"}</p></div>
        </div>
        <nav className="p-3 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Tableau de bord", href: "/dashboard" },
            { icon: BookOpen, label: "Mes cours", href: "/cours" },
            { icon: Library, label: "Catalogue", href: "/cours" },
            { icon: RefreshCw, label: "Révision IA", href: "/entrainement-ia" },
            { icon: User, label: "Mon profil", href: "/dashboard/profil", active: true },
          ].map((item) => (
            <a key={item.label} href={item.href} className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm " + (item.active ? "bg-[#D4A843]/20 text-[#D4A843] font-semibold" : "text-white/60 hover:text-white hover:bg-white/5")}>
              <item.icon className="h-5 w-5" />{item.label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <div className="px-3 py-2 mb-2"><p className="text-sm font-medium text-white/80">{profile?.name || ""}</p><p className="text-[10px] text-white/40">{profile?.email || ""}</p></div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full"><LogOut className="h-5 w-5" />Se déconnecter</button>
        </div>
      </div>

      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setOpen(true)} className="lg:hidden"><Menu className="h-6 w-6 text-[#1B3A5C] dark:text-white" /></button>
            <h1 className="text-xl font-bold text-[#1B3A5C] dark:text-white">Mon profil</h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Nom complet</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]" />
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Email</Label>
              <Input value={profile?.email || ""} disabled className="h-11 border-[#1B3A5C]/20 opacity-60" />
              <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 mt-1">L&apos;email ne peut pas être modifié.</p>
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Téléphone</Label>
              <Input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]" />
            </div>
            <div>
              <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Niveau d&apos;allemand</Label>
              <Select value={niveau} onValueChange={(v) => setNiveau(v ?? "A1")}>
                <SelectTrigger className="w-full h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]">
                  <SelectValue placeholder="Sélectionner votre niveau" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t border-[#1B3A5C]/10 dark:border-white/10">
              <button type="button" onClick={() => setShowPwFields(!showPwFields)} className="flex items-center gap-2 text-sm font-semibold text-[#1B3A5C] dark:text-white mb-3">
                <Lock className="h-4 w-4" /> Changer le mot de passe
              </button>

              {showPwFields && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        type={showPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-11 pr-10 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3A5C]/40">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Nouveau mot de passe</Label>
                    <Input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      className="h-11 border-[#1B3A5C]/20 focus:border-[#D4A843]"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold h-11">
              {saving ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Enregistrement...</span> : "Enregistrer les modifications"}
            </Button>
          </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
