import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Actualités & Conseils",
  description:
    "Astuces pour apprendre l'allemand, actualités de l'institut et retours d'expérience de nos étudiants à Dakar.",
  openGraph: {
    title: "Blog | Deutsch Institut",
    description: "Actualités, conseils et retours d'expérience sur l'apprentissage de l'allemand.",
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
