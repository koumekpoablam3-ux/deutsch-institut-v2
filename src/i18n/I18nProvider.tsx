"use client"

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LOCALE_COOKIE, LOCALE_INFO, type Locale } from "./config"
import { translate } from "./dictionary"

type TFn = (text: string | null | undefined, vars?: Record<string, string | number>) => string

interface I18nContextValue {
  locale: Locale
  /** Code de langue pour toLocaleDateString / Intl (fr-FR, en-GB, de-DE) */
  intlLocale: string
  t: TFn
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue>({
  locale: "fr",
  intlLocale: "fr-FR",
  t: (text) => text ?? "",
  setLocale: () => {},
})

/**
 * `locale` et `overrides` (traductions saisies par l'admin) viennent du layout serveur, qui lit le cookie de langue.
 */
export function I18nProvider({ locale, overrides, children }: { locale: Locale; overrides: Record<string, string>; children: ReactNode }) {
  const router = useRouter()

  const t = useCallback<TFn>(
    (text, vars) => (text ? translate(locale, text, overrides, vars) : ""),
    [locale, overrides]
  )

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
      router.refresh() // le layout serveur relit le cookie et renvoie la bonne langue
    },
    [router]
  )

  const value = useMemo(() => ({ locale, intlLocale: LOCALE_INFO[locale].intl, t, setLocale }), [locale, t, setLocale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
