"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, FolderOpen, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { prepareImage } from "@/lib/image-compress"

export interface MediaItem { id: string; filename: string; mimeType: string; size: number; createdAt: string; url: string }

// Images déjà présentes dans le code du site (dossier /public)
const BUILTIN_IMAGES = [
  { url: "/images/hero/hero-1.jpg", label: "Accueil 1" },
  { url: "/images/hero/hero-2.jpg", label: "Accueil 2" },
  { url: "/images/hero/hero-3.jpg", label: "Accueil 3" },
]

export async function uploadImage(file: File, keepTransparency = false): Promise<MediaItem> {
  const prepared = await prepareImage(file, { maxSize: keepTransparency ? 800 : 1920, keepTransparency })
  const form = new FormData()
  form.append("file", prepared)
  const res = await fetch("/api/admin/media", { method: "POST", body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Échec de l'envoi")
  return data.media as MediaItem
}

interface Props {
  value: string
  onChange: (url: string) => void
  label: string
  /** Logo : conserve la transparence et redimensionne plus petit */
  logo?: boolean
  optional?: boolean
}

export default function ImagePicker({ value, onChange, label, logo = false, optional = false }: Props) {
  const [uploading, setUploading] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loadingLib, setLoadingLib] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadLibrary = useCallback(async () => {
    setLoadingLib(true)
    try {
      const res = await fetch("/api/admin/media")
      const data = await res.json()
      if (res.ok) setMedia(data.media || [])
      else toast.error(data.error || "Erreur lors du chargement")
    } catch { toast.error("Erreur de connexion") }
    finally { setLoadingLib(false) }
  }, [])

  useEffect(() => { if (libraryOpen) loadLibrary() }, [libraryOpen, loadLibrary])

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const m = await uploadImage(file, logo)
      onChange(m.url)
      toast.success("Image enregistrée dans la base de données")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-[#1B3A5C] dark:text-white/80">{label}</p>
      <div className="flex gap-3 items-start">
        <div className={"relative shrink-0 rounded-lg overflow-hidden border border-[#1B3A5C]/10 dark:border-white/10 flex items-center justify-center " + (logo ? "w-28 h-16 bg-white" : "w-36 h-24 bg-[#1B3A5C]/5")}>
          {value ? (
            <Image src={value} alt="" fill unoptimized className={logo ? "object-contain p-1" : "object-cover"} />
          ) : (
            <ImageIcon className="h-6 w-6 text-[#1B3A5C]/30" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Upload className="h-4 w-4 mr-1.5" />} Téléverser
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setLibraryOpen(true)}>
              <FolderOpen className="h-4 w-4 mr-1.5" /> Médiathèque
            </Button>
            {optional && value && (
              <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => onChange("")}>
                <X className="h-4 w-4 mr-1" /> Retirer
              </Button>
            )}
          </div>
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="ou coller un lien : /images/... ou https://..." className="text-xs h-8" />
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
      </div>

      {libraryOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1B3A5C]/10 dark:border-white/10">
              <h3 className="font-bold text-[#1B3A5C] dark:text-white">Choisir une image</h3>
              <button type="button" onClick={() => setLibraryOpen(false)} className="text-[#1B3A5C]/40 dark:text-white/40"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-5">
              <div>
                <p className="text-xs font-semibold text-[#1B3A5C]/50 dark:text-white/40 mb-2 uppercase tracking-wide">Images du site</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {BUILTIN_IMAGES.map((b) => (
                    <button type="button" key={b.url} onClick={() => { onChange(b.url); setLibraryOpen(false) }} className="group text-left">
                      <div className="relative h-20 rounded-lg overflow-hidden border border-[#1B3A5C]/10 group-hover:ring-2 ring-[#D4A843]"><Image src={b.url} alt={b.label} fill unoptimized className="object-cover" /></div>
                      <p className="text-[11px] mt-1 text-[#1B3A5C]/60 dark:text-white/50 truncate">{b.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1B3A5C]/50 dark:text-white/40 mb-2 uppercase tracking-wide">Images téléversées</p>
                {loadingLib ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-[#D4A843] animate-spin" /></div>
                ) : media.length === 0 ? (
                  <p className="text-sm text-[#1B3A5C]/50 dark:text-white/40 py-4">Aucune image téléversée pour le moment.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {media.map((m) => (
                      <button type="button" key={m.id} onClick={() => { onChange(m.url); setLibraryOpen(false) }} className="group text-left">
                        <div className="relative h-20 rounded-lg overflow-hidden border border-[#1B3A5C]/10 bg-white group-hover:ring-2 ring-[#D4A843]"><Image src={m.url} alt={m.filename} fill unoptimized className="object-contain" /></div>
                        <p className="text-[11px] mt-1 text-[#1B3A5C]/60 dark:text-white/50 truncate">{m.filename}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
