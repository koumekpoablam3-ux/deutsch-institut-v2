export const LOCALES = ["fr", "en", "de"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "fr"
export const LOCALE_COOKIE = "lang"

export const LOCALE_INFO: Record<Locale, { short: string; name: string; intl: string; og: string }> = {
  fr: { short: "FR", name: "Français", intl: "fr-FR", og: "fr_FR" },
  en: { short: "EN", name: "English", intl: "en-GB", og: "en_GB" },
  de: { short: "DE", name: "Deutsch", intl: "de-DE", og: "de_DE" },
}

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v)
