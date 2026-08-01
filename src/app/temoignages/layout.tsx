import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Témoignages",
  description:
    "Découvrez les témoignages de nos étudiants qui ont réussi leur examen Goethe et réalisé leur projet en Allemagne.",
  openGraph: {
    title: "Témoignages | Deutsch Institut",
    description: "500+ étudiants formés, 98% de réussite. Lisez leurs témoignages.",
  },
}

export default function TemoignagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
