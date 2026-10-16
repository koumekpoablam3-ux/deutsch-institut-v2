"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] dark:text-white mb-2">Une erreur est survenue</h1>
        <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-md mx-auto mb-8">
          Etwas ist schief gelaufen... Un problème inattendu s&apos;est produit. Veuillez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => reset()} variant="outline" className="font-semibold">
            <RotateCcw className="h-4 w-4 mr-1.5" /> Réessayer
          </Button>
          <Link href="/">
            <Button className="bg-[#1B3A5C] hover:bg-[#0f2a45] text-white font-semibold">
              <Home className="h-4 w-4 mr-1.5" /> Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}