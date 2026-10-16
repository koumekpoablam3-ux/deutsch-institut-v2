import { db } from "@/lib/db"
import {
  DEFAULT_SLIDES,
  settingDefaults,
  settingSchemas,
  withDefaultIds,
  type HeroSlideData,
  type HomeContent,
  type SettingKey,
} from "@/lib/site-content"

/** Lit un réglage en base ; retombe sur les valeurs par défaut s'il est absent ou invalide. */
export async function getSetting<K extends SettingKey>(key: K): Promise<(typeof settingDefaults)[K]> {
  const defaults = settingDefaults[key]
  try {
    const row = await db.siteSetting.findUnique({ where: { key } })
    if (!row) return defaults
    const merged = { ...defaults, ...(row.value as object) }
    const parsed = settingSchemas[key].safeParse(merged)
    return (parsed.success ? parsed.data : defaults) as (typeof settingDefaults)[K]
  } catch {
    return defaults
  }
}

/** Slides visibles du carrousel. Si la table est vide (ou indisponible), on utilise les slides par défaut. */
export async function getActiveSlides(): Promise<HeroSlideData[]> {
  try {
    const slides = await db.heroSlide.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }] })
    // Aucun slide actif : on évite un accueil vide en affichant les slides par défaut
    if (slides.length === 0) return withDefaultIds(DEFAULT_SLIDES)
    // On ne transmet au client que les champs utiles (pas de dates)
    return slides.map(({ createdAt, updatedAt, ...slide }) => { void createdAt; void updatedAt; return slide })
  } catch (err) {
    console.error("getActiveSlides error:", err)
    return withDefaultIds(DEFAULT_SLIDES)
  }
}

export async function getHomeContent(): Promise<HomeContent> {
  const [slides, hero, stats, cta, features, testimonials] = await Promise.all([
    getActiveSlides(),
    getSetting("hero"),
    getSetting("stats"),
    getSetting("cta"),
    getSetting("features"),
    getSetting("testimonials"),
  ])
  return { slides, hero, stats, cta, features, testimonials }
}
