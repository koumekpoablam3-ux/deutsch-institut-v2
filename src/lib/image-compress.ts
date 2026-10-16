// Redimensionne et compresse une image dans le navigateur avant l'envoi,
// pour rester sous la limite de 4 Mo des fonctions serveur (et charger plus vite sur mobile).
const MAX_BYTES = 4 * 1024 * 1024

interface Options {
  maxSize?: number
  quality?: number
  /** Garde la transparence (logos) : sortie PNG au lieu de JPEG */
  keepTransparency?: boolean
}

export async function prepareImage(file: File, { maxSize = 1920, quality = 0.82, keepTransparency = false }: Options = {}): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Le fichier doit être une image")

  // SVG et GIF animés : envoyés tels quels
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    if (file.size > MAX_BYTES) throw new Error("Image trop lourde (maximum 4 Mo)")
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Impossible de traiter l'image")
  if (!keepTransparency) {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const outType = keepTransparency ? "image/png" : "image/jpeg"
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, outType, quality))
  if (!blob) throw new Error("Impossible de compresser l'image")

  // Si l'original est déjà plus léger et n'a pas été redimensionné, on le garde
  if (scale === 1 && file.size <= blob.size && file.size <= MAX_BYTES) return file
  if (blob.size > MAX_BYTES) throw new Error("Image trop lourde même après compression")

  const base = file.name.replace(/\.[^.]+$/, "") || "image"
  return new File([blob], base + (keepTransparency ? ".png" : ".jpg"), { type: outType })
}

export function formatBytes(n: number): string {
  if (n < 1024) return n + " o"
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " Ko"
  return (n / 1024 / 1024).toFixed(1) + " Mo"
}
