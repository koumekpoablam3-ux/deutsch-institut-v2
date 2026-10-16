"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { Loader2, Upload, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { uploadImage, type MediaItem } from "../components/ImagePicker"
import { formatBytes } from "@/lib/image-compress"

export default function MediaTab() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media")
      const data = await res.json()
      if (res.ok) setMedia(data.media || [])
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    let ok = 0
    for (const f of Array.from(files)) {
      try { await uploadImage(f); ok++ }
      catch (err) { toast.error(`${f.name} : ${err instanceof Error ? err.message : "échec"}`) }
    }
    if (ok > 0) toast.success(ok + (ok > 1 ? " images enregistrées" : " image enregistrée"))
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
    fetchMedia()
  }

  const handleDelete = async (m: MediaItem) => {
    if (!confirm(`Supprimer « ${m.filename} » ?`)) return
    try {
      const res = await fetch(`/api/admin/media/${m.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { setMedia((prev) => prev.filter((x) => x.id !== m.id)); toast.success("Image supprimée") }
      else toast.error(data.error || "Erreur lors de la suppression")
    } catch { toast.error("Erreur de connexion") }
  }

  const copyLink = async (m: MediaItem) => {
    try { await navigator.clipboard.writeText(window.location.origin + m.url); toast.success("Lien copié") }
    catch { toast.error("Impossible de copier le lien") }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50">Les images sont enregistrées dans la base de données PostgreSQL et compressées automatiquement.</p>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold text-sm shrink-0">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />} Téléverser
        </Button>
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" /></div>
      ) : media.length === 0 ? (
        <div className="bg-white dark:bg-[#132d4a] rounded-xl p-10 text-center text-[#1B3A5C]/50 dark:text-white/40">Aucune image téléversée pour le moment.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((m) => (
            <div key={m.id} className="bg-white dark:bg-[#132d4a] rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-32 bg-[#1B3A5C]/5"><Image src={m.url} alt={m.filename} fill unoptimized className="object-contain" /></div>
              <div className="p-3">
                <p className="text-xs font-medium text-[#1B3A5C] dark:text-white truncate">{m.filename}</p>
                <p className="text-[10px] text-[#1B3A5C]/40 dark:text-white/30 mb-2">{formatBytes(m.size)} · {new Date(m.createdAt).toLocaleDateString("fr-FR")}</p>
                <div className="flex justify-end gap-1">
                  <button onClick={() => copyLink(m)} title="Copier le lien" className="p-1.5 rounded-lg hover:bg-[#1B3A5C]/5 dark:hover:bg-white/5 text-[#1B3A5C] dark:text-white/70"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(m)} title="Supprimer" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
