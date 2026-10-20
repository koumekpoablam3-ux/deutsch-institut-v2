"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Loader2, Search, X, Check, XCircle, ExternalLink, FileText, Settings2, Plus, Trash2, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { formatBytes } from "@/lib/image-compress"
import {
  APPLICATION_STATUS_LABELS, DEFAULT_ADMISSION, EDUCATION_LABELS, GERMAN_LEVEL_LABELS, PATHWAY_LABELS,
  type AdmissionDocumentSpec, type AdmissionSettings, type ApplicationData, type ApplicationStatus,
} from "@/lib/admission"

interface ListItem {
  id: string; status: ApplicationStatus; currentStep: number; submittedAt: string | null; updatedAt: string
  user: { id: string; name: string; email: string; telephone: string | null }
  pathway: string | null; docCount: number; requiredTotal: number; requiredApproved: number
}
interface DocMeta { id: string; type: string; filename: string; mimeType: string; size: number; status: string; adminComment: string | null; uploadedAt: string }
interface Detail {
  application: { id: string; status: ApplicationStatus; data: ApplicationData; adminNote: string | null; submittedAt: string | null; user: { name: string; email: string; telephone: string | null; createdAt: string }; documents: DocMeta[] }
  documentSpecs: AdmissionDocumentSpec[]
  courseTitle: string | null
}

const statusCls: Record<ApplicationStatus, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  submitted: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  needs_changes: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}
const labelCls = "mb-1.5 block text-[#1B3A5C] dark:text-white/80"
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "document"

type Filter = "all" | ApplicationStatus

