"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Loader2, Plus, Trash2, X, Calendar, Pencil, Radio, CheckCircle2, Ban, Link2, ExternalLink, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { LIVE_PLATFORMS, LIVE_STATUSES, platformInfo, validateMeetingUrl } from "@/lib/live-platforms"

interface CourseOption { id: string; title: string }

interface LiveSessionAdmin {
  id: string
  courseId: string
  title: string
  summary: string | null
  description: string | null
  startAt: string
  durationMinutes: number
  platform: string
  meetingUrl: string | null
  status: string
  course: { title: string; slug: string }
}

// L'admin saisit l'heure dans le fuseau de son appareil ; on envoie toujours une date UTC (ISO) au serveur
const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const emptyForm = { courseId: "", title: "", summary: "", description: "", platform: "jitsi", meetingUrl: "", startAt: "", durationMinutes: "60", status: "scheduled" }

const platformColors: Record<string, string> = {
  jitsi: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  zoom: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  meet: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  youtube: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  streamyard: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
}
const selectCls = "w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm text-[#1B3A5C] dark:text-white"
const labelCls = "mb-1.5 block text-[#1B3A5C] dark:text-white/80"

type Filter = "all" | "upcoming" | "live" | "ended"

export default function SessionsTab() {
  const [sessions, setSessions] = useState<LiveSessionAdmin[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<LiveSessionAdmin | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState<Filter>("all")

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, cRes] = await Promise.all([fetch("/api/admin/live-sessions"), fetch("/api/admin/courses")])
      const sData = await sRes.json()
      const cData = await cRes.json()
      if (sRes.ok) setSessions(sData.sessions || [])
      else toast.error(sData.error || "Erreur lors du chargement des sessions")
      if (cRes.ok) setCourses(cData.courses || [])
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const isLiveNow = (s: LiveSessionAdmin) => {
    if (s.status === "live") return true
    if (s.status !== "scheduled") return false
    const start = new Date(s.startAt).getTime()
    const now = Date.now()
    return now >= start && now <= start + s.durationMinutes * 60000
  }

  const filtered = useMemo(() => {
    const now = Date.now()
    return sessions.filter((s) => {
      if (filter === "live") return isLiveNow(s)
      if (filter === "ended") return s.status === "ended" || s.status === "cancelled"
      if (filter === "upcoming") return s.status === "scheduled" && new Date(s.startAt).getTime() + s.durationMinutes * 60000 >= now
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, filter])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, courseId: courses[0]?.id || "" })
    setModalOpen(true)
  }

  const openEdit = (s: LiveSessionAdmin) => {
    setEditing(s)
    setForm({
      courseId: s.courseId, title: s.title, summary: s.summary || "", description: s.description || "",
      platform: s.platform, meetingUrl: s.meetingUrl || "", startAt: toLocalInput(s.startAt),
      durationMinutes: String(s.durationMinutes), status: s.status,
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const linkError = validateMeetingUrl(form.platform, form.meetingUrl)
    if (linkError) { toast.error(linkError); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        durationMinutes: Number(form.durationMinutes),
        meetingUrl: form.platform === "jitsi" ? "" : form.meetingUrl,
        ...(editing ? {} : { status: undefined }),
      }
      const res = await fetch(editing ? `/api/admin/live-sessions/${editing.id}` : "/api/admin/live-sessions", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) { toast.success(data.message || "Enregistré"); setModalOpen(false); fetchAll() }
      else toast.error(data.error || "Erreur lors de l'enregistrement")
    } catch { toast.error("Erreur de connexion") }
    finally { setSaving(false) }
  }

  const changeStatus = async (s: LiveSessionAdmin, status: string) => {
    try {
      const res = await fetch(`/api/admin/live-sessions/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
      const data = await res.json()
      if (res.ok) { setSessions((prev) => prev.map((x) => (x.id === s.id ? { ...x, status } : x))); toast.success(data.message || "Statut mis à jour") }
      else toast.error(data.error || "Erreur lors de la mise à jour")
    } catch { toast.error("Erreur de connexion") }
  }

  const handleDelete = async (s: LiveSessionAdmin) => {
    if (!confirm(`Supprimer la session « ${s.title} » ?`)) return
    try {
      const res = await fetch(`/api/admin/live-sessions/${s.id}`, { method: "DELETE" })
      if (res.ok) { setSessions((prev) => prev.filter((x) => x.id !== s.id)); toast.success("Session supprimée") }
      else toast.error("Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
  }

  const copyLink = async (s: LiveSessionAdmin) => {
    const url = s.platform === "jitsi" || !s.meetingUrl ? window.location.origin + "/direct/" + s.id : s.meetingUrl
    try { await navigator.clipboard.writeText(url); toast.success("Lien copié") } catch { toast.error("Impossible de copier le lien") }
  }

  const info = platformInfo(form.platform)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {([["all", "Toutes"], ["upcoming", "À venir"], ["live", "En direct"], ["ended", "Terminées / annulées"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={"px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors " + (filter === k ? "bg-[#1B3A5C] text-white dark:bg-[#D4A843]" : "bg-white dark:bg-[#132d4a] text-[#1B3A5C]/60 dark:text-white/50 hover:text-[#1B3A5C]")}>{l}</button>
          ))}
        </div>
        <Button onClick={openCreate} disabled={courses.length === 0} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">
          <Plus className="h-4 w-4 mr-1.5" /> Nouvelle session
        </Button>
      </div>
      <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 mb-4">{sessions.length} session(s) au total. Les étudiants inscrits au cours sont notifiés à la création, à la modification, au passage en direct et à l&apos;annulation.</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucune session dans cette catégorie.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const live = isLiveNow(s)
            const dim = s.status === "ended" || s.status === "cancelled"
            return (
              <div key={s.id} className={"bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm " + (dim ? "opacity-60" : "")}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + (platformColors[s.platform] || "")}>{platformInfo(s.platform).label.replace(" (intégré au site)", "")}</span>
                      {live ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500"><span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />EN DIRECT</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{LIVE_STATUSES.find((x) => x.value === s.status)?.label}</span>
                      )}
                    </div>
                    <p className="font-semibold text-[#1B3A5C] dark:text-white text-sm">{s.title}</p>
                    <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{s.course.title}</p>
                    {s.summary && <p className="text-xs text-[#1B3A5C]/60 dark:text-white/50 mt-1">{s.summary}</p>}
                    <p className="flex items-center gap-1.5 text-xs text-[#1B3A5C]/50 dark:text-white/40 mt-1.5">
                      <Calendar className="h-3.5 w-3.5" />{new Date(s.startAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} · {s.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 shrink-0">
                    {s.status === "scheduled" && <Button size="sm" variant="outline" onClick={() => changeStatus(s, "live")} className="text-xs"><Radio className="h-3.5 w-3.5 mr-1 text-red-500" />Passer en direct</Button>}
                    {s.status === "live" && <Button size="sm" variant="outline" onClick={() => changeStatus(s, "ended")} className="text-xs"><CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />Terminer</Button>}
                    {(s.status === "scheduled" || s.status === "live") && <button onClick={() => changeStatus(s, "cancelled")} title="Annuler la session" className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600"><Ban className="h-4 w-4" /></button>}
                    {(s.status === "ended" || s.status === "cancelled") && <button onClick={() => changeStatus(s, "scheduled")} title="Reprogrammer" className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><RotateCcw className="h-4 w-4" /></button>}
                    <button onClick={() => copyLink(s)} title="Copier le lien" className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><Link2 className="h-4 w-4" /></button>
                    <a href={s.platform !== "jitsi" && s.meetingUrl ? s.meetingUrl : `/direct/${s.id}`} target="_blank" rel="noopener noreferrer" title="Ouvrir la salle" className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><ExternalLink className="h-4 w-4" /></a>
                    <button onClick={() => openEdit(s)} title="Modifier" className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(s)} title="Supprimer" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-[#1B3A5C]/10 dark:border-white/10">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white">{editing ? "Modifier la session live" : "Créer une session live"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#1B3A5C]/40 dark:text-white/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <Label className={labelCls}>Cours concerné *</Label>
                <select required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={selectCls}>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div><Label className={labelCls}>Titre de la session *</Label><Input required maxLength={150} placeholder="Atelier de conversation : se présenter" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label className={labelCls}>Résumé (affiché sur la carte)</Label><Input maxLength={200} placeholder="En 90 minutes, pratiquez…" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
              <div><Label className={labelCls}>Description complète</Label><Textarea rows={4} maxLength={4000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className={labelCls}>Plateforme de visioconférence *</Label>
                  <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={selectCls}>
                    {LIVE_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className={labelCls}>Lien de la salle {info.needsLink ? "*" : ""}</Label>
                  {info.needsLink ? (
                    <Input type="url" required placeholder={info.placeholder} value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} />
                  ) : (
                    <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 h-10 flex items-center">Salle créée automatiquement, intégrée au site.</p>
                  )}
                </div>
              </div>
              {info.needsLink && <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 -mt-2">Créez la réunion sur {info.label}, puis collez ici son lien. Seuls les étudiants inscrits au cours le verront.</p>}

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2"><Label className={labelCls}>Date et heure de début * <span className="text-xs font-normal text-[#1B3A5C]/40">(heure de votre appareil)</span></Label><Input required type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} /></div>
                <div><Label className={labelCls}>Durée (min)</Label><Input required type="number" min={15} max={480} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} /></div>
              </div>
              {editing && (
                <div>
                  <Label className={labelCls}>Statut</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={selectCls}>
                    {LIVE_STATUSES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Enregistrer" : "Créer la session"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
