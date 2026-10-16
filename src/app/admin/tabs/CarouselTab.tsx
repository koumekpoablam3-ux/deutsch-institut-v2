"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Loader2, Plus, Pencil, Trash2, X, Eye, EyeOff, ArrowUp, ArrowDown, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import ImagePicker from "../components/ImagePicker"
import TagInput from "../components/TagInput"
import { DEFAULT_BUTTONS, DEFAULT_HERO_SETTINGS, type HeroSettings, type HeroSlideData } from "@/lib/site-content"

type SlideForm = Omit<HeroSlideData, "id" | "position">

const emptyForm: SlideForm = {
  active: true, image: "", overlay: 100, title: "", highlight: "", subtitle: "", badge: null,
  pills: [], tags: [], tagsTitle: null, partnerName: null, partnerLogo: null, partnerText: null,
  showButtons: true, primaryLabel: null, primaryHref: null, secondaryLabel: null, secondaryHref: null,
}

const toForm = (s: HeroSlideData): SlideForm => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, position, ...rest } = s
  return rest
}

const labelCls = "mb-1.5 block text-[#1B3A5C] dark:text-white/80"

export default function CarouselTab() {
  const [slides, setSlides] = useState<HeroSlideData[]>([])
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<HeroSlideData | null>(null)
  const [form, setForm] = useState<SlideForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, c] = await Promise.all([fetch("/api/admin/hero-slides"), fetch("/api/admin/settings")])
      const sd = await s.json()
      const cd = await c.json()
      if (s.ok) setSlides(sd.slides || [])
      else toast.error(sd.error || "Erreur lors du chargement des slides")
      if (c.ok) setSettings(cd.hero)
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (s: HeroSlideData) => { setEditing(s); setForm(toForm(s)); setModalOpen(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image) { toast.error("Choisissez une image de fond"); return }
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/admin/hero-slides/${editing.id}` : "/api/admin/hero-slides", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) { toast.success(data.message || "Slide enregistré"); setModalOpen(false); fetchAll() }
      else toast.error(data.error || "Erreur lors de l'enregistrement")
    } catch { toast.error("Erreur de connexion") }
    finally { setSaving(false) }
  }

  const toggleActive = async (s: HeroSlideData) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !s.active }) })
      if (res.ok) setSlides((prev) => prev.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)))
      else toast.error("Erreur lors de la mise à jour")
    } catch { toast.error("Erreur de connexion") }
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= slides.length) return
    const next = [...slides]
    ;[next[index], next[target]] = [next[target], next[index]]
    setSlides(next)
    try {
      const res = await fetch("/api/admin/hero-slides/reorder", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: next.map((x) => x.id) }) })
      if (!res.ok) { toast.error("Erreur lors du changement d'ordre"); fetchAll() }
    } catch { toast.error("Erreur de connexion"); fetchAll() }
  }

  const duplicate = async (s: HeroSlideData) => {
    try {
      const res = await fetch("/api/admin/hero-slides", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...toForm(s), active: false, title: s.title + " (copie)" }) })
      if (res.ok) { toast.success("Slide dupliqué (masqué par défaut)"); fetchAll() }
      else toast.error("Erreur lors de la duplication")
    } catch { toast.error("Erreur de connexion") }
  }

  const handleDelete = async (s: HeroSlideData) => {
    if (!confirm(`Supprimer le slide « ${s.title} » ?`)) return
    try {
      const res = await fetch(`/api/admin/hero-slides/${s.id}`, { method: "DELETE" })
      if (res.ok) { setSlides((prev) => prev.filter((x) => x.id !== s.id)); toast.success("Slide supprimé") }
      else toast.error("Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
  }

  const loadDefaults = async () => {
    try {
      const res = await fetch("/api/admin/hero-slides/defaults", { method: "POST" })
      const data = await res.json()
      if (res.ok) { toast.success(data.message); fetchAll() } else toast.error(data.error || "Erreur")
    } catch { toast.error("Erreur de connexion") }
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "hero", value: settings }) })
      const data = await res.json()
      if (res.ok) toast.success(data.message || "Réglages enregistrés")
      else toast.error(data.error || "Erreur lors de l'enregistrement")
    } catch { toast.error("Erreur de connexion") }
    finally { setSavingSettings(false) }
  }

  const set = <K extends keyof SlideForm>(key: K, value: SlideForm[K]) => setForm((f) => ({ ...f, [key]: value }))
  const orNull = (v: string) => (v === "" ? null : v)

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>

  return (
    <div className="space-y-6">
      {/* Réglages généraux */}
      <div className="bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-4">Réglages du carrousel</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <Label className={labelCls}>Durée entre deux slides (secondes)</Label>
            <Input type="number" min={3} max={60} value={settings.intervalSeconds} onChange={(e) => setSettings({ ...settings, intervalSeconds: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <Label className={labelCls}>Badge affiché au-dessus du titre</Label>
            <Input value={settings.badgeText} maxLength={80} onChange={(e) => setSettings({ ...settings, badgeText: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-[#1B3A5C] dark:text-white/80">
          {([["autoplay", "Défilement automatique"], ["badgeEnabled", "Afficher le badge"], ["showDots", "Afficher les points"], ["showArrows", "Afficher les flèches"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={settings[k]} onChange={(e) => setSettings({ ...settings, [k]: e.target.checked })} />{l}</label>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={saveSettings} disabled={savingSettings} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">
            {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer les réglages"}
          </Button>
        </div>
      </div>

      {/* Liste des slides */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#1B3A5C] dark:text-white">Slides ({slides.length})</h2>
        <Button onClick={openCreate} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm"><Plus className="h-4 w-4 mr-1.5" /> Nouveau slide</Button>
      </div>

      {slides.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-8 text-center space-y-3">
          <p className="text-[#1B3A5C]/60 dark:text-white/50 text-sm">Aucun slide enregistré : le site affiche actuellement les 3 slides par défaut.</p>
          <Button onClick={loadDefaults} variant="outline"><Download className="h-4 w-4 mr-1.5" /> Charger les 3 slides par défaut pour les modifier</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((s, i) => (
            <div key={s.id} className={"bg-white dark:bg-[#132d4a] rounded-xl p-4 shadow-sm flex items-center gap-4 " + (s.active ? "" : "opacity-60")}>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-[#1B3A5C]/5 disabled:opacity-20" aria-label="Monter"><ArrowUp className="h-4 w-4 text-[#1B3A5C] dark:text-white/70" /></button>
                <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="p-1 rounded hover:bg-[#1B3A5C]/5 disabled:opacity-20" aria-label="Descendre"><ArrowDown className="h-4 w-4 text-[#1B3A5C] dark:text-white/70" /></button>
              </div>
              <div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0 bg-[#1B3A5C]/10">
                <Image src={s.image} alt="" fill unoptimized className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-[#1B3A5C]/40 dark:text-white/30">#{i + 1}</span>
                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + (s.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>{s.active ? "Visible" : "Masqué"}</span>
                </div>
                <p className="font-semibold text-sm text-[#1B3A5C] dark:text-white truncate">{s.title} {s.highlight && <span className="text-[#D4A843]">{s.highlight}</span>}</p>
                <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 truncate">{s.subtitle || "—"}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(s)} title={s.active ? "Masquer" : "Afficher"} className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70">{s.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={() => duplicate(s)} title="Dupliquer" className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><Copy className="h-4 w-4" /></button>
                <button onClick={() => openEdit(s)} title="Modifier" className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(s)} title="Supprimer" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-[#1B3A5C]/10 dark:border-white/10">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white">{editing ? "Modifier le slide" : "Nouveau slide"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#1B3A5C]/40 dark:text-white/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Aperçu */}
              <div className="relative h-40 rounded-xl overflow-hidden bg-[#1B3A5C]">
                {form.image && <Image src={form.image} alt="" fill unoptimized className="object-cover" />}
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(27,58,92,${0.95 * form.overlay / 100}), rgba(27,58,92,${0.75 * form.overlay / 100}), rgba(27,58,92,${0.4 * form.overlay / 100}))` }} />
                <div className="absolute inset-0 p-5 flex flex-col justify-center">
                  <p className="text-white font-extrabold text-xl leading-tight">{form.title || "Titre"}</p>
                  <p className="text-[#D4A843] font-extrabold text-xl leading-tight">{form.highlight}</p>
                  <p className="text-white/70 text-xs mt-1 line-clamp-2 max-w-sm">{form.subtitle}</p>
                </div>
                <span className="absolute top-2 right-3 text-[10px] text-white/60">Aperçu</span>
              </div>

              <ImagePicker label="Image de fond" value={form.image} onChange={(v) => set("image", v)} />
              <div>
                <Label className={labelCls}>Assombrissement de l&apos;image : {form.overlay}%</Label>
                <input type="range" min={0} max={100} value={form.overlay} onChange={(e) => set("overlay", Number(e.target.value))} className="w-full accent-[#D4A843]" />
                <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40">Plus l&apos;image est claire, plus il faut assombrir pour que le texte reste lisible.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className={labelCls}>Titre</Label><Input required maxLength={120} value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
                <div><Label className={labelCls}>Suite du titre (en doré)</Label><Input maxLength={120} value={form.highlight} onChange={(e) => set("highlight", e.target.value)} /></div>
              </div>
              <div><Label className={labelCls}>Texte sous le titre</Label><Textarea rows={2} maxLength={400} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></div>
              <div><Label className={labelCls}>Badge de ce slide (vide = badge global)</Label><Input maxLength={80} value={form.badge ?? ""} onChange={(e) => set("badge", orNull(e.target.value))} /></div>

              <div className="rounded-xl border border-[#1B3A5C]/10 dark:border-white/10 p-4 space-y-4">
                <p className="text-sm font-semibold text-[#1B3A5C] dark:text-white">Pastilles et listes (optionnel)</p>
                <TagInput label="Pastilles blanches (ex. En présentiel, En ligne)" values={form.pills} onChange={(v) => set("pills", v)} max={8} />
                <div><Label className={labelCls}>Phrase avant la liste dorée</Label><Input maxLength={120} placeholder="Nos centres sont présents au :" value={form.tagsTitle ?? ""} onChange={(e) => set("tagsTitle", orNull(e.target.value))} /></div>
                <TagInput label="Liste dorée (ex. pays, villes, métiers)" values={form.tags} onChange={(v) => set("tags", v)} />
              </div>

              <div className="rounded-xl border border-[#1B3A5C]/10 dark:border-white/10 p-4 space-y-4">
                <p className="text-sm font-semibold text-[#1B3A5C] dark:text-white">Bloc partenaire (optionnel)</p>
                <ImagePicker label="Logo du partenaire" logo optional value={form.partnerLogo ?? ""} onChange={(v) => set("partnerLogo", orNull(v))} />
                <div><Label className={labelCls}>Nom du partenaire</Label><Input maxLength={120} value={form.partnerName ?? ""} onChange={(e) => set("partnerName", orNull(e.target.value))} /></div>
                <div><Label className={labelCls}>Texte de présentation</Label><Textarea rows={3} maxLength={600} value={form.partnerText ?? ""} onChange={(e) => set("partnerText", orNull(e.target.value))} /></div>
              </div>

              <div className="rounded-xl border border-[#1B3A5C]/10 dark:border-white/10 p-4 space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#1B3A5C] dark:text-white"><input type="checkbox" checked={form.showButtons} onChange={(e) => set("showButtons", e.target.checked)} />Afficher les deux boutons</label>
                {form.showButtons && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label className={labelCls}>Bouton principal : texte</Label><Input maxLength={40} placeholder={DEFAULT_BUTTONS.primaryLabel} value={form.primaryLabel ?? ""} onChange={(e) => set("primaryLabel", orNull(e.target.value))} /></div>
                    <div><Label className={labelCls}>Bouton principal : lien</Label><Input placeholder={DEFAULT_BUTTONS.primaryHref} value={form.primaryHref ?? ""} onChange={(e) => set("primaryHref", orNull(e.target.value))} /></div>
                    <div><Label className={labelCls}>Bouton secondaire : texte</Label><Input maxLength={40} placeholder={DEFAULT_BUTTONS.secondaryLabel} value={form.secondaryLabel ?? ""} onChange={(e) => set("secondaryLabel", orNull(e.target.value))} /></div>
                    <div><Label className={labelCls}>Bouton secondaire : lien</Label><Input placeholder={DEFAULT_BUTTONS.secondaryHref} value={form.secondaryHref ?? ""} onChange={(e) => set("secondaryHref", orNull(e.target.value))} /></div>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-[#1B3A5C] dark:text-white/80"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />Slide visible sur le site</label>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Enregistrer" : "Créer le slide"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
