"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  slug: string
  level: string
  lessons: number
  duration: string
  price: string
  badge: string | null
  badgeColor: string | null
  image: string
  description: string
  objectives: string
  prerequisites: string | null
  _count?: { enrollments: number }
}

const emptyCourseForm = {
  title: "", slug: "", level: "A1", lessons: "10", duration: "", price: "",
  badge: "", badgeColor: "", image: "/images/cours/levels.jpg", description: "",
  objectives: "", prerequisites: "",
}

export default function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState(emptyCourseForm)
  const [saving, setSaving] = useState(false)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/courses")
      const data = await res.json()
      if (res.ok) setCourses(data.courses || [])
      else toast.error(data.error || "Erreur lors du chargement des cours")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  const openCreate = () => { setEditing(null); setForm(emptyCourseForm); setModalOpen(true) }
  const openEdit = (c: Course) => {
    setEditing(c)
    setForm({
      title: c.title, slug: c.slug, level: c.level, lessons: String(c.lessons),
      duration: c.duration, price: c.price, badge: c.badge || "", badgeColor: c.badgeColor || "",
      image: c.image, description: c.description, objectives: c.objectives, prerequisites: c.prerequisites || "",
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, lessons: Number(form.lessons) }
      const res = await fetch(editing ? `/api/admin/courses/${editing.id}` : "/api/admin/courses", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || "Cours enregistré")
        setModalOpen(false)
        fetchCourses()
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setSaving(false) }
  }

  const handleDelete = async (c: Course) => {
    if (!confirm(`Supprimer le cours "${c.title}" ? Cette action est irréversible.`)) return
    try {
      const res = await fetch(`/api/admin/courses/${c.id}`, { method: "DELETE" })
      const data = await res.json()
      if (res.ok) { toast.success("Cours supprimé"); setCourses(prev => prev.filter(x => x.id !== c.id)) }
      else toast.error(data.error || "Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">
          <Plus className="h-4 w-4 mr-1.5" /> Nouveau cours
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun cours pour le moment.</div>
      ) : (
        <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1B3A5C]/10 dark:border-white/10 text-left text-[#1B3A5C]/50 dark:text-white/40">
                  <th className="p-4 font-semibold">Titre</th>
                  <th className="p-4 font-semibold">Niveau</th>
                  <th className="p-4 font-semibold">Prix</th>
                  <th className="p-4 font-semibold">Inscrits</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-[#1B3A5C]/5 dark:border-white/5 last:border-0">
                    <td className="p-4">
                      <p className="font-semibold text-[#1B3A5C] dark:text-white">{c.title}</p>
                      <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{c.slug}</p>
                    </td>
                    <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{c.level}</td>
                    <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{c.price}</td>
                    <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{c._count?.enrollments ?? 0}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-[#1B3A5C]/10 dark:border-white/10">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white">{editing ? "Modifier le cours" : "Nouveau cours"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#1B3A5C]/40 dark:text-white/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Titre</Label>
                  <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Slug (URL)</Label>
                  <Input required placeholder="allemand-debutant-a1" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Niveau</Label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
                    {["A1", "A2", "B1", "B2", "C1"].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Nb. leçons</Label>
                  <Input required type="number" min={1} value={form.lessons} onChange={(e) => setForm({ ...form, lessons: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Durée</Label>
                  <Input required placeholder="3 mois" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Prix</Label>
                  <Input required placeholder="150 000 FCFA" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Image</Label>
                  <Input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Badge (optionnel)</Label>
                  <Input placeholder="Populaire" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Couleur badge (classe Tailwind)</Label>
                  <Input placeholder="bg-emerald-500" value={form.badgeColor} onChange={(e) => setForm({ ...form, badgeColor: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Description</Label>
                <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Objectifs</Label>
                <Textarea required value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Prérequis (optionnel)</Label>
                <Textarea value={form.prerequisites} onChange={(e) => setForm({ ...form, prerequisites: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Enregistrer" : "Créer le cours"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
