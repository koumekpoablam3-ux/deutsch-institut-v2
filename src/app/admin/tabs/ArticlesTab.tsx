"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Loader2, Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  published: boolean
  createdAt: string
}

const emptyArticleForm = { title: "", slug: "", excerpt: "", content: "", coverImage: "", published: true }

export default function ArticlesTab() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState(emptyArticleForm)
  const [saving, setSaving] = useState(false)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/articles")
      const data = await res.json()
      if (res.ok) setArticles(data.articles || [])
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const openCreate = () => { setEditing(null); setForm(emptyArticleForm); setModalOpen(true) }
  const openEdit = (a: Article) => {
    setEditing(a)
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, coverImage: a.coverImage || "", published: a.published })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/admin/articles/${editing.id}` : "/api/admin/articles", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || "Article enregistré")
        setModalOpen(false)
        fetchArticles()
      } else {
        toast.error(data.error || "Erreur lors de l'enregistrement")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setSaving(false) }
  }

  const togglePublished = async (a: Article) => {
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !a.published }),
      })
      if (res.ok) setArticles(prev => prev.map(x => x.id === a.id ? { ...x, published: !x.published } : x))
    } catch { toast.error("Erreur de connexion") }
  }

  const handleDelete = async (a: Article) => {
    if (!confirm(`Supprimer l'article "${a.title}" ?`)) return
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`, { method: "DELETE" })
      if (res.ok) { setArticles(prev => prev.filter(x => x.id !== a.id)); toast.success("Article supprimé") }
    } catch { toast.error("Erreur de connexion") }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">
          <Plus className="h-4 w-4 mr-1.5" /> Nouvel article
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
      ) : articles.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun article pour le moment.</div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-[#1B3A5C] dark:text-white text-sm truncate">{a.title}</p>
                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 " + (a.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>
                    {a.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 truncate">{a.excerpt}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => togglePublished(a)} title={a.published ? "Dépublier" : "Publier"} className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70">
                  {a.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(a)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-[#1B3A5C]/10 dark:border-white/10">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white">{editing ? "Modifier l'article" : "Nouvel article"}</h3>
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
                  <Input required placeholder="astuces-apprendre-allemand" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Image de couverture (URL, optionnel)</Label>
                <Input placeholder="/images/cours/success.jpg" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Résumé</Label>
                <Textarea required value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Contenu (un paragraphe par ligne)</Label>
                <Textarea required rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#1B3A5C] dark:text-white/80">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                Publier immédiatement
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Enregistrer" : "Créer l'article"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
