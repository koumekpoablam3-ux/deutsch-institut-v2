"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import ImagePicker from "../components/ImagePicker"
import {
  DEFAULT_CTA, DEFAULT_FEATURES, DEFAULT_STATS, DEFAULT_TESTIMONIALS, FEATURE_ICONS, FEATURE_ICON_LABELS,
  type CtaSettings, type FeaturesSettings, type StatsSettings, type TestimonialsSettings,
} from "@/lib/site-content"

type SaveKey = "stats" | "cta" | "features" | "testimonials"
const selectCls = "w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm text-[#1B3A5C] dark:text-white"

const labelCls = "mb-1.5 block text-[#1B3A5C] dark:text-white/80"
const card = "bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm"

export default function SiteContentTab() {
  const [stats, setStats] = useState<StatsSettings>(DEFAULT_STATS)
  const [cta, setCta] = useState<CtaSettings>(DEFAULT_CTA)
  const [features, setFeatures] = useState<FeaturesSettings>(DEFAULT_FEATURES)
  const [testimonials, setTestimonials] = useState<TestimonialsSettings>(DEFAULT_TESTIMONIALS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<SaveKey | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (res.ok) { setStats(data.stats); setCta(data.cta); setFeatures(data.features); setTestimonials(data.testimonials) }
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const save = async (key: SaveKey, value: StatsSettings | CtaSettings | FeaturesSettings | TestimonialsSettings) => {
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

  const updateFeature = (i: number, patch: Partial<FeaturesSettings["items"][number]>) =>
    setFeatures((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }))
  const updateTestimonial = (i: number, patch: Partial<TestimonialsSettings["items"][number]>) =>
    setTestimonials((t) => ({ ...t, items: t.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }))

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

      {/* Section « Pourquoi nous choisir » */}
      <div className={card}>
        <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-4">Section « Pourquoi nous choisir »</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label className={labelCls}>Petit titre</Label><Input maxLength={60} value={features.eyebrow} onChange={(e) => setFeatures({ ...features, eyebrow: e.target.value })} /></div>
          <div><Label className={labelCls}>Titre</Label><Input maxLength={120} value={features.title} onChange={(e) => setFeatures({ ...features, title: e.target.value })} /></div>
        </div>
        <div className="mt-4"><Label className={labelCls}>Texte d&apos;introduction</Label><Textarea rows={2} maxLength={300} value={features.subtitle} onChange={(e) => setFeatures({ ...features, subtitle: e.target.value })} /></div>
        <div className="space-y-4 mt-5">
          {features.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-[#1B3A5C]/10 dark:border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1B3A5C] dark:text-white">Carte {i + 1}</p>
                <button onClick={() => setFeatures((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Supprimer la carte"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2"><Label className={labelCls}>Titre</Label><Input maxLength={80} value={it.title} onChange={(e) => updateFeature(i, { title: e.target.value })} /></div>
                <div><Label className={labelCls}>Icône</Label><select className={selectCls} value={it.icon} onChange={(e) => updateFeature(i, { icon: e.target.value as typeof it.icon })}>{FEATURE_ICONS.map((ic) => <option key={ic} value={ic}>{FEATURE_ICON_LABELS[ic]}</option>)}</select></div>
              </div>
              <div><Label className={labelCls}>Description</Label><Textarea rows={3} maxLength={500} value={it.description} onChange={(e) => updateFeature(i, { description: e.target.value })} /></div>
              <ImagePicker label="Image" value={it.image} onChange={(v) => updateFeature(i, { image: v })} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <Button type="button" variant="outline" size="sm" disabled={features.items.length >= 8} onClick={() => setFeatures((f) => ({ ...f, items: [...f.items, { icon: "star", title: "", description: "", image: "/images/features/certification.jpg" }] }))}><Plus className="h-4 w-4 mr-1.5" />Ajouter une carte</Button>
          <Button onClick={() => save("features", features)} disabled={saving === "features"} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">{saving === "features" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}</Button>
        </div>
      </div>

      {/* Témoignages de l'accueil */}
      <div className={card}>
        <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-4">Témoignages de la page d&apos;accueil</h2>
        <div className="space-y-4">
          {testimonials.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-[#1B3A5C]/10 dark:border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1B3A5C] dark:text-white">Témoignage {i + 1}</p>
                <button onClick={() => setTestimonials((t) => ({ ...t, items: t.items.filter((_, idx) => idx !== i) }))} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div><Label className={labelCls}>Nom</Label><Input maxLength={60} value={it.name} onChange={(e) => updateTestimonial(i, { name: e.target.value })} /></div>
                <div><Label className={labelCls}>Niveau / statut</Label><Input maxLength={60} placeholder="Étudiant B1" value={it.level} onChange={(e) => updateTestimonial(i, { level: e.target.value })} /></div>
                <div><Label className={labelCls}>Note</Label><select className={selectCls} value={it.stars} onChange={(e) => updateTestimonial(i, { stars: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>)}</select></div>
              </div>
              <div><Label className={labelCls}>Témoignage</Label><Textarea rows={3} maxLength={500} value={it.text} onChange={(e) => updateTestimonial(i, { text: e.target.value })} /></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <Button type="button" variant="outline" size="sm" disabled={testimonials.items.length >= 9} onClick={() => setTestimonials((t) => ({ ...t, items: [...t.items, { name: "", level: "", stars: 5, text: "" }] }))}><Plus className="h-4 w-4 mr-1.5" />Ajouter un témoignage</Button>
          <Button onClick={() => save("testimonials", testimonials)} disabled={saving === "testimonials"} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">{saving === "testimonials" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}</Button>
        </div>
      </div>
    </div>
  )
}
