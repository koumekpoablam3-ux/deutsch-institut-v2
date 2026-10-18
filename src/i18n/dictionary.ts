import en from "./dictionaries/en.json"
import de from "./dictionaries/de.json"
import type { Locale } from "./config"

// Le français est la langue source : chaque clé est le texte français tel qu'il apparaît dans le code.
// Un texte sans traduction est simplement affiché en français (jamais d'erreur).
const dictionaries: Record<Locale, Record<string, string>> = {
  fr: {},
  en: en as Record<string, string>,
  de: de as Record<string, string>,
}

export function translate(locale: Locale, text: string, overrides?: Record<string, string>, vars?: Record<string, string | number>): string {
  let out = text
  if (locale !== "fr") {
    out = overrides?.[text] ?? dictionaries[locale][text] ?? text
  }
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
  return out
}

/** Dictionnaire intégré au code (textes de l'interface + contenu par défaut) pour une langue. */
export const builtinDictionary = (locale: Locale): Record<string, string> => dictionaries[locale]
