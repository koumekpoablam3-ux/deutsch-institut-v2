"use client"

import { Globe } from "lucide-react"
import { useI18n } from "@/i18n/I18nProvider"
import { LOCALES, LOCALE_INFO } from "@/i18n/config"

// Sélecteur FR / EN / DE (le choix est mémorisé dans un cookie pendant un an)
export default function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "wide" }) {
  const { locale, setLocale } = useI18n()

  return (
    <div
      role="group"
      aria-label="Language"
      className={"inline-flex items-center rounded-lg border border-[#1B3A5C]/15 dark:border-white/15 overflow-hidden " + (variant === "wide" ? "w-full" : "")}
    >
      {variant === "compact" && <Globe className="h-3.5 w-3.5 ml-2 text-[#1B3A5C]/50 dark:text-white/50 shrink-0" />}
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => l !== locale && setLocale(l)}
          aria-pressed={l === locale}
          title={LOCALE_INFO[l].name}
          className={
            "px-2.5 py-1.5 text-xs font-bold transition-colors " +
            (variant === "wide" ? "flex-1 py-2.5 text-sm " : "") +
            (l === locale ? "bg-[#1B3A5C] text-white dark:bg-[#D4A843]" : "text-[#1B3A5C]/60 dark:text-white/60 hover:bg-[#1B3A5C]/5 dark:hover:bg-white/10")
          }
        >
          {LOCALE_INFO[l].short}
        </button>
      ))}
    </div>
  )
}
