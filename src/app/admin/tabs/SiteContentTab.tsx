"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { DEFAULT_CTA, DEFAULT_STATS, type CtaSettings, type StatsSettings } from "@/lib/site-content"

const labelCls = "mb-1.5 block text-[#1B3A5C] dark:text-white/80"
const card = "bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm"

export default function SiteContentTab() {
  const [stats, setStats] = useState<StatsSettings>(DEFAULT_STATS)
  const [cta, setCta] = useState<CtaSettings>(DEFAULT_CTA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<"stats" | "cta" | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (res.ok) { setStats(data.stats); setCta(data.cta) }
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const save = async (key: "stats" | "cta", value: StatsSettings | CtaSettings) => {
    setSaving(key)
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) })
      const data = await res.json()
      if (res.ok) toast.success(data.message || "Enregistré")
      else toast.error(data.error || "Erreur lors de l'enregistrement")
    } catch { toast.error("Erreur de connexion") }
    finally { setSaving(null) }
  }

  const updateItem = (i: number, patch: Partial<{ value: string; label: string }>) =>
    setStats((s) => ({ ...s, items: s.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }))

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>

  return (
    <div className="space-y-6">
      {/* Chiffres clés */}
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1B3A5C] dark:text-white">Chiffres clés (sous le carrousel)</h2>
          <label className="flex items-center gap-2 text-sm text-[#1B3A5C] dark:text-white/80"><input type="checkbox" checked={stats.enabled} onChange={(e) => setStats({ ...stats, enabled: e.target.checked })} />Afficher la section</label>
        </div>
        <div className="space-y-3">
          {stats.items.map((it, i) => (
            <div key={i} className="flex gap-3 items-end">
              <div className="w-32"><Label className={labelCls}>Valeur</Label><Input maxLength={20} value={it.value} onChange={(e) => updateItem(i, { value: e.target.value })} /></div>
              <div className="flex-1"><Label className={labelCls}>Libellé</Label><Input maxLength={60} value={it.label} onChange={(e) => updateItem(i, { label: e.target.value })} /></div>
              <button onClick={() => setStats((s) => ({ ...s, items: s.items.filter((_, idx) => idx !== i) }))} className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <Button type="button" variant="outline" size="sm" disabled={stats.items.length >= 8} onClick={() => setStats((s) => ({ ...s, items: [...s.items, { value: "", label: "" }] }))}><Plus className="h-4 w-4 mr-1.5" />Ajouter un chiffre</Button>
          <Button onClick={() => save("stats", stats)} disabled={saving === "stats"} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">{saving === "stats" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}</Button>
        </div>
      </div>

      {/* Appel à l'action */}
      <div className={card}>
        <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-4">Bandeau final de la page d&apos;accueil</h2>
        <div className="space-y-4">
          <div><Label className={labelCls}>Titre</Label><Input maxLength={120} value={cta.title} onChange={(e) => setCta({ ...cta, title: e.target.value })} /></div>
          <div><Label className={labelCls}>Texte</Label><Textarea rows={2} maxLength={300} value={cta.text} onChange={(e) => setCta({ ...cta, text: e.target.value })} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label className={labelCls}>Bouton principal : texte</Label><Input maxLength={40} value={cta.primaryLabel} onChange={(e) => setCta({ ...cta, primaryLabel: e.target.value })} /></div>
            <div><Label className={labelCls}>Bouton principal : lien</Label><Input value={cta.primaryHref} onChange={(e) => setCta({ ...cta, primaryHref: e.target.value })} /></div>
            <div><Label className={labelCls}>Bouton secondaire : texte (vide = masqué)</Label><Input maxLength={40} value={cta.secondaryLabel} onChange={(e) => setCta({ ...cta, secondaryLabel: e.target.value })} /></div>
            <div><Label className={labelCls}>Bouton secondaire : lien</Label><Input value={cta.secondaryHref} onChange={(e) => setCta({ ...cta, secondaryHref: e.target.value })} /></div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => save("cta", cta)} disabled={saving === "cta"} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">{saving === "cta" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}</Button>
        </div>
      </div>
    </div>
  )
}
