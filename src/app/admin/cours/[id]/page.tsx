"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, Plus, Trash2, FileText, Video, LinkIcon, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CourseModule {
  id: string
  title: string
  type: "pdf" | "video" | "text" | "link"
  content: string | null
  fileName: string | null
  order: number
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  order: number
}

const emptyModuleForm = { title: "", type: "text" as CourseModule["type"], content: "", fileName: "", fileData: "" }
const emptyQuestionForm = { question: "", options: ["", "", "", ""], correctIndex: 0 }

export default function AdminCourseContentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<"modules" | "quiz">("modules")
  const [loading, setLoading] = useState(true)

  const [modules, setModules] = useState<CourseModule[]>([])
  const [moduleForm, setModuleForm] = useState(emptyModuleForm)
  const [savingModule, setSavingModule] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm)
  const [savingQuestion, setSavingQuestion] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [mRes, qRes] = await Promise.all([
        fetch(`/api/admin/courses/${courseId}/modules`),
        fetch(`/api/admin/courses/${courseId}/quiz`),
      ])
      const mData = await mRes.json()
      const qData = await qRes.json()
      if (mRes.ok) setModules(mData.modules || [])
      if (qRes.ok) setQuestions(qData.questions || [])
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [courseId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés")
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Le fichier PDF ne doit pas dépasser 3 Mo (limite technique de l'hébergement)")
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setModuleForm((prev) => ({ ...prev, fileName: file.name, fileData: reader.result as string }))
      setUploading(false)
    }
    reader.onerror = () => { toast.error("Erreur de lecture du fichier"); setUploading(false) }
    reader.readAsDataURL(file)
  }

  const addModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!moduleForm.title.trim()) { toast.error("Le titre est requis"); return }
    if (moduleForm.type === "pdf" && !moduleForm.fileData) { toast.error("Merci d'importer un fichier PDF"); return }
    setSavingModule(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moduleForm),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Module ajouté")
        setModules((prev) => [...prev, data.module])
        setModuleForm(emptyModuleForm)
        if (fileInputRef.current) fileInputRef.current.value = ""
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setSavingModule(false) }
  }

  const deleteModule = async (m: CourseModule) => {
    if (!confirm(`Supprimer le module "${m.title}" ?`)) return
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules/${m.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("Module supprimé"); setModules((prev) => prev.filter((x) => x.id !== m.id)) }
      else toast.error("Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
  }

  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    const options = questionForm.options.map((o) => o.trim()).filter(Boolean)
    if (!questionForm.question.trim() || options.length < 2) {
      toast.error("Une question et au moins 2 réponses sont requises")
      return
    }
    setSavingQuestion(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...questionForm, options }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Question ajoutée")
        setQuestions((prev) => [...prev, data.question])
        setQuestionForm(emptyQuestionForm)
      } else {
        toast.error(data.error || "Erreur")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setSavingQuestion(false) }
  }

  const deleteQuestion = async (q: QuizQuestion) => {
    if (!confirm("Supprimer cette question ?")) return
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/quiz/${q.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("Question supprimée"); setQuestions((prev) => prev.filter((x) => x.id !== q.id)) }
      else toast.error("Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
  }

  const iconFor = (type: string) => {
    if (type === "pdf") return <FileText className="h-4 w-4" />
    if (type === "video") return <Video className="h-4 w-4" />
    if (type === "link") return <LinkIcon className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#0a1628] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.push("/admin")} className="inline-flex items-center gap-2 text-sm text-[#1B3A5C]/60 dark:text-white/50 hover:text-[#1B3A5C] dark:hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour à l&apos;admin
        </button>
        <h1 className="text-2xl font-bold text-[#1B3A5C] dark:text-white mb-6">Contenu du cours</h1>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("modules")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === "modules" ? "bg-[#1B3A5C] text-white" : "bg-white dark:bg-[#132d4a] text-[#1B3A5C] dark:text-white/70"}`}>Modules</button>
          <button onClick={() => setTab("quiz")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === "quiz" ? "bg-[#1B3A5C] text-white" : "bg-white dark:bg-[#132d4a] text-[#1B3A5C] dark:text-white/70"}`}>Quiz final</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
        ) : tab === "modules" ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm divide-y divide-[#1B3A5C]/5 dark:divide-white/5">
              {modules.length === 0 ? (
                <p className="p-6 text-sm text-[#1B3A5C]/40 dark:text-white/30">Aucun module pour le moment.</p>
              ) : (
                modules.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 p-4">
                    <span className="text-xs text-[#1B3A5C]/30 dark:text-white/20 w-5">{i + 1}</span>
                    {iconFor(m.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1B3A5C] dark:text-white truncate">{m.title}</p>
                      <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{m.type}{m.fileName ? ` · ${m.fileName}` : ""}</p>
                    </div>
                    <button onClick={() => deleteModule(m)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addModule} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-[#1B3A5C] dark:text-white">Ajouter un module</h3>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Titre</Label>
                <Input value={moduleForm.title} onChange={(e) => setModuleForm((p) => ({ ...p, title: e.target.value }))} placeholder="Ex : Leçon 1 — Se présenter" />
              </div>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Type de contenu</Label>
                <select
                  value={moduleForm.type}
                  onChange={(e) => setModuleForm((p) => ({ ...p, type: e.target.value as CourseModule["type"], content: "", fileData: "", fileName: "" }))}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
                >
                  <option value="text">Texte</option>
                  <option value="pdf">Document PDF</option>
                  <option value="video">Vidéo (lien intégrable, ex. YouTube embed)</option>
                  <option value="link">Lien externe</option>
                </select>
              </div>

              {moduleForm.type === "text" && (
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Contenu</Label>
                  <Textarea rows={6} value={moduleForm.content} onChange={(e) => setModuleForm((p) => ({ ...p, content: e.target.value }))} placeholder="Contenu de la leçon..." />
                </div>
              )}

              {(moduleForm.type === "video" || moduleForm.type === "link") && (
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">URL</Label>
                  <Input value={moduleForm.content} onChange={(e) => setModuleForm((p) => ({ ...p, content: e.target.value }))} placeholder="https://..." />
                  {moduleForm.type === "video" && (
                    <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 mt-1">Utilise une URL d&apos;intégration (ex : https://www.youtube.com/embed/XXXXX)</p>
                  )}
                </div>
              )}

              {moduleForm.type === "pdf" && (
                <div>
                  <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Fichier PDF (8 Mo max)</Label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4 mr-1.5" /> Importer un PDF</>}
                    </Button>
                    {moduleForm.fileName && (
                      <span className="text-sm text-[#1B3A5C]/70 dark:text-white/60 flex items-center gap-1.5">
                        {moduleForm.fileName}
                        <button type="button" onClick={() => setModuleForm((p) => ({ ...p, fileName: "", fileData: "" }))}><X className="h-3.5 w-3.5" /></button>
                      </span>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                </div>
              )}

              <Button type="submit" disabled={savingModule || uploading} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
                {savingModule ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1.5" /> Ajouter le module</>}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm divide-y divide-[#1B3A5C]/5 dark:divide-white/5">
              {questions.length === 0 ? (
                <p className="p-6 text-sm text-[#1B3A5C]/40 dark:text-white/30">Aucune question pour le moment. Le quiz sera indisponible tant qu&apos;aucune question n&apos;est ajoutée.</p>
              ) : (
                questions.map((q, i) => (
                  <div key={q.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-[#1B3A5C] dark:text-white">{i + 1}. {q.question}</p>
                      <button onClick={() => deleteQuestion(q)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {q.options.map((o, oi) => (
                        <li key={oi} className={`text-sm px-2.5 py-1 rounded ${oi === q.correctIndex ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-[#1B3A5C]/60 dark:text-white/50"}`}>
                          {oi === q.correctIndex ? "✓ " : "· "}{o}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addQuestion} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-[#1B3A5C] dark:text-white">Ajouter une question</h3>
              <div>
                <Label className="mb-1.5 block text-[#1B3A5C] dark:text-white/80">Question</Label>
                <Input value={questionForm.question} onChange={(e) => setQuestionForm((p) => ({ ...p, question: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="block text-[#1B3A5C] dark:text-white/80">Réponses (coche la bonne réponse)</Label>
                {questionForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={questionForm.correctIndex === i}
                      onChange={() => setQuestionForm((p) => ({ ...p, correctIndex: i }))}
                      className="accent-[#D4A843]"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => setQuestionForm((p) => { const options = [...p.options]; options[i] = e.target.value; return { ...p, options } })}
                      placeholder={`Réponse ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={savingQuestion} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
                {savingQuestion ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1.5" /> Ajouter la question</>}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
