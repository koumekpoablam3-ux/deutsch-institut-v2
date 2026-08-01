"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Loader2, Plus, Trash2, X, Calendar } from "lucide-react"
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

interface LiveSessionAdmin {
  id: string
  title: string
  description: string | null
  startAt: string
  durationMinutes: number
  course: { title: string; slug: string }
}

export default function SessionsTab() {
  const [sessions, setSessions] = useState<LiveSessionAdmin[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ courseId: "", title: "", description: "", startAt: "", durationMinutes: "60" })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("/api/admin/live-sessions"),
        fetch("/api/admin/courses"),
      ])
      const sData = await sRes.json()
      const cData = await cRes.json()
      if (sRes.ok) setSessions(sData.sessions || [])
      if (cRes.ok) setCourses(cData.courses || [])
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openCreate = () => {
    setForm({ courseId: courses[0]?.id || "", title: "", description: "", startAt: "", durationMinutes: "60" })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, durationMinutes: Number(form.durationMinutes) }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || "Session créée")
        setModalOpen(false)
        fetchAll()
      } else {
        toast.error(data.error || "Erreur lors de la création")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setSaving(false) }
  }

  const handleDelete = async (s: LiveSessionAdmin) => {
    if (!confirm(`Supprimer la session "${s.title}" ?`)) return
    try {
      const res = await fetch(`/api/admin/live-sessions/${s.id}`, { method: "DELETE" })
      if (res.ok) { setSessions(prev => prev.filter(x => x.id !== s.id)); toast.success("Session supprimée") }
    } catch { toast.error("Erreur de connexion") }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} disabled={courses.length === 0} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">
          <Plus className="h-4 w-4 mr-1.5" /> Nouvelle session
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
      ) : sessions.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucune session programmée.</div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-[#1B3A5C] dark:text-white text-sm truncate">{s.title}</p>
                <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{s.course.title}</p>
                <p className="flex items-center gap-1.5 text-xs text-[#1B3A5C]/50 dark:text-white/40 mt-1">
                  <Calendar className="h-3.5 w-3.5" />{new Date(s.startAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} · {s.durationMinutes} min
                </p>
              </div>
              <button onClick={() => handleDelete(s)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-[#1B3A5C]/10 dark:border-white/10">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white">Nouvelle session en direct</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#1B3A5C]/40 dark:text-white/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Cours concerné</Label>
                <select required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Titre de la session</Label>
                <Input required placeholder="Atelier conversation" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Description (optionnel)</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Date et heure</Label>
                  <Input required type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Durée (min)</Label>
                  <Input required type="number" min={15} max={480} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer la session"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}