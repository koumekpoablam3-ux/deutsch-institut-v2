import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nos Cours d'Allemand",
  description:
    "Découvrez nos cours d'allemand certifiés, niveaux A1 à B2. Professeurs natifs, petits groupes, support en ligne 24h/24. Inscription en ligne à Dakar, Sénégal.",
  openGraph: {
    title: "Nos Cours d'Allemand | Deutsch Institut",
    description:
      "Cours structurés et certifiés pour chaque niveau, du débutant A1 jusqu'au niveau B2.",
  },
}

export default function CoursLayout({ children }: { children: React.ReactNode }) {
  return children
}
