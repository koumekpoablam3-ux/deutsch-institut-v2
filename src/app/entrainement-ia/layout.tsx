import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Entraînement IA",
  description:
    "Entraînez-vous à l'allemand avec notre assistant IA. Pratiquez la conversation, la grammaire et le vocabulaire de manière interactive.",
  openGraph: {
    title: "Entraînement IA | Deutsch Institut",
    description: "Pratiquez l'allemand avec notre assistant IA intelligent.",
  },
}

export default function EntrainementIALayout({ children }: { children: React.ReactNode }) {
  return children
}
