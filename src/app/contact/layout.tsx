import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Deutsch-Institut à Dakar pour vous inscrire, poser une question ou obtenir des informations sur nos cours d'allemand.",
  openGraph: {
    title: "Contact | Deutsch Institut",
    description: "Prenez contact avec notre équipe pour démarrer votre apprentissage de l'allemand.",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
