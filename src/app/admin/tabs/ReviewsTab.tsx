"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Trash2, Star } from "lucide-react"
import { toast } from "sonner"

interface AdminReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { name: string; email: string }
  course: { title: string; slug: string }
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews")
      const data = await res.json()
      if (res.ok) setReviews(data.reviews || [])
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleDelete = async (r: AdminReview) => {
    if (!confirm("Supprimer cet avis ?")) return
    try {
      const res = await fetch(`/api/admin/reviews/${r.id}`, { method: "DELETE" })
      if (res.ok) { setReviews(prev => prev.filter(x => x.id !== r.id)); toast.success("Avis supprimé") }
    } catch { toast.error("Erreur de connexion") }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
  if (reviews.length === 0) return <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun avis pour le moment.</div>

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.id} className="bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={"h-3.5 w-3.5 " + (n <= r.rating ? "fill-[#D4A843] text-[#D4A843]" : "text-[#1B3A5C]/20 dark:text-white/20")} />
                ))}
              </div>
              <p className="font-semibold text-[#1B3A5C] dark:text-white text-sm">{r.user.name} <span className="font-normal text-[#1B3A5C]/40 dark:text-white/30">· {r.course.title}</span></p>
            </div>
            <button onClick={() => handleDelete(r)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
          </div>
          {r.comment && <p className="text-sm text-[#1B3A5C]/70 dark:text-white/60">{r.comment}</p>}
          <p className="text-[10px] text-[#1B3A5C]/30 dark:text-white/20 mt-2">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
        </div>
      ))}
    </div>
  )
}
