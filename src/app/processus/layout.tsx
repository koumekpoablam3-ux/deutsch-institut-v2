import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notre Processus",
  description:
    "Découvrez notre méthode d'enseignement en 4 étapes : évaluation, programme personnalisé, formation intensive et certification Goethe.",
  openGraph: {
    title: "Notre Processus | Deutsch Institut",
    description: "De l'évaluation au certificat, notre méthode éprouvée pour maîtriser l'allemand.",
  },
}

export default function ProcessusLayout({ children }: { children: React.ReactNode }) {
  return children
}
