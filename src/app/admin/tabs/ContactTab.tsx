"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { DEFAULT_CONTACT, type ContactSettings } from "@/lib/site-content"

const labelCls = "mb-1.5 block text-[#1B3A5C] dark:text-white/80"
const card = "bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm"

export default function ContactTab() {
  const [c, setC] = useState<ContactSettings>(DEFAULT_CONTACT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (res.ok) setC(data.contact)
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const set = <K extends keyof ContactSettings>(k: K, v: ContactSettings[K]) => setC((prev) => ({ ...prev, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "contact", value: c }) })
      const data = await res.json()
      if (res.ok) { setC(data.value); toast.success("Coordonnées enregistrées (visibles sous quelques secondes)") }
      else toast.error(data.error || "Erreur lors de l'enregistrement")
    } catch { toast.error("Erreur de connexion") }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className={card}>
        <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-4">Identité et pied de page</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label className={labelCls}>Nom de l&apos;institut</Label><Input maxLength={60} value={c.siteName} onChange={(e) => set("siteName", e.target.value)} /></div>
          <div><Label className={labelCls}>Slogan</Label><Input maxLength={80} value={c.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
        </div>
        <div className="mt-4"><Label className={labelCls}>Texte de présentation du pied de page</Label><Textarea rows={3} maxLength={400} value={c.footerText} onChange={(e) => set("footerText", e.target.value)} /></div>
      </div>

      <div className={card}>
        <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-4">Coordonnées (pied de page et page Contact)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label className={labelCls}>Téléphone</Label><Input value={c.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><Label className={labelCls}>Précision sous le téléphone</Label><Input value={c.phoneNote} onChange={(e) => set("phoneNote", e.target.value)} /></div>
          <div><Label className={labelCls}>Email</Label><Input type="email" value={c.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><Label className={labelCls}>Précision sous l&apos;email</Label><Input value={c.emailNote} onChange={(e) => set("emailNote", e.target.value)} /></div>
          <div><Label className={labelCls}>Ville / pays</Label><Input value={c.city} onChange={(e) => set("city", e.target.value)} /></div>
          <div><Label className={labelCls}>Adresse précise</Label><Input value={c.addressDetail} onChange={(e) => set("addressDetail", e.target.value)} /></div>
          <div><Label className={labelCls}>Jours d&apos;ouverture</Label><Input value={c.hoursDays} onChange={(e) => set("hoursDays", e.target.value)} /></div>
          <div><Label className={labelCls}>Heures d&apos;ouverture</Label><Input value={c.hoursTime} onChange={(e) => set("hoursTime", e.target.value)} /></div>
        </div>
      </div>

      <div className={card}>
        <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-4">WhatsApp</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className={labelCls}>Numéro (avec l&apos;indicatif pays, sans + ni espaces)</Label>
            <Input inputMode="numeric" placeholder="22893839645" value={c.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} />
          </div>
          <div><Label className={labelCls}>Numéro affiché au public</Label><Input placeholder="+228 93 83 96 45" value={c.whatsappDisplay} onChange={(e) => set("whatsappDisplay", e.target.value)} /></div>
        </div>
      </div>

      <div className={card}>
        <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-4">Réseaux sociaux</h2>
        <div><Label className={labelCls}>Texte au-dessus des boutons</Label><Input maxLength={200} value={c.socialText} onChange={(e) => set("socialText", e.target.value)} /></div>
        <div className="space-y-3 mt-4">
          {c.socials.map((so, i) => (
            <div key={i} className="flex gap-3 items-end">
              <div className="w-40"><Label className={labelCls}>Nom</Label><Input maxLength={30} placeholder="Facebook" value={so.label} onChange={(e) => set("socials", c.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} /></div>
              <div className="flex-1"><Label className={labelCls}>Lien</Label><Input placeholder="https://..." value={so.url} onChange={(e) => set("socials", c.socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} /></div>
              <button onClick={() => set("socials", c.socials.filter((_, j) => j !== i))} className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-3" disabled={c.socials.length >= 6} onClick={() => set("socials", [...c.socials, { label: "", url: "" }])}><Plus className="h-4 w-4 mr-1.5" />Ajouter un réseau</Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer les coordonnées"}</Button>
      </div>
    </div>
  )
}
