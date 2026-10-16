"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Trash2 } from "lucide-react"
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

const STATUSES: { value: string; label: string; cls: string }[] = [
  { value: "pending", label: "En attente", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "completed", label: "Payé", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "failed", label: "Échoué", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { value: "refunded", label: "Remboursé", cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
]
const METHODS: Record<string, string> = { carte: "Carte", mobile_money: "Mobile Money", virement: "Virement", espece: "Espèces" }

export default function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payments")
      const data = await res.json()
      if (res.ok) setPayments(data.payments || [])
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const changeStatus = async (p: Payment, status: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
      const data = await res.json()
      if (res.ok) { setPayments((prev) => prev.map((x) => (x.id === p.id ? { ...x, status } : x))); toast.success("Statut mis à jour") }
      else toast.error(data.error || "Erreur lors de la mise à jour")
    } catch { toast.error("Erreur de connexion") }
  }

  const handleDelete = async (p: Payment) => {
    if (!confirm(`Supprimer le paiement de ${p.user.name} (${p.amount}) ?`)) return
    try {
      const res = await fetch(`/api/admin/payments/${p.id}`, { method: "DELETE" })
      if (res.ok) { setPayments((prev) => prev.filter((x) => x.id !== p.id)); toast.success("Paiement supprimé") }
      else toast.error("Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>

  const shown = filter === "all" ? payments : payments.filter((p) => p.status === filter)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50">{payments.length} paiement{payments.length > 1 ? "s" : ""} enregistré{payments.length > 1 ? "s" : ""}</p>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm text-[#1B3A5C] dark:text-white">
          <option value="all">Tous les statuts</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {shown.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun paiement.</div>
      ) : (
        <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1B3A5C]/10 dark:border-white/10 text-left text-[#1B3A5C]/50 dark:text-white/40">
                  <th className="p-4 font-semibold">Étudiant</th>
                  <th className="p-4 font-semibold">Cours</th>
                  <th className="p-4 font-semibold">Montant</th>
                  <th className="p-4 font-semibold">Méthode</th>
                  <th className="p-4 font-semibold">Statut</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const st = STATUSES.find((s) => s.value === p.status)
                  return (
                    <tr key={p.id} className="border-b border-[#1B3A5C]/5 dark:border-white/5 last:border-0">
                      <td className="p-4"><p className="font-semibold text-[#1B3A5C] dark:text-white">{p.user.name}</p><p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{p.user.email}</p></td>
                      <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{p.course.title}</td>
                      <td className="p-4 font-semibold text-[#D4A843]">{p.amount}</td>
                      <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{METHODS[p.method] || p.method}</td>
                      <td className="p-4">
                        <select value={p.status} onChange={(e) => changeStatus(p, e.target.value)} className={"text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer " + (st?.cls || "")}>
                          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="p-4 text-[#1B3A5C]/50 dark:text-white/40">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="p-4"><button onClick={() => handleDelete(p)} title="Supprimer" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
