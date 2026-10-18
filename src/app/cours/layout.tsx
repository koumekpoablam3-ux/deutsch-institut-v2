import { getServerT } from "@/i18n/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT()
  return {
    title: t("Nos Cours d'Allemand"),
    description:
      t("Découvrez nos cours d'allemand certifiés, niveaux A1 à B2. Professeurs natifs, petits groupes, support en ligne 24h/24. Inscription en ligne à Dakar, Sénégal."),
    openGraph: {
      title: t("Nos Cours d'Allemand | Deutsch Institut"),
      description:
        t("Cours structurés et certifiés pour chaque niveau, du débutant A1 jusqu'au niveau B2."),
    },
  }
}

export default function CoursLayout({ children }: { children: React.ReactNode }) {
  return children
}
