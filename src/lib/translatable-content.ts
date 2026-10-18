import { db } from "@/lib/db"
import { getActiveSlides, getSetting } from "@/lib/site-content-server"

export interface TranslatableItem { source: string; group: string }

const LETTER = /[A-Za-zÀ-ÿ]{2,}/

/**
 * Rassemble tous les textes français saisis dans l'admin et affichés sur le site
 * (carrousel, chiffres, atouts, témoignages, coordonnées, cours, articles, sessions live).
 * Chaque texte peut ensuite être traduit en anglais et en allemand dans l'onglet « Traductions ».
 */
export async function collectTranslatableStrings(): Promise<TranslatableItem[]> {
  const seen = new Map<string, string>()
  const add = (group: string, value: string | null | undefined) => {
    const v = value?.trim()
    if (v && LETTER.test(v) && !seen.has(v)) seen.set(v, group)
  }

  // Carrousel (y compris les slides masqués)
  try {
    const slides = await db.heroSlide.findMany({ orderBy: { position: "asc" } })
    const list = slides.length > 0 ? slides : await getActiveSlides()
    for (const s of list) {
      for (const f of [s.title, s.highlight, s.subtitle, s.badge, s.tagsTitle, s.partnerText, s.primaryLabel, s.secondaryLabel]) add("Carrousel", f)
      s.pills.forEach((x: string) => add("Carrousel", x))
      s.tags.forEach((x: string) => add("Carrousel", x))
    }
  } catch { /* table absente : on ignore */ }

  const [hero, stats, cta, features, testimonials, contact] = await Promise.all([
    getSetting("hero"), getSetting("stats"), getSetting("cta"), getSetting("features"), getSetting("testimonials"), getSetting("contact"),
  ])
  add("Carrousel", hero.badgeText)
  stats.items.forEach((i) => add("Chiffres clés", i.label))
  ;[cta.title, cta.text, cta.primaryLabel, cta.secondaryLabel].forEach((f) => add("Bandeau final", f))
  ;[features.eyebrow, features.title, features.subtitle].forEach((f) => add("Pourquoi nous choisir", f))
  features.items.forEach((i) => { add("Pourquoi nous choisir", i.title); add("Pourquoi nous choisir", i.description) })
  testimonials.items.forEach((i) => { add("Témoignages", i.level); add("Témoignages", i.text) })
  ;[contact.tagline, contact.footerText, contact.phoneNote, contact.emailNote, contact.city, contact.addressDetail, contact.hoursDays, contact.hoursTime, contact.socialText].forEach((f) => add("Coordonnées", f))

  try {
    const courses = await db.course.findMany({ select: { title: true, description: true, objectives: true, prerequisites: true, badge: true, duration: true } })
    courses.forEach((c: { title: string; description: string; objectives: string | null; prerequisites: string | null; badge: string | null; duration: string }) => {
      ;[c.title, c.description, c.objectives, c.prerequisites, c.badge, c.duration].forEach((f) => add("Cours", f))
    })
  } catch { /* ignore */ }

  try {
    const articles = await db.article.findMany({ select: { title: true, excerpt: true, content: true } })
    articles.forEach((a: { title: string; excerpt: string | null; content: string }) => { ;[a.title, a.excerpt, a.content].forEach((f) => add("Blog", f)) })
  } catch { /* ignore */ }

  try {
    const sessions = await db.liveSession.findMany({ select: { title: true, summary: true, description: true } })
    sessions.forEach((s: { title: string; summary: string | null; description: string | null }) => { ;[s.title, s.summary, s.description].forEach((f) => add("Sessions live", f)) })
  } catch { /* ignore */ }

  return [...seen.entries()].map(([source, group]) => ({ source, group }))
}
