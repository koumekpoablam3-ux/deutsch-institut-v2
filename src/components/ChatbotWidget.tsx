"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, GraduationCap } from "lucide-react"

interface Msg {
  role: "user" | "assistant"
  content: string
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Bonjour ! 👋 Je suis l'assistant de Deutsch-Institut. Posez-moi vos questions sur nos cours, tarifs, niveaux ou l'inscription !" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.data?.reply || "Désolé, je n'ai pas compris votre question." }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erreur de connexion. Veuillez réessayer." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-[360px] h-[480px] bg-white dark:bg-[#132d4a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#1B3A5C]/10 dark:border-white/10">
          <div className="bg-[#1B3A5C] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4A843] flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Assistant Deutsch-Institut</p>
              <p className="text-white/50 text-[11px]">En ligne</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fb] dark:bg-[#0a1628]">
            {messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={"max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line " + (m.role === "user" ? "bg-[#D4A843] text-white rounded-br-sm" : "bg-white dark:bg-[#132d4a] text-[#1B3A5C] dark:text-white/80 rounded-bl-sm shadow-sm")}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#132d4a] rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-[#D4A843]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-[#1B3A5C]/10 dark:border-white/10 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre question..."
              className="flex-1 h-10 rounded-full px-4 text-sm bg-[#f8f9fb] dark:bg-[#0a1628] text-[#1B3A5C] dark:text-white border border-[#1B3A5C]/10 dark:border-white/10 focus:outline-none focus:border-[#D4A843]"
            />
            <button type="submit" disabled={loading || !input.trim()} className="w-10 h-10 rounded-full bg-[#D4A843] hover:bg-[#C49A3A] disabled:opacity-50 flex items-center justify-center shrink-0">
              <Send className="h-4 w-4 text-white" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-[#D4A843] hover:bg-[#C49A3A] shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        title="Discuter avec l'assistant"
      >
        {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>
    </div>
  )
}
