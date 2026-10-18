import { cache } from "react"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_INFO, isLocale, type Locale } from "./config"
import { translate } from "./dictionary"

/** Langue choisie par le visiteur (cookie), français par défaut. */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
})

/** Traductions saisies par l'admin (onglet « Traductions ») pour une langue. */
export const getOverrides = cache(async (locale: Locale): Promise<Record<string, string>> => {
  if (locale === "fr") return {}
  try {
    const rows = await db.translation.findMany({ where: { locale }, select: { source: true, value: true } })
    return Object.fromEntries(rows.map((r) => [r.source, r.value]))
  } catch {
    return {} // table pas encore créée ou base indisponible : on retombe sur le dictionnaire
  }
})

/** Équivalent serveur de useI18n() pour les pages sans "use client". */
export async function getServerT() {
  const locale = await getLocale()
  const overrides = await getOverrides(locale)
  const t = (text: string | null | undefined, vars?: Record<string, string | number>) => (text ? translate(locale, text, overrides, vars) : "")
  return { t, locale, intlLocale: LOCALE_INFO[locale].intl }
}
