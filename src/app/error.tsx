"use client"

import { useI18n } from "@/i18n/I18nProvider"
import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n()
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] dark:text-white mb-2">{t("Une erreur est survenue")}</h1>
        <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-md mx-auto mb-8">
          {t("Etwas ist schief gelaufen... Un problème inattendu s'est produit. Veuillez réessayer ou revenir à l'accueil.")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => reset()} variant="outline" className="font-semibold">
            <RotateCcw className="h-4 w-4 mr-1.5" /> {t("Réessayer")}
          </Button>
          <Link href="/">
            <Button className="bg-[#1B3A5C] hover:bg-[#0f2a45] text-white font-semibold">
              <Home className="h-4 w-4 mr-1.5" /> {t("Retour à l'accueil")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}