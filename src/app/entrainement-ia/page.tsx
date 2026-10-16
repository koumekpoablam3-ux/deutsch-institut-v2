"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2, Trash2, Sparkles, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import { toast } from "sonner"

interface ChatMsg {
  id: string
  role: string
  content: string
  correction?: string | null
  createdAt: string
}

export default function AIPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [niveau, setNiveau] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadHistory = useCallback(async () => {
    try {
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()
      if (!session?.user) { router.push("/login"); return }
      const u = session.user as { niveau?: string }
      setNiveau(u.niveau || "A1")

      const chatRes = await fetch("/api/chat")
      if (chatRes.ok) {
        const data = await chatRes.json()
        setMessages(data.data?.messages || [])
      }
    } catch { router.push("/login") }
    finally { setSessionChecked(true) }
  }, [router])

  useEffect(() => { loadHistory() }, [loadHistory])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setLoading(true)
    const tempId = "temp-" + Date.now()
    setMessages(prev => [...prev, { id: tempId, role: "user", content: text, createdAt: new Date().toISOString() }])
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, niveau }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { id: "ai-" + Date.now(), role: "assistant", content: data.data?.reply, correction: data.data?.correction || null, createdAt: new Date().toISOString() }])
      } else {
        toast.error(data.error || "Erreur")
        setMessages(prev => prev.filter(m => m.id !== tempId))
      }
    } catch {
      toast.error("Erreur de connexion")
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally { setLoading(false) }
  }

  const clearHistory = async () => {
    if (!confirm("Effacer tout l\'historique de conversation ?")) return
    try {
      const res = await fetch("/api/chat", { method: "DELETE" })
      if (res.ok) {
        setMessages([])
        toast.success("Historique effacé")
      } else {
        toast.error("Impossible d\'effacer l\'historique")
      }
    } catch {
      toast.error("Erreur de connexion")
    }
  }

  if (!sessionChecked) return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" />
    </div>
  )

  return (
    <>
      <Header />
      <div className="pt-16 min-h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-[#0a1628]">
        {/* Chat Header */}
        <div className="border-b border-[#1B3A5C]/10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="lg:hidden"><ArrowLeft className="h-5 w-5 text-[#1B3A5C] dark:text-white" /></Link>
              <div className="w-10 h-10 rounded-full bg-[#1B3A5C] flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#D4A843]" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#1B3A5C] dark:text-white">DeutschTutor IA</p>
                <p className="text-[10px] text-green-600 font-medium">En ligne · Niveau {niveau}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-[#1B3A5C]/40 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                <Sparkles className="h-12 w-12 text-[#D4A843] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-2">Commencez à pratiquer !</h2>
                <p className="text-[#1B3A5C]/50 dark:text-white/40 max-w-md mx-auto text-sm mb-6">Écrivez quelque chose en allemand et je vous aiderai avec la grammaire, le vocabulaire et la prononciation.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Guten Tag, wie geht es Ihnen?", "Ich möchte Deutsch lernen.", "Können Sie mir helfen?"].map((s) => (
                    <button key={s} onClick={() => setInput(s)} className="text-xs bg-[#f8f9fb] dark:bg-[#132d4a] text-[#1B3A5C]/60 dark:text-white/50 px-3 py-1.5 rounded-full hover:bg-[#D4A843]/10 hover:text-[#D4A843] transition-colors">{s}</button>
                  ))}
                </div>
              </motion.div>
            )}
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={"flex gap-3 " + (msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div className={"w-8 h-8 rounded-full flex items-center justify-center shrink-0 " + (msg.role === "user" ? "bg-[#1B3A5C]" : "bg-[#D4A843]/20")}>
                    {msg.role === "user" ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-[#D4A843]" />}
                  </div>
                  <div className={"max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed " + (msg.role === "user" ? "bg-[#1B3A5C] text-white rounded-br-sm" : "bg-[#f8f9fb] dark:bg-[#132d4a] text-[#1B3A5C] dark:text-white/80 rounded-bl-sm")}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.correction && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Correction :</p>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{msg.correction}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4A843]/20 flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-[#D4A843]" /></div>
                <div className="bg-[#f8f9fb] dark:bg-[#132d4a] rounded-2xl rounded-bl-sm px-4 py-3"><div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-[#D4A843]/60 animate-bounce" style={{ animationDelay: "0ms" }} /><div className="w-2 h-2 rounded-full bg-[#D4A843]/60 animate-bounce" style={{ animationDelay: "150ms" }} /><div className="w-2 h-2 rounded-full bg-[#D4A843]/60 animate-bounce" style={{ animationDelay: "300ms" }} /></div></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#1B3A5C]/10 px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-[#0a1628]">
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Écrivez en allemand..."
              disabled={loading}
              className="flex-1 h-12 rounded-xl border border-[#1B3A5C]/20 bg-[#f8f9fb] dark:bg-[#132d4a] text-[#1B3A5C] dark:text-white px-4 text-sm focus:outline-none focus:border-[#D4A843] disabled:opacity-50"
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white h-12 w-12 p-0 rounded-xl disabled:opacity-50">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}