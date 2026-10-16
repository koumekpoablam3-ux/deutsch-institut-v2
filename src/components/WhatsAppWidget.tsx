"use client"

import { useState } from "react"
import { X } from "lucide-react"

// Numéro de support WhatsApp (Togo, +228)
const WHATSAPP_NUMBER = "22893839645"
const WHATSAPP_DISPLAY = "+228 93 83 96 45"

const QUICK_MESSAGES = [
  "Bonjour, j'ai une question.",
  "J'ai besoin d'aide.",
  "Je veux signaler un problème technique.",
  "J'ai une proposition d'amélioration.",
]

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.351.615 4.646 1.782 6.667L2.667 29.333l6.83-1.76a13.27 13.27 0 0 0 6.507 1.76h.006c7.362 0 13.333-5.97 13.333-13.333s-5.977-13.333-13.339-13.333Zm0 24.4a11 11 0 0 1-5.61-1.535l-.402-.24-4.053 1.044 1.08-3.951-.263-.406a10.99 10.99 0 0 1-1.686-5.845c0-6.075 4.946-11.02 11.04-11.02 2.948 0 5.717 1.15 7.802 3.238a10.95 10.95 0 0 1 3.232 7.79c-.005 6.075-4.951 11.02-11.04 11.02Zm6.055-8.257c-.331-.166-1.965-.97-2.27-1.08-.305-.111-.527-.166-.75.166-.22.331-.858 1.08-1.052 1.302-.194.222-.388.25-.72.084-.33-.167-1.396-.515-2.66-1.642-.983-.877-1.647-1.96-1.84-2.291-.194-.332-.021-.511.146-.677.15-.15.332-.389.498-.583.166-.194.221-.332.332-.554.11-.221.055-.416-.028-.583-.083-.166-.75-1.809-1.028-2.477-.27-.652-.545-.564-.75-.574l-.638-.011c-.221 0-.582.083-.887.416s-1.163 1.136-1.163 2.77 1.19 3.214 1.356 3.436c.166.221 2.343 3.578 5.677 5.017.793.342 1.412.547 1.894.7.796.253 1.52.217 2.093.132.638-.095 1.965-.804 2.242-1.58.277-.775.277-1.44.194-1.58-.083-.14-.305-.221-.636-.387Z" />
    </svg>
  )
}

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false)

  const openWhatsApp = (message: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank", "noopener,noreferrer")
    setOpen(false)
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {open && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-[320px] bg-white dark:bg-[#132d4a] rounded-2xl shadow-2xl overflow-hidden border border-[#1B3A5C]/10 dark:border-white/10">
          <div className="bg-emerald-500 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
              <WhatsAppIcon className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Support Deutsch-Institut</p>
              <p className="text-white/80 text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" /> En ligne · répond vite
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 bg-[#f0f5f0] dark:bg-[#0a1628]">
            <div className="bg-white dark:bg-[#132d4a] rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-[#1B3A5C] dark:text-white/80 shadow-sm mb-3">
              👋 Bonjour ! Comment pouvons-nous vous aider ?
            </div>

            <div className="space-y-2">
              {QUICK_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  onClick={() => openWhatsApp(msg)}
                  className="w-full text-left bg-white dark:bg-[#132d4a] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-[#1B3A5C] dark:text-white/90 text-sm rounded-xl px-3.5 py-2.5 shadow-sm flex items-center justify-between gap-2 transition-colors border border-transparent hover:border-emerald-300"
                >
                  <span>{msg}</span>
                  <span className="text-emerald-500 shrink-0">→</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => openWhatsApp("Bonjour,")}
              className="mt-3 w-full text-center text-xs text-[#1B3A5C]/60 dark:text-white/50 underline underline-offset-2 hover:text-[#1B3A5C] dark:hover:text-white"
            >
              Écrire un message personnalisé →
            </button>
          </div>

          <div className="px-4 py-2.5 bg-white dark:bg-[#132d4a] border-t border-[#1B3A5C]/10 dark:border-white/10 text-center">
            <p className="text-[11px] text-[#1B3A5C]/40 dark:text-white/30">
              Vous serez redirigé vers WhatsApp ({WHATSAPP_DISPLAY})
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        title="Contacter le support sur WhatsApp"
      >
        {open ? <X className="h-6 w-6 text-white" /> : <WhatsAppIcon className="h-7 w-7 text-white" />}
      </button>
    </div>
  )
}