export default function ApplicationsTab() {
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("submitted")
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [rejectingDoc, setRejectingDoc] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AdmissionSettings>(DEFAULT_ADMISSION)
  const [savingSettings, setSavingSettings] = useState(false)

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/applications")
      const data = await res.json()
      if (res.ok) setItems(data.applications || [])
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (res.ok && data.admission) setSettings(data.admission)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchList(); fetchSettings() }, [fetchList, fetchSettings])

  const openDetail = async (id: string) => {
    setOpenId(id); setDetail(null); setDetailLoading(true); setMessage(""); setRejectingDoc(null)
    try {
      const res = await fetch(`/api/admin/applications/${id}`)
      const data = await res.json()
      if (res.ok) setDetail(data)
      else { toast.error(data.error || "Erreur lors du chargement"); setOpenId(null) }
    } catch { toast.error("Erreur de connexion"); setOpenId(null) }
    finally { setDetailLoading(false) }
  }

  const reloadDetail = async () => { if (openId) { const res = await fetch(`/api/admin/applications/${openId}`); if (res.ok) setDetail(await res.json()) } }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    items.forEach((i) => { c[i.status] = (c[i.status] || 0) + 1 })
    return c
  }, [items])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => (filter === "all" || i.status === filter) && (!q || i.user.name.toLowerCase().includes(q) || i.user.email.toLowerCase().includes(q)))
  }, [items, filter, query])

  const reviewDoc = async (doc: DocMeta, status: "approved" | "rejected" | "pending", comment?: string) => {
    if (!openId) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/applications/${openId}/documents/${doc.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, comment }) })
      const data = await res.json()
      if (res.ok) { setRejectingDoc(null); setRejectReason(""); await reloadDetail(); fetchList() }
      else toast.error(data.error || "Erreur")
    } catch { toast.error("Erreur de connexion") }
    finally { setBusy(false) }
  }

  const decide = async (action: "accept" | "request_changes" | "reject" | "reopen") => {
    if (!openId) return
    if (action === "reject" && !confirm("Refuser définitivement ce dossier ? L'étudiant sera notifié.")) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/applications/${openId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, message }) })
      const data = await res.json()
      if (res.ok) { toast.success(data.message || "Décision enregistrée"); setMessage(""); await reloadDetail(); fetchList() }
      else toast.error(data.error || "Erreur")
    } catch { toast.error("Erreur de connexion") }
    finally { setBusy(false) }
  }

  const deleteApplication = async () => {
    if (!openId || !confirm("Supprimer ce dossier et tous ses documents ? Cette action est définitive.")) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/applications/${openId}`, { method: "DELETE" })
      if (res.ok) { toast.success("Dossier supprimé"); setOpenId(null); setDetail(null); fetchList() } else toast.error("Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
    finally { setBusy(false) }
  }

  const saveSettings = async (value: AdmissionSettings) => {
    setSavingSettings(true)
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "admission", value }) })
      const data = await res.json()
      if (res.ok) { setSettings(data.value); toast.success("Réglages du dossier enregistrés") }
      else toast.error(data.error || "Erreur lors de l'enregistrement")
    } catch { toast.error("Erreur de connexion") }
    finally { setSavingSettings(false) }
  }

  const updateDocSpec = (i: number, patch: Partial<AdmissionDocumentSpec>) =>
    setSettings((s) => ({ ...s, documents: s.documents.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) }))

  const addDocSpec = () => setSettings((s) => {
    let key = "document", n = 1
    while (s.documents.some((d) => d.key === key)) key = `document-${++n}`
    return { ...s, documents: [...s.documents, { key, label: "", description: "", required: false }] }
  })

  // ───────── détail : calculs ─────────
  const requiredSpecs = detail?.documentSpecs.filter((s) => s.required) ?? []
  const notApproved = requiredSpecs.filter((s) => !detail?.application.documents.some((d) => d.type === s.key && d.status === "approved"))
  const canAccept = detail?.application.status === "submitted" && notApproved.length === 0
  const d = detail?.application.data

  const info: [string, string | undefined][] = detail && d ? [
    ["Date de naissance", d.birthDate ? new Date(d.birthDate + "T00:00:00").toLocaleDateString("fr-FR", { dateStyle: "long" }) : undefined],
    ["Lieu de naissance", d.birthPlace], ["Nationalité", d.nationality], ["Pays de résidence", d.country], ["Ville", d.city], ["Adresse", d.address],
    ["Téléphone / WhatsApp", d.phone],
    ["Contact d'urgence", [d.emergencyName, d.emergencyPhone].filter(Boolean).join(" · ") || undefined],
    ["Projet", d.pathway ? PATHWAY_LABELS[d.pathway] : undefined],
    ["Cours souhaité", detail.courseTitle ?? undefined],
    ["Niveau d'allemand", d.germanLevel ? GERMAN_LEVEL_LABELS[d.germanLevel] : undefined],
    ["Niveau d'études", d.education ? EDUCATION_LABELS[d.education] : undefined],
    ["Profession", d.profession],
  ] : []

  return (
    <div>
      {/* Réglages */}
      <div className="bg-white dark:bg-[#132d4a] rounded-xl shadow-sm mb-5">
        <button onClick={() => setShowSettings((v) => !v)} className="w-full flex items-center justify-between p-4 text-left">
          <span className="flex items-center gap-2 font-semibold text-[#1B3A5C] dark:text-white text-sm"><Settings2 className="h-4 w-4" />Réglages du dossier d&apos;inscription</span>
          <span className="text-xs text-[#1B3A5C]/50 dark:text-white/40">{settings.required ? "Dossier obligatoire avant toute inscription à un cours" : "Dossier facultatif"}</span>
        </button>
        {showSettings && (
          <div className="p-5 pt-0 space-y-5 border-t border-[#1B3A5C]/10 dark:border-white/10">
            <label className="flex items-start gap-3 text-sm text-[#1B3A5C] dark:text-white/80 pt-4">
              <input type="checkbox" className="mt-1" checked={settings.required} onChange={(e) => setSettings({ ...settings, required: e.target.checked })} />
              <span><strong>Exiger un dossier accepté avant l&apos;inscription à un cours.</strong><br /><span className="text-xs text-[#1B3A5C]/50 dark:text-white/40">Les étudiants déjà inscrits à un cours ne sont pas concernés. Les administrateurs non plus.</span></span>
            </label>
            <div><Label className={labelCls}>Texte d&apos;introduction (en haut du dossier)</Label><Textarea rows={2} maxLength={500} value={settings.intro} onChange={(e) => setSettings({ ...settings, intro: e.target.value })} /></div>
            <div>
              <p className="text-sm font-semibold text-[#1B3A5C] dark:text-white mb-2">Documents demandés</p>
              <div className="space-y-3">
                {settings.documents.map((doc, i) => (
                  <div key={doc.key} className="rounded-lg border border-[#1B3A5C]/10 dark:border-white/10 p-3 grid sm:grid-cols-[1fr_1.5fr_auto_auto] gap-3 items-end">
                    <div><Label className={labelCls}>Nom du document</Label><Input maxLength={80} value={doc.label} onChange={(e) => updateDocSpec(i, { label: e.target.value })} /></div>
                    <div><Label className={labelCls}>Consigne pour l&apos;étudiant</Label><Input maxLength={200} value={doc.description} onChange={(e) => updateDocSpec(i, { description: e.target.value })} /></div>
                    <label className="flex items-center gap-2 text-sm text-[#1B3A5C] dark:text-white/80 h-10"><input type="checkbox" checked={doc.required} onChange={(e) => updateDocSpec(i, { required: e.target.checked })} />Obligatoire</label>
                    <button onClick={() => setSettings((s) => ({ ...s, documents: s.documents.filter((_, idx) => idx !== i) }))} className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-3" disabled={settings.documents.length >= 12} onClick={addDocSpec}><Plus className="h-4 w-4 mr-1.5" />Ajouter un document</Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => {
                // Les nouveaux documents reçoivent une clé tirée de leur nom (ex. « Acte de naissance » -> acte-de-naissance)
                const used = new Set<string>()
                const documents = settings.documents.map((d) => {
                  let key = d.label && /^document(-\d+)?$/.test(d.key) ? slug(d.label) : d.key
                  while (used.has(key)) key += "-2"
                  used.add(key)
                  return { ...d, key }
                })
                saveSettings({ ...settings, documents })
              }} disabled={savingSettings} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm">
                {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer les réglages"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {([["submitted", "À vérifier"], ["needs_changes", "Corrections"], ["draft", "Brouillons"], ["accepted", "Acceptés"], ["rejected", "Refusés"], ["all", "Tous"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={"px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors " + (filter === k ? "bg-[#1B3A5C] text-white dark:bg-[#D4A843]" : "bg-white dark:bg-[#132d4a] text-[#1B3A5C]/60 dark:text-white/50")}>
              {l} ({counts[k] || 0})
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B3A5C]/40" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un candidat" className="pl-9 h-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
      ) : visible.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun dossier dans cette catégorie.</div>
      ) : (
        <div className="space-y-3">
          {visible.map((it) => (
            <div key={it.id} className="bg-white dark:bg-[#132d4a] rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm text-[#1B3A5C] dark:text-white">{it.user.name}</p>
                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + statusCls[it.status]}>{APPLICATION_STATUS_LABELS[it.status]}</span>
                </div>
                <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40">{it.user.email}{it.pathway ? " · " + PATHWAY_LABELS[it.pathway as keyof typeof PATHWAY_LABELS] : ""}</p>
                <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 mt-1">
                  Documents obligatoires validés : <strong>{it.requiredApproved}/{it.requiredTotal}</strong> · {it.docCount} fichier(s)
                  {it.submittedAt && <> · envoyé le {new Date(it.submittedAt).toLocaleDateString("fr-FR")}</>}
                </p>
              </div>
              <Button size="sm" onClick={() => openDetail(it.id)} className="bg-[#1B3A5C] hover:bg-[#15304d] text-white dark:bg-[#D4A843]">{it.status === "submitted" ? "Examiner" : "Voir"}</Button>
            </div>
          ))}
        </div>
      )}

      {/* Détail d'un dossier */}
      {openId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-[#1B3A5C]/10 dark:border-white/10">
              <div>
                <h3 className="font-bold text-[#1B3A5C] dark:text-white">{detail?.application.user.name ?? "Dossier"}</h3>
                {detail && <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40">{detail.application.user.email}{detail.application.user.telephone ? " · " + detail.application.user.telephone : ""}</p>}
              </div>
              <div className="flex items-center gap-3">
                {detail && <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + statusCls[detail.application.status]}>{APPLICATION_STATUS_LABELS[detail.application.status]}</span>}
                <button onClick={() => { setOpenId(null); setDetail(null) }} className="text-[#1B3A5C]/40 dark:text-white/40"><X className="h-5 w-5" /></button>
              </div>
            </div>

            {detailLoading || !detail ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
            ) : (
              <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
                <section>
                  <h4 className="text-sm font-semibold text-[#1B3A5C] dark:text-white mb-3">Informations du candidat</h4>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    {info.map(([l, v]) => <div key={l}><dt className="text-xs text-[#1B3A5C]/50 dark:text-white/40">{l}</dt><dd className="text-[#1B3A5C] dark:text-white">{v || "—"}</dd></div>)}
                  </dl>
                  {d?.motivation && <div className="mt-3"><p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 mb-1">Motivation</p><p className="text-sm text-[#1B3A5C] dark:text-white whitespace-pre-line bg-[#1B3A5C]/5 dark:bg-white/5 rounded-lg p-3">{d.motivation}</p></div>}
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-[#1B3A5C] dark:text-white mb-3">Documents à vérifier</h4>
                  <div className="space-y-3">
                    {detail.documentSpecs.map((spec) => {
                      const doc = detail.application.documents.find((x) => x.type === spec.key)
                      const canReview = !!doc && detail.application.status !== "draft"
                      return (
                        <div key={spec.key} className="rounded-xl border border-[#1B3A5C]/10 dark:border-white/10 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-[#1B3A5C] dark:text-white">{spec.label} {spec.required && <span className="text-red-500">*</span>}</p>
                            {!doc ? <span className="text-xs text-gray-500">Non fourni</span>
                              : doc.status === "approved" ? <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="h-3.5 w-3.5" />Validé</span>
                              : doc.status === "rejected" ? <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><XCircle className="h-3.5 w-3.5" />Refusé</span>
                              : <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock className="h-3.5 w-3.5" />À vérifier</span>}
                          </div>
                          {doc && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <a href={`/api/application/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A5C] dark:text-white/80 hover:underline"><FileText className="h-3.5 w-3.5" />{doc.filename} · {formatBytes(doc.size)} <ExternalLink className="h-3 w-3" /></a>
                              {canReview && (
                                <div className="ml-auto flex gap-1.5">
                                  <Button size="sm" variant="outline" disabled={busy || doc.status === "approved"} onClick={() => reviewDoc(doc, "approved")} className="text-green-700 border-green-300"><Check className="h-3.5 w-3.5 mr-1" />Valider</Button>
                                  <Button size="sm" variant="outline" disabled={busy || doc.status === "rejected"} onClick={() => { setRejectingDoc(doc.id); setRejectReason("") }} className="text-red-600 border-red-300"><XCircle className="h-3.5 w-3.5 mr-1" />Refuser</Button>
                                </div>
                              )}
                            </div>
                          )}
                          {doc?.adminComment && <p className="mt-2 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2">Motif : {doc.adminComment}</p>}
                          {doc && rejectingDoc === doc.id && (
                            <div className="mt-2 flex gap-2">
                              <Input autoFocus placeholder="Pourquoi ce document est refusé (ex. photo floue)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="h-9 text-sm" />
                              <Button size="sm" disabled={busy || !rejectReason.trim()} onClick={() => reviewDoc(doc, "rejected", rejectReason)} className="bg-red-600 hover:bg-red-700 text-white">Confirmer</Button>
                              <Button size="sm" variant="ghost" onClick={() => setRejectingDoc(null)}>Annuler</Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>

                <section className="rounded-xl bg-[#1B3A5C]/5 dark:bg-white/5 p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-[#1B3A5C] dark:text-white">Décision</h4>
                  {detail.application.adminNote && <p className="text-xs text-[#1B3A5C]/60 dark:text-white/50">Dernier message envoyé : « {detail.application.adminNote} »</p>}
                  {detail.application.status === "draft" && <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50">Le candidat n&apos;a pas encore envoyé son dossier.</p>}
                  {detail.application.status === "submitted" && (
                    <>
                      {notApproved.length > 0 && <p className="text-xs text-amber-700 dark:text-amber-400">Pour accepter, validez d&apos;abord : {notApproved.map((s) => s.label).join(", ")}.</p>}
                      <div><Label className={labelCls}>Message pour le candidat (obligatoire pour demander des corrections ou refuser)</Label><Textarea rows={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ex. Merci d'envoyer une photo d'identité plus récente." /></div>
                      <div className="flex flex-wrap gap-2">
                        <Button disabled={busy || !canAccept} onClick={() => decide("accept")} className="bg-green-600 hover:bg-green-700 text-white">Accepter le dossier</Button>
                        <Button disabled={busy || !message.trim()} variant="outline" onClick={() => decide("request_changes")} className="text-orange-700 border-orange-300">Demander des corrections</Button>
                        <Button disabled={busy || !message.trim()} variant="outline" onClick={() => decide("reject")} className="text-red-600 border-red-300">Refuser</Button>
                      </div>
                    </>
                  )}
                  {(detail.application.status === "accepted" || detail.application.status === "rejected") && (
                    <Button disabled={busy} variant="outline" onClick={() => decide("reopen")}>Rouvrir le dossier pour le revérifier</Button>
                  )}
                  {detail.application.status === "needs_changes" && <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50">En attente des corrections du candidat.</p>}
                  <div className="pt-2 border-t border-[#1B3A5C]/10 dark:border-white/10">
                    <button onClick={deleteApplication} disabled={busy} className="text-xs text-red-500 hover:underline">Supprimer ce dossier</button>
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
