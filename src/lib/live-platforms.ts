// Plateformes de visioconférence proposées à l'admin pour programmer un live.
// Fichier "pur" (sans Prisma) : utilisable côté client et côté serveur.

export const LIVE_PLATFORMS = [
  { value: "jitsi", label: "Jitsi (intégré au site)", hosts: [] as string[], needsLink: false, placeholder: "" },
  { value: "zoom", label: "Zoom", hosts: ["zoom.us", "zoom.com", "zoomgov.com"], needsLink: true, placeholder: "https://zoom.us/j/123456789" },
  { value: "meet", label: "Google Meet", hosts: ["meet.google.com"], needsLink: true, placeholder: "https://meet.google.com/abc-defg-hij" },
  { value: "youtube", label: "YouTube Live", hosts: ["youtube.com", "youtu.be"], needsLink: true, placeholder: "https://www.youtube.com/watch?v=..." },
  { value: "streamyard", label: "StreamYard", hosts: ["streamyard.com"], needsLink: true, placeholder: "https://streamyard.com/..." },
] as const

export type LivePlatform = (typeof LIVE_PLATFORMS)[number]["value"]
export const LIVE_PLATFORM_VALUES = ["jitsi", "zoom", "meet", "youtube", "streamyard"] as const

export const LIVE_STATUSES = [
  { value: "scheduled", label: "Programmée" },
  { value: "live", label: "En direct" },
  { value: "ended", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
] as const
export const LIVE_STATUS_VALUES = ["scheduled", "live", "ended", "cancelled"] as const
export type LiveStatus = (typeof LIVE_STATUSES)[number]["value"]

export function platformInfo(platform: string) {
  return LIVE_PLATFORMS.find((p) => p.value === platform) ?? LIVE_PLATFORMS[0]
}

const hostMatches = (host: string, suffixes: readonly string[]) =>
  suffixes.some((s) => host === s || host.endsWith("." + s))

/** Retourne un message d'erreur, ou null si le lien est valide pour la plateforme choisie. */
export function validateMeetingUrl(platform: string, url: string | null | undefined): string | null {
  const info = platformInfo(platform)
  if (!info.needsLink) return null
  if (!url || !url.trim()) return `Le lien de la salle ${info.label} est requis`
  let parsed: URL
  try { parsed = new URL(url.trim()) } catch { return "Lien invalide" }
  if (parsed.protocol !== "https:") return "Le lien doit commencer par https://"
  if (!hostMatches(parsed.hostname.toLowerCase(), info.hosts)) {
    return `Ce lien ne correspond pas à ${info.label} (domaine attendu : ${info.hosts[0]})`
  }
  return null
}

/** Transforme un lien YouTube (watch, live, youtu.be, embed) en lien intégrable, ou null. */
export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    let id: string | null = null
    if (host === "youtu.be") id = u.pathname.slice(1)
    else if (hostMatches(host, ["youtube.com"])) {
      if (u.pathname === "/watch") id = u.searchParams.get("v")
      else {
        const m = u.pathname.match(/^\/(?:live|embed|shorts)\/([\w-]{11})/)
        if (m) id = m[1]
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube.com/embed/${id}` : null
  } catch { return null }
}
