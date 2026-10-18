import { getServerT } from "@/i18n/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT()
  return {
    title: t("Blog - Actualités & Conseils"),
    description:
      t("Astuces pour apprendre l'allemand, actualités de l'institut et retours d'expérience de nos étudiants à Dakar."),
    openGraph: {
      title: t("Blog | Deutsch Institut"),
      description: t("Actualités, conseils et retours d'expérience sur l'apprentissage de l'allemand."),
    },
  }
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
