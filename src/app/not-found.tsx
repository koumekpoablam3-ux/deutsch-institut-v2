import Link from "next/link"
import { GraduationCap, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#1B3A5C] flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="h-10 w-10 text-[#D4A843]" />
        </div>
        <h1 className="text-7xl sm:text-8xl font-extrabold text-[#1B3A5C] dark:text-white mb-2">404</h1>
        <p className="text-xl font-bold text-[#D4A843] mb-2">Seite nicht gefunden!</p>
        <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-md mx-auto mb-8">
          Oops ! Cette page s&apos;est envolée vers l&apos;Allemagne. <span className="italic">Diese Seite existiert nicht.</span>
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button className="bg-[#1B3A5C] hover:bg-[#0f2a45] text-white font-semibold">
              <Home className="h-4 w-4 mr-1.5" /> Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/cours">
            <Button className="bg-[#D4A843] hover:bg-[#C49A3A] text-white font-semibold">
              <Search className="h-4 w-4 mr-1.5" /> Rechercher un cours
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
