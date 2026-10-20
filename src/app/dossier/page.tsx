"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, ExternalLink, FileText, Loader2, Trash2, Upload, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/I18nProvider"
import { prepareImage, formatBytes } from "@/lib/image-compress"
import {
  APPLICATION_STEPS, EDUCATION_LABELS, EDUCATION_LEVELS, FIRST_FORM_STEP, GERMAN_LEVEL_LABELS, GERMAN_LEVELS, LAST_STEP,
  PATHWAYS, PATHWAY_LABELS, REQUIRED_FIELDS, isValidBirthDate, type AdmissionSettings, type ApplicationData,
} from "@/lib/admission"

interface DocMeta { id: string; type: string; filename: string; mimeType: string; size: number; status: string; adminComment: string | null; uploadedAt: string }
interface ApplicationDto { id: string; status: string; currentStep: number; data: ApplicationData; adminNote: string | null; submittedAt: string | null; documents: DocMeta[] }
interface CourseOption { id: string; title: string; level: string }

const selectCls = "w-full h-11 rounded-lg border border-[#1B3A5C]/20 bg-transparent px-3 text-sm text-[#1B3A5C] dark:text-white focus:border-[#D4A843] outline-none"
const labelCls = "mb-1.5 block text-[#1B3A5C] dark:text-white/80"

export default function DossierPage() {
  const { t, intlLocale } = useI18n()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [app, setApp] = useState<ApplicationDto | null>(null)
  const [config, setConfig] = useState<AdmissionSettings | null>(null)
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [data, setData] = useState<ApplicationData>({})
  const [step, setStep] = useState(FIRST_FORM_STEP)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/application")
      if (res.status === 401) { router.push("/login"); return }
      const json = await res.json()
      if (!res.ok) { toast.error(t(json.error || "Une erreur est survenue")); return }
      const a: ApplicationDto | null = json.application
      setApp(a)
      setConfig(json.config)
      setCourses(json.courses || [])
      setData({ phone: json.user?.telephone || "", ...(a?.data || {}) })
      setStep(Math.min(LAST_STEP, Math.max(FIRST_FORM_STEP, a?.currentStep ?? FIRST_FORM_STEP)))
    } catch { toast.error(t("Erreur de connexion")) }
    finally { setLoading(false) }
  }, [router, t])

  useEffect(() => { load() }, [load])

  const status = app?.status ?? "draft"
  const editable = status === "draft" || status === "needs_changes"
  const docs = app?.documents ?? []
  const docOf = (key: string) => docs.find((d) => d.type === key)
  const set = <K extends keyof ApplicationData>(key: K, value: ApplicationData[K]) => {
    setData((d) => ({ ...d, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n })
  }

  // ───────── validation d'une étape ─────────
  const validateStep = (s: number): boolean => {
    const next: Record<string, string> = {}
    for (const f of REQUIRED_FIELDS.filter((x) => x.step === s)) {
      const v = data[f.key]
      if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) next[f.key] = t(f.message)
    }
    if (s === 2 && data.birthDate && !isValidBirthDate(data.birthDate)) next.birthDate = t("La date de naissance est invalide")
    if (s === 3 && data.motivation && data.motivation.trim().length < 30) next.motivation = t("Votre motivation doit contenir au moins 30 caractères")
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const saveDraft = async (nextStep: number): Promise<boolean> => {
    setSaving(true)
    try {
      const res = await fetch("/api/application", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data, currentStep: nextStep }) })
      const json = await res.json()
      if (!res.ok) { toast.error(t(json.error || "Erreur lors de l'enregistrement")); return false }
      setApp((prev) => ({ ...(prev ?? { id: json.application.id, status: "draft", adminNote: null, submittedAt: null, documents: [] }), currentStep: json.application.currentStep, data: json.application.data } as ApplicationDto))
      return true
    } catch { toast.error(t("Erreur de connexion")); return false }
    finally { setSaving(false) }
  }

  const goNext = async () => {
    if (step <= 3 && !validateStep(step)) return
    if (await saveDraft(Math.min(LAST_STEP, step + 1))) { setStep((s) => Math.min(LAST_STEP, s + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }
  }
  const goBack = async () => {
    await saveDraft(step)
    setStep((s) => Math.max(FIRST_FORM_STEP, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ───────── documents ─────────
  const uploadDoc = async (key: string, file: File | undefined) => {
    if (!file) return
    setUploadingKey(key)
    try {
      const prepared = file.type.startsWith("image/") ? await prepareImage(file, { maxSize: 2200, quality: 0.85 }) : file
      if (prepared.size > 4 * 1024 * 1024) { toast.error(t("Fichier trop lourd (maximum 4 Mo)")); return }
      const form = new FormData()
      form.append("type", key)
      form.append("file", prepared)
      const res = await fetch("/api/application/documents", { method: "POST", body: form })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(t(json.error || "Erreur lors de l'envoi")); return }
      const doc: DocMeta = json.document
      setApp((prev) => {
        const base = prev ?? { id: "", status: "draft", currentStep: step, data, adminNote: null, submittedAt: null, documents: [] }
        return { ...base, documents: [...base.documents.filter((d) => d.type !== key), doc] }
      })
      toast.success(t("Document enregistré"))
    } catch (err) {
      toast.error(err instanceof Error ? t(err.message) : t("Erreur lors de l'envoi"))
    } finally {
      setUploadingKey(null)
      const input = fileRefs.current[key]
      if (input) input.value = ""
    }
  }

  const deleteDoc = async (doc: DocMeta) => {
    if (!confirm(t("Supprimer ce document ?"))) return
    try {
      const res = await fetch(`/api/application/documents/${doc.id}`, { method: "DELETE" })
      const json = await res.json().catch(() => ({}))
      if (res.ok) setApp((prev) => (prev ? { ...prev, documents: prev.documents.filter((d) => d.id !== doc.id) } : prev))
      else toast.error(t(json.error || "Une erreur est survenue"))
    } catch { toast.error(t("Erreur de connexion")) }
  }

  // ───────── envoi final ─────────
  const submit = async () => {
    if (!(await saveDraft(LAST_STEP))) return
    setSaving(true)
    try {
      const res = await fetch("/api/application/submit", { method: "POST" })
      const json = await res.json()
      if (res.ok) { toast.success(t("Dossier envoyé")); await load(); window.scrollTo({ top: 0, behavior: "smooth" }) }
      else toast.error(t(json.error || "Une erreur est survenue"))
    } catch { toast.error(t("Erreur de connexion")) }
    finally { setSaving(false) }
  }

  const specs = config?.documents ?? []
  const missingRequired = specs.filter((d) => d.required && !docOf(d.key))
  const rejectedDocs = docs.filter((d) => d.status === "rejected")
  const motivationLen = (data.motivation || "").trim().length

  const docStatusChip = (doc?: DocMeta) => {
    if (!doc) return <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t("Manquant")}</span>
    if (doc.status === "approved") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="h-3.5 w-3.5" />{t("Validé")}</span>
    if (doc.status === "rejected") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"><XCircle className="h-3.5 w-3.5" />{t("Refusé")}</span>
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock className="h-3.5 w-3.5" />{t("En attente de vérification")}</span>
  }

  const fieldError = (key: string) => errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-[#1B3A5C] dark:text-white mb-2">{t("Mon dossier d'inscription")}</h1>
          {config?.intro && <p className="text-[#1B3A5C]/60 dark:text-white/50 mb-6">{t(config.intro)}</p>}

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
          ) : status === "accepted" ? (
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 text-center shadow-sm">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-2">{t("Dossier accepté")}</h2>
              <p className="text-[#1B3A5C]/60 dark:text-white/50 mb-6">{t("Votre dossier est validé. Vous pouvez maintenant vous inscrire à un cours.")}</p>
              {app?.adminNote && <p className="text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg p-3 mb-6">{app.adminNote}</p>}
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/cours"><Button className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">{t("Voir les cours")}</Button></Link>
                <Link href="/dashboard"><Button variant="outline">{t("Tableau de bord")}</Button></Link>
              </div>
            </div>
          ) : status === "submitted" ? (
            <div className="space-y-5">
              <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 text-center shadow-sm">
                <Clock className="h-12 w-12 text-[#D4A843] mx-auto mb-3" />
                <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-2">{t("Dossier en cours de vérification")}</h2>
                <p className="text-[#1B3A5C]/60 dark:text-white/50">{t("Notre équipe vérifie vos informations et vos documents. Vous serez notifié dès qu'une décision sera prise.")}</p>
                {app?.submittedAt && <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 mt-3">{t("Envoyé le")} {new Date(app.submittedAt).toLocaleDateString(intlLocale, { dateStyle: "long" })}</p>}
              </div>
              <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-[#1B3A5C] dark:text-white mb-3">{t("Documents")}</h3>
                <ul className="divide-y divide-[#1B3A5C]/10 dark:divide-white/10">
                  {docs.map((d) => (
                    <li key={d.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                      <span className="text-[#1B3A5C] dark:text-white">{t(specs.find((s) => s.key === d.type)?.label ?? d.type)}</span>
                      {docStatusChip(d)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : status === "rejected" ? (
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 text-center shadow-sm">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-2">{t("Dossier refusé")}</h2>
              {app?.adminNote && <p className="text-sm bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg p-3 mb-4">{app.adminNote}</p>}
              <p className="text-[#1B3A5C]/60 dark:text-white/50 mb-6">{t("Pour toute question, contactez notre équipe.")}</p>
              <Link href="/contact"><Button className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">{t("Nous contacter")}</Button></Link>
            </div>
          ) : (
            <>
              {status === "needs_changes" && (
                <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-5">
                  <p className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300 mb-1"><AlertTriangle className="h-4 w-4" />{t("Corrections demandées sur votre dossier")}</p>
                  {app?.adminNote && <p className="text-sm text-amber-900 dark:text-amber-200 whitespace-pre-line">{app.adminNote}</p>}
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">{t("Corrigez les éléments indiqués puis renvoyez votre dossier à la dernière étape.")}</p>
                </div>
              )}

              {/* Étapes */}
              <ol className="flex items-center justify-between mb-8 gap-1">
                {APPLICATION_STEPS.map((s) => {
                  const done = s.step === 1 || s.step < step
                  const current = s.step === step
                  const reachable = s.step >= FIRST_FORM_STEP
                  return (
                    <li key={s.step} className="flex-1 flex flex-col items-center text-center">
                      <button
                        type="button"
                        disabled={!reachable || s.step === step}
                        onClick={() => { saveDraft(step); setStep(s.step) }}
                        className={"h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors " + (current ? "bg-[#D4A843] text-white" : done ? "bg-green-600 text-white" : "bg-[#1B3A5C]/10 text-[#1B3A5C]/50 dark:bg-white/10 dark:text-white/50")}
                        aria-label={t(s.title)}
                      >
                        {done && !current ? <Check className="h-4 w-4" /> : s.step}
                      </button>
                      <span className={"mt-1.5 text-[11px] leading-tight hidden sm:block " + (current ? "font-semibold text-[#1B3A5C] dark:text-white" : "text-[#1B3A5C]/50 dark:text-white/40")}>{t(s.title)}</span>
                    </li>
                  )
                })}
              </ol>

              <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 sm:p-8 shadow-sm">
                {/* ÉTAPE 2 : informations personnelles */}
                {step === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-bold text-[#1B3A5C] dark:text-white">{t("Informations personnelles")}</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className={labelCls}>{t("Date de naissance")} *</Label>
                        <Input type="date" max={new Date().toISOString().slice(0, 10)} value={data.birthDate || ""} onChange={(e) => set("birthDate", e.target.value)} />
                        {fieldError("birthDate")}
                      </div>
                      <div>
                        <Label className={labelCls}>{t("Lieu de naissance")}</Label>
                        <Input maxLength={100} value={data.birthPlace || ""} onChange={(e) => set("birthPlace", e.target.value)} />
                      </div>
                      <div>
                        <Label className={labelCls}>{t("Nationalité")} *</Label>
                        <Input maxLength={60} value={data.nationality || ""} onChange={(e) => set("nationality", e.target.value)} />
                        {fieldError("nationality")}
                      </div>
                      <div>
                        <Label className={labelCls}>{t("Pays de résidence")} *</Label>
                        <Input maxLength={60} value={data.country || ""} onChange={(e) => set("country", e.target.value)} />
                        {fieldError("country")}
                      </div>
                      <div>
                        <Label className={labelCls}>{t("Ville")} *</Label>
                        <Input maxLength={80} value={data.city || ""} onChange={(e) => set("city", e.target.value)} />
                        {fieldError("city")}
                      </div>
                      <div>
                        <Label className={labelCls}>{t("Téléphone / WhatsApp")} *</Label>
                        <Input maxLength={40} value={data.phone || ""} onChange={(e) => set("phone", e.target.value)} />
                        {fieldError("phone")}
                      </div>
                    </div>
                    <div>
                      <Label className={labelCls}>{t("Adresse")}</Label>
                      <Input maxLength={200} value={data.address || ""} onChange={(e) => set("address", e.target.value)} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className={labelCls}>{t("Personne à contacter en cas d'urgence")}</Label>
                        <Input maxLength={100} value={data.emergencyName || ""} onChange={(e) => set("emergencyName", e.target.value)} />
                      </div>
                      <div>
                        <Label className={labelCls}>{t("Téléphone de cette personne")}</Label>
                        <Input maxLength={40} value={data.emergencyPhone || ""} onChange={(e) => set("emergencyPhone", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3 : projet et niveau */}
                {step === 3 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-bold text-[#1B3A5C] dark:text-white">{t("Projet et niveau")}</h2>
                    <div>
                      <Label className={labelCls}>{t("Votre projet")} *</Label>
                      <select className={selectCls} value={data.pathway || ""} onChange={(e) => set("pathway", (e.target.value || undefined) as ApplicationData["pathway"])}>
                        <option value="">{t("Sélectionner")}</option>
                        {PATHWAYS.map((p) => <option key={p} value={p}>{t(PATHWAY_LABELS[p])}</option>)}
                      </select>
                      {fieldError("pathway")}
                    </div>
                    <div>
                      <Label className={labelCls}>{t("Cours souhaité")}</Label>
                      <select className={selectCls} value={data.courseId || ""} onChange={(e) => set("courseId", e.target.value)}>
                        <option value="">{t("Je ne sais pas encore")}</option>
                        {courses.map((c) => <option key={c.id} value={c.id}>{t(c.title)}</option>)}
                      </select>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className={labelCls}>{t("Niveau d'allemand actuel")} *</Label>
                        <select className={selectCls} value={data.germanLevel || ""} onChange={(e) => set("germanLevel", (e.target.value || undefined) as ApplicationData["germanLevel"])}>
                          <option value="">{t("Sélectionner")}</option>
                          {GERMAN_LEVELS.map((l) => <option key={l} value={l}>{t(GERMAN_LEVEL_LABELS[l])}</option>)}
                        </select>
                        {fieldError("germanLevel")}
                      </div>
                      <div>
                        <Label className={labelCls}>{t("Niveau d'études")} *</Label>
                        <select className={selectCls} value={data.education || ""} onChange={(e) => set("education", (e.target.value || undefined) as ApplicationData["education"])}>
                          <option value="">{t("Sélectionner")}</option>
                          {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{t(EDUCATION_LABELS[l])}</option>)}
                        </select>
                        {fieldError("education")}
                      </div>
                    </div>
                    <div>
                      <Label className={labelCls}>{t("Profession actuelle")}</Label>
                      <Input maxLength={100} value={data.profession || ""} onChange={(e) => set("profession", e.target.value)} />
                    </div>
                    <div>
                      <Label className={labelCls}>{t("Votre motivation")} *</Label>
                      <Textarea rows={5} maxLength={1500} value={data.motivation || ""} onChange={(e) => set("motivation", e.target.value)} placeholder={t("Expliquez votre projet et pourquoi vous souhaitez apprendre l'allemand...")} />
                      <div className="flex justify-between">
                        <span>{fieldError("motivation")}</span>
                        <span className="text-xs text-[#1B3A5C]/40 dark:text-white/30 mt-1">{motivationLen}/1500</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ÉTAPE 4 : documents */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-[#1B3A5C] dark:text-white">{t("Documents")}</h2>
                    <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50">{t("Formats acceptés : PDF, JPG, PNG ou WebP (4 Mo maximum par fichier). Les documents doivent être lisibles.")}</p>
                    {specs.map((spec) => {
                      const doc = docOf(spec.key)
                      const locked = doc?.status === "approved"
                      return (
                        <div key={spec.key} className={"rounded-xl border p-4 " + (doc?.status === "rejected" ? "border-red-300 dark:border-red-800" : "border-[#1B3A5C]/10 dark:border-white/10")}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#1B3A5C] dark:text-white">{t(spec.label)} {spec.required ? <span className="text-red-500">*</span> : <span className="text-xs font-normal text-[#1B3A5C]/40 dark:text-white/30">({t("optionnel")})</span>}</p>
                              {spec.description && <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 mt-0.5">{t(spec.description)}</p>}
                            </div>
                            {docStatusChip(doc)}
                          </div>
                          {doc?.status === "rejected" && doc.adminComment && <p className="mt-2 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2">{doc.adminComment}</p>}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {doc && (
                              <a href={`/api/application/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#1B3A5C] dark:text-white/80 hover:underline">
                                <FileText className="h-3.5 w-3.5" />{doc.filename} · {formatBytes(doc.size)} <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            <div className="ml-auto flex gap-2">
                              {!locked && (
                                <>
                                  <Button type="button" size="sm" variant="outline" disabled={uploadingKey === spec.key} onClick={() => fileRefs.current[spec.key]?.click()}>
                                    {uploadingKey === spec.key ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />}
                                    {doc ? t("Remplacer") : t("Téléverser")}
                                  </Button>
                                  {doc && <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => deleteDoc(doc)} aria-label={t("Supprimer")}><Trash2 className="h-4 w-4" /></Button>}
                                </>
                              )}
                            </div>
                            <input ref={(el) => { fileRefs.current[spec.key] = el }} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => uploadDoc(spec.key, e.target.files?.[0])} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ÉTAPE 5 : vérification et envoi */}
                {step === 5 && (
                  <div className="space-y-5">
                    <h2 className="text-lg font-bold text-[#1B3A5C] dark:text-white">{t("Vérification et envoi")}</h2>
                    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      {([
                        ["Date de naissance", data.birthDate ? new Date(data.birthDate + "T00:00:00").toLocaleDateString(intlLocale, { dateStyle: "long" }) : ""],
                        ["Nationalité", data.nationality], ["Pays de résidence", data.country], ["Ville", data.city], ["Téléphone / WhatsApp", data.phone],
                        ["Votre projet", data.pathway ? t(PATHWAY_LABELS[data.pathway]) : ""],
                        ["Niveau d'allemand actuel", data.germanLevel ? t(GERMAN_LEVEL_LABELS[data.germanLevel]) : ""],
                        ["Niveau d'études", data.education ? t(EDUCATION_LABELS[data.education]) : ""],
                      ] as [string, string | undefined][]).map(([label, value]) => (
                        <div key={label}><dt className="text-xs text-[#1B3A5C]/50 dark:text-white/40">{t(label)}</dt><dd className="font-medium text-[#1B3A5C] dark:text-white">{value || "—"}</dd></div>
                      ))}
                    </dl>
                    <div>
                      <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 mb-1">{t("Documents")}</p>
                      <ul className="space-y-1.5">
                        {specs.map((s) => {
                          const d = docOf(s.key)
                          return (
                            <li key={s.key} className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-[#1B3A5C] dark:text-white">{t(s.label)}</span>{docStatusChip(d)}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                    {(missingRequired.length > 0 || rejectedDocs.length > 0) && (
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm p-3">
                        {missingRequired.length > 0 && <p>{t("Documents obligatoires manquants :")} {missingRequired.map((m) => t(m.label)).join(", ")}</p>}
                        {rejectedDocs.length > 0 && <p>{t("Remplacez les documents refusés avant de renvoyer votre dossier")}</p>}
                      </div>
                    )}
                    <label className="flex items-start gap-3 text-sm text-[#1B3A5C] dark:text-white/80">
                      <input type="checkbox" className="mt-1" checked={data.consent === true} onChange={(e) => set("consent", e.target.checked)} />
                      <span>{t("Je certifie que les informations et documents fournis sont exacts et j'accepte que l'équipe les vérifie.")}</span>
                    </label>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#1B3A5C]/10 dark:border-white/10">
                  <Button type="button" variant="outline" onClick={goBack} disabled={step === FIRST_FORM_STEP || saving}>
                    <ChevronLeft className="h-4 w-4 mr-1" />{t("Précédent")}
                  </Button>
                  {step < LAST_STEP ? (
                    <Button type="button" onClick={goNext} disabled={saving} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("Enregistrer et continuer")}<ChevronRight className="h-4 w-4 ml-1" /></>}
                    </Button>
                  ) : (
                    <Button type="button" onClick={submit} disabled={saving || data.consent !== true || missingRequired.length > 0 || rejectedDocs.length > 0} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Envoyer mon dossier")}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
