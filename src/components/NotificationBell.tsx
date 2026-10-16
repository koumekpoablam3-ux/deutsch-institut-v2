"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Bell, Loader2 } from "lucide-react"

interface Notif {
  id: string
  title: string
  message: string
  type: string
  link: string | null
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      setNotifs(data.data?.notifications || [])
      setUnread(data.data?.unreadCount || 0)
    } catch { /* silencieux */ }
  }, [])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const toggleOpen = async () => {
    setOpen((o) => !o)
    if (!open && unread > 0) {
      setLoading(true)
      try {
        await fetch("/api/notifications/mark-all-read", { method: "POST" })
        setUnread(0)
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
      } catch { /* silencieux */ }
      finally { setLoading(false) }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggleOpen} className="relative p-2 text-[#1B3A5C]/70 dark:text-white/60 hover:text-[#1B3A5C] dark:hover:text-white" title="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-[#D4A843] text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#132d4a] rounded-xl shadow-xl border border-[#1B3A5C]/10 dark:border-white/10 z-50">
          <div className="p-3 border-b border-[#1B3A5C]/10 dark:border-white/10 flex items-center justify-between">
            <p className="font-bold text-sm text-[#1B3A5C] dark:text-white">Notifications</p>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D4A843]" />}
          </div>
          {notifs.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#1B3A5C]/40 dark:text-white/30">Aucune notification pour le moment.</p>
          ) : (
            <div>
              {notifs.map((n) => {
                const content = (
                  <div className={"p-3 border-b border-[#1B3A5C]/5 dark:border-white/5 last:border-0 " + (!n.read ? "bg-[#D4A843]/5" : "")}>
                    <p className="text-sm font-semibold text-[#1B3A5C] dark:text-white">{n.title}</p>
                    <p className="text-xs text-[#1B3A5C]/60 dark:text-white/50 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-[#1B3A5C]/30 dark:text-white/25 mt-1">{new Date(n.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                )
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)} className="block hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5">{content}</Link>
                ) : (
                  <div key={n.id}>{content}</div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
