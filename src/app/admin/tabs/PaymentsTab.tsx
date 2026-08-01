"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Payment {
  id: string
  amount: string
  status: string
  method: string
  createdAt: string
  user: { name: string; email: string }
  course: { title: string }
}

export default function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/payments")
        const data = await res.json()
        if (res.ok) setPayments(data.payments || [])
        else toast.error(data.error || "Erreur lors du chargement")
      } catch { toast.error("Erreur de connexion") }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
  if (payments.length === 0) return <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun paiement pour le moment.</div>

  const total = payments.length

  return (
    <div>
      <div className="mb-4 text-sm text-[#1B3A5C]/60 dark:text-white/50">{total} paiement{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""} (mode démonstration)</div>
      <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1B3A5C]/10 dark:border-white/10 text-left text-[#1B3A5C]/50 dark:text-white/40">
                <th className="p-4 font-semibold">Étudiant</th>
                <th className="p-4 font-semibold">Cours</th>
                <th className="p-4 font-semibold">Montant</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-[#1B3A5C]/5 dark:border-white/5 last:border-0">
                  <td className="p-4">
                    <p className="font-semibold text-[#1B3A5C] dark:text-white">{p.user.name}</p>
                    <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{p.user.email}</p>
                  </td>
                  <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{p.course.title}</td>
                  <td className="p-4 font-semibold text-[#D4A843]">{p.amount}</td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{p.status}</span>
                  </td>
                  <td className="p-4 text-[#1B3A5C]/50 dark:text-white/40">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
