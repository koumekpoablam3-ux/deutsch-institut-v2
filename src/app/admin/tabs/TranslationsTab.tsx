"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Loader2, Check, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Item { source: string; group: string; value: string | null; builtin: string | null }
type Locale = "en" | "de"
type Filter = "all" | "todo" | "done"

const LOCALE_NAMES: Record<Locale, string> = { en: "English", de: "Deutsch" }

export default function TranslationsTab() {
  const [locale, setLocale] = useState<Locale>("en")
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("todo")
  const [group, setGroup] = useState("all")
  const [query, setQuery] = useState("")
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const fetchItems = useCallback(async (l: Locale) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/translations?locale=${l}`)
      const data = await res.json()
      if (res.ok) { setItems(data.items || []); setDrafts({}); setSaved({}) }
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchItems(locale) }, [locale, fetchItems])

  const current = (it: Item) => drafts[it.source] ?? it.value ?? it.builtin ?? ""
  const isDone = (it: Item) => (it.value ?? it.builtin ?? "").trim() !== ""

  const groups = useMemo(() => [...new Set(items.map((i) => i.group))], [items])
  const todoCount = items.filter((i) => !isDone(i)).length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) =>
      (filter === "all" || (filter === "todo" ? !isDone(i) : isDone(i))) &&
      (group === "all" || i.group === group) &&
      (!q || i.source.toLowerCase().includes(q) || (i.value ?? i.builtin ?? "").toLowerCase().includes(q))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filter, group, query])

  const save = async (it: Item) => {
    const draft = drafts[it.source]
    if (draft === undefined || draft === (it.value ?? it.builtin ?? "")) return
    try {
      const res = await fetch("/api/admin/translations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, source: it.source, value: draft }) })
      const data = await res.json()
      if (res.ok) {
        setItems((prev) => prev.map((x) => (x.source === it.source ? { ...x, value: draft.trim() || null } : x)))
        setDrafts((d) => { const n = { ...d }; delete n[it.source]; return n })
        setSaved((s) => ({ ...s, [it.source]: true }))
        setTimeout(() => setSaved((s) => ({ ...s, [it.source]: false })), 2000)
      } else toast.error(data.error || "Erreur lors de l'enregistrement")
    } catch { toast.error("Erreur de connexion") }
  }

  return (
    <div>
      <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50 mb-4">
        Le site est disponible en français, anglais et allemand. Les textes de l&apos;interface sont déjà traduits ; ici, traduisez les textes que vous saisissez vous-même (carrousel, cours, articles, coordonnées…).
        Un texte sans traduction s&apos;affiche en français. La traduction s&apos;enregistre automatiquement quand vous quittez le champ.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex rounded-lg border border-[#1B3A5C]/15 dark:border-white/15 overflow-hidden">
          {(Object.keys(LOCALE_NAMES) as Locale[]).map((l) => (
            <button key={l} onClick={() => setLocale(l)} className={"px-4 py-2 text-sm font-semibold " + (l === locale ? "bg-[#1B3A5C] text-white dark:bg-[#D4A843]" : "text-[#1B3A5C]/60 dark:text-white/60")}>{LOCALE_NAMES[l]}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {([["todo", `À traduire (${todoCount})`], ["done", "Traduits"], ["all", "Tous"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={"px-3.5 py-1.5 rounded-full text-xs font-semibold " + (filter === k ? "bg-[#D4A843] text-white" : "bg-white dark:bg-[#132d4a] text-[#1B3A5C]/60 dark:text-white/50")}>{l}</button>
          ))}
        </div>
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm text-[#1B3A5C] dark:text-white">
          <option value="all">Toutes les sections</option>
          {groups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B3A5C]/40" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher" className="pl-9 h-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
      ) : visible.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">
          {filter === "todo" ? "Tout est traduit dans cette langue. Bravo !" : "Aucun texte à afficher."}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((it) => {
            const long = it.source.length > 120 || it.source.includes("\n")
            const done = isDone(it)
            return (
              <div key={it.source} className="bg-white dark:bg-[#132d4a] rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] dark:bg-white/10 dark:text-white/70">{it.group}</span>
                  {!done && <span className="text-[10px] font-bold text-amber-600">À traduire</span>}
                  {saved[it.source] && <span className="flex items-center gap-1 text-[10px] font-bold text-green-600"><Check className="h-3 w-3" />Enregistré</span>}
                </div>
                <p className="text-sm text-[#1B3A5C] dark:text-white mb-2 whitespace-pre-line line-clamp-6">{it.source}</p>
                {long ? (
                  <Textarea rows={Math.min(10, Math.max(3, Math.ceil(it.source.length / 90)))} value={current(it)} placeholder={`Traduction ${LOCALE_NAMES[locale]}…`} onChange={(e) => setDrafts((d) => ({ ...d, [it.source]: e.target.value }))} onBlur={() => save(it)} />
                ) : (
                  <Input value={current(it)} placeholder={`Traduction ${LOCALE_NAMES[locale]}…`} onChange={(e) => setDrafts((d) => ({ ...d, [it.source]: e.target.value }))} onBlur={() => save(it)} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
