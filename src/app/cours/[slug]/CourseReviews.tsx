"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: { name: string }
}

function Stars({ value, onChange, size = 20 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? "fill-[#D4A843] text-[#D4A843]" : "text-[#1B3A5C]/20 dark:text-white/20"}
          />
        </button>
      ))}
    </div>
  )
}

export default function CourseReviews({ slug, courseId }: { slug: string; courseId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${slug}/reviews`)
      const data = await res.json()
      if (res.ok) setReviews(data.data?.reviews || [])
    } catch { /* noop */ }
    finally { setLoading(false) }
  }, [slug])

  const checkEligibility = useCallback(async () => {
    try {
      const enrollRes = await fetch("/api/enrollments")
      if (enrollRes.ok) {
        const data = await enrollRes.json()
        setCanReview((data.data?.enrollments || []).some((e: { courseId: string }) => e.courseId === courseId))
      }
    } catch { /* noop */ }
  }, [courseId])

  useEffect(() => { fetchReviews(); checkEligibility() }, [fetchReviews, checkEligibility])

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Veuillez sélectionner une note"); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/courses/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.data?.message || "Avis publié")
        setRating(0)
        setComment("")
        fetchReviews()
      } else {
        toast.error(data.error || "Erreur lors de l'envoi de l'avis")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setSubmitting(false) }
  }

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 lg:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white">Avis des étudiants</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(avg)} size={18} />
            <span className="text-sm font-semibold text-[#1B3A5C] dark:text-white">{avg.toFixed(1)}/5</span>
            <span className="text-xs text-[#1B3A5C]/40 dark:text-white/30">({reviews.length})</span>
          </div>
        )}
      </div>

      {canReview && (
        <div className="mb-6 p-4 rounded-xl bg-[#1B3A5C]/5 dark:bg-white/5">
          <p className="text-sm font-semibold text-[#1B3A5C] dark:text-white mb-2">Laisser un avis</p>
          <Stars value={rating} onChange={setRating} size={26} />
          <Textarea
            placeholder="Partagez votre expérience avec ce cours (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-3 bg-white dark:bg-[#0f2440]"
          />
          <Button onClick={handleSubmit} disabled={submitting} className="mt-3 bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier mon avis"}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-[#D4A843] animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[#1B3A5C]/40 dark:text-white/30">Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="pb-4 border-b border-[#1B3A5C]/5 dark:border-white/5 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-[#1B3A5C] dark:text-white">{r.user.name}</p>
                <Stars value={r.rating} size={14} />
              </div>
              {r.comment && <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50">{r.comment}</p>}
              <p className="text-[10px] text-[#1B3A5C]/30 dark:text-white/25 mt-1">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
