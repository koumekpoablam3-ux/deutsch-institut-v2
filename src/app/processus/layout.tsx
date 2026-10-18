import { getServerT } from "@/i18n/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT()
  return {
    title: t("Notre Processus"),
    description:
      t("Découvrez notre méthode d'enseignement en 4 étapes : évaluation, programme personnalisé, formation intensive et certification Goethe."),
    openGraph: {
      title: t("Notre Processus | Deutsch Institut"),
      description: t("De l'évaluation au certificat, notre méthode éprouvée pour maîtriser l'allemand."),
    },
  }
}

export default function ProcessusLayout({ children }: { children: React.ReactNode }) {
  return children
}
