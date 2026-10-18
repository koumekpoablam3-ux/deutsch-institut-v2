import { getServerT } from "@/i18n/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT()
  return {
    title: t("Témoignages"),
    description:
      t("Découvrez les témoignages de nos étudiants qui ont réussi leur examen Goethe et réalisé leur projet en Allemagne."),
    openGraph: {
      title: t("Témoignages | Deutsch Institut"),
      description: t("500+ étudiants formés, 98% de réussite. Lisez leurs témoignages."),
    },
  }
}

export default function TemoignagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
