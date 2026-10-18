import { getServerT } from "@/i18n/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT()
  return {
    title: t("Entraînement IA"),
    description:
      t("Entraînez-vous à l'allemand avec notre assistant IA. Pratiquez la conversation, la grammaire et le vocabulaire de manière interactive."),
    openGraph: {
      title: t("Entraînement IA | Deutsch Institut"),
      description: t("Pratiquez l'allemand avec notre assistant IA intelligent."),
    },
  }
}

export default function EntrainementIALayout({ children }: { children: React.ReactNode }) {
  return children
}
