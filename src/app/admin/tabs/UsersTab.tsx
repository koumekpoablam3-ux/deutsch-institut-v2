"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AdminUser {
  id: string
  name: string
  email: string
  telephone: string | null
  niveau: string
  role: string
  createdAt: string
  _count: { enrollments: number }
}

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/users")
        const data = await res.json()
        if (res.ok) setUsers(data.users || [])
        else toast.error(data.error || "Erreur lors du chargement")
      } catch { toast.error("Erreur de connexion") }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
  if (users.length === 0) return <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun utilisateur.</div>

  return (
    <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1B3A5C]/10 dark:border-white/10 text-left text-[#1B3A5C]/50 dark:text-white/40">
              <th className="p-4 font-semibold">Nom</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Niveau</th>
              <th className="p-4 font-semibold">Rôle</th>
              <th className="p-4 font-semibold">Cours suivis</th>
              <th className="p-4 font-semibold">Inscrit depuis</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-[#1B3A5C]/5 dark:border-white/5 last:border-0">
                <td className="p-4 font-semibold text-[#1B3A5C] dark:text-white">{u.name}</td>
                <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{u.email}</td>
                <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{u.niveau}</td>
                <td className="p-4">
                  <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (u.role === "admin" ? "bg-[#D4A843]/20 text-[#D4A843]" : "bg-[#1B3A5C]/10 text-[#1B3A5C] dark:bg-white/10 dark:text-white/70")}>{u.role}</span>
                </td>
                <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{u._count.enrollments}</td>
                <td className="p-4 text-[#1B3A5C]/50 dark:text-white/40">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
