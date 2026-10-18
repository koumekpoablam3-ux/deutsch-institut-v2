import { getServerT } from "@/i18n/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT()
  return {
    title: t("Contact"),
    description:
      t("Contactez Deutsch-Institut à Dakar pour vous inscrire, poser une question ou obtenir des informations sur nos cours d'allemand."),
    openGraph: {
      title: t("Contact | Deutsch Institut"),
      description: t("Prenez contact avec notre équipe pour démarrer votre apprentissage de l'allemand."),
    },
  }
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
