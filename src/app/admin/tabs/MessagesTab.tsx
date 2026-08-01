"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Trash2, Mailbox, MailOpen } from "lucide-react"
import { toast } from "sonner"

interface ContactMsg {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  niveau: string | null
  message: string
  read: boolean
  createdAt: string
}

export default function MessagesTab() {
  const [messages, setMessages] = useState<ContactMsg[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/contact")
      const data = await res.json()
      if (res.ok) setMessages(data.messages || [])
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const toggleRead = async (m: ContactMsg) => {
    try {
      const res = await fetch(`/api/admin/contact/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !m.read }),
      })
      if (res.ok) setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: !x.read } : x))
    } catch { toast.error("Erreur de connexion") }
  }

  const handleDelete = async (m: ContactMsg) => {
    if (!confirm("Supprimer ce message ?")) return
    try {
      const res = await fetch(`/api/admin/contact/${m.id}`, { method: "DELETE" })
      if (res.ok) { setMessages(prev => prev.filter(x => x.id !== m.id)); toast.success("Message supprimé") }
    } catch { toast.error("Erreur de connexion") }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
  if (messages.length === 0) return <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun message pour le moment.</div>

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={"bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm " + (!m.read ? "ring-1 ring-[#D4A843]/40" : "")}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="font-bold text-[#1B3A5C] dark:text-white text-sm">{m.prenom} {m.nom} {!m.read && <span className="ml-2 text-[10px] font-bold text-[#D4A843] bg-[#D4A843]/10 px-2 py-0.5 rounded-full align-middle">NOUVEAU</span>}</p>
              <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{m.email} · {m.telephone}{m.niveau ? ` · Niveau ${m.niveau}` : ""}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => toggleRead(m)} title={m.read ? "Marquer non lu" : "Marquer lu"} className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70">
                {m.read ? <Mailbox className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
              </button>
              <button onClick={() => handleDelete(m)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <p className="text-sm text-[#1B3A5C]/70 dark:text-white/60">{m.message}</p>
          <p className="text-[10px] text-[#1B3A5C]/30 dark:text-white/20 mt-2">{new Date(m.createdAt).toLocaleString("fr-FR")}</p>
        </div>
      ))}
    </div>
  )
}
