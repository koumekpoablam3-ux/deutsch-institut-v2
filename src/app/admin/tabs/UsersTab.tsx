"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Loader2, Plus, Pencil, Trash2, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const LEVELS = ["A1", "A2", "B1", "B2"]
const emptyForm = { name: "", email: "", telephone: "", niveau: "A1", role: "student", password: "" }
const selectCls = "w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm text-[#1B3A5C] dark:text-white"
const labelCls = "mb-1.5 block text-[#1B3A5C] dark:text-white/80"

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (res.ok) setUsers(data.users || [])
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => (roleFilter === "all" || u.role === roleFilter) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)))
  }, [users, query, roleFilter])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (u: AdminUser) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, telephone: u.telephone || "", niveau: LEVELS.includes(u.niveau) ? u.niveau : "B2", role: u.role, password: "" })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = editing
        ? { name: form.name, telephone: form.telephone, niveau: form.niveau, role: form.role, ...(form.password ? { password: form.password } : {}) }
        : form
      const res = await fetch(editing ? `/api/admin/users/${editing.id}` : "/api/admin/users", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) { toast.success(data.message || "Enregistré"); setModalOpen(false); fetchUsers() }
      else toast.error(data.error || "Erreur lors de l'enregistrement")
    } catch { toast.error("Erreur de connexion") }
    finally { setSaving(false) }
  }

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Supprimer définitivement le compte de ${u.name} ? Ses inscriptions, paiements et progressions seront supprimés.`)) return
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { setUsers((prev) => prev.filter((x) => x.id !== u.id)); toast.success("Utilisateur supprimé") }
      else toast.error(data.error || "Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B3A5C]/40" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par nom ou email" className="pl-9" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className={selectCls + " !w-auto"}>
          <option value="all">Tous les rôles</option>
          <option value="student">Étudiants</option>
          <option value="admin">Administrateurs</option>
        </select>
        <Button onClick={openCreate} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm"><Plus className="h-4 w-4 mr-1.5" /> Nouvel utilisateur</Button>
      </div>
      <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40 mb-3">{filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucun utilisateur trouvé.</div>
      ) : (
        <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1B3A5C]/10 dark:border-white/10 text-left text-[#1B3A5C]/50 dark:text-white/40">
                  <th className="p-4 font-semibold">Nom</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Niveau</th>
                  <th className="p-4 font-semibold">Rôle</th>
                  <th className="p-4 font-semibold">Cours</th>
                  <th className="p-4 font-semibold">Inscrit le</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[#1B3A5C]/5 dark:border-white/5 last:border-0">
                    <td className="p-4 font-semibold text-[#1B3A5C] dark:text-white">{u.name}</td>
                    <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{u.email}</td>
                    <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{u.niveau}</td>
                    <td className="p-4"><span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (u.role === "admin" ? "bg-[#D4A843]/20 text-[#D4A843]" : "bg-[#1B3A5C]/10 text-[#1B3A5C] dark:bg-white/10 dark:text-white/70")}>{u.role === "admin" ? "admin" : "étudiant"}</span></td>
                    <td className="p-4 text-[#1B3A5C]/70 dark:text-white/60">{u._count.enrollments}</td>
                    <td className="p-4 text-[#1B3A5C]/50 dark:text-white/40">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(u)} title="Modifier" className="p-2 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(u)} title="Supprimer" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b border-[#1B3A5C]/10 dark:border-white/10">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white">{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#1B3A5C]/40 dark:text-white/40"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div><Label className={labelCls}>Nom complet</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className={labelCls}>Email {editing && <span className="text-xs text-[#1B3A5C]/40">(non modifiable)</span>}</Label><Input required type="email" disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label className={labelCls}>Téléphone</Label><Input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className={labelCls}>Niveau</Label><select className={selectCls} value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value })}>{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></div>
                <div><Label className={labelCls}>Rôle</Label><select className={selectCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Étudiant</option><option value="admin">Administrateur</option></select></div>
              </div>
              <div>
                <Label className={labelCls}>{editing ? "Nouveau mot de passe (laisser vide pour ne pas le changer)" : "Mot de passe"}</Label>
                <Input type="text" autoComplete="new-password" required={!editing} minLength={editing && !form.password ? undefined : 6} placeholder="6 caractères minimum" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saving} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Enregistrer" : "Créer le compte"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
