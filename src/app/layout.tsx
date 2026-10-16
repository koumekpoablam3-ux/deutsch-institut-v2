import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Providers from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import ChatbotWidget from "@/components/ChatbotWidget"
import WhatsAppWidget from "@/components/WhatsAppWidget"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: "%s | Deutsch Institut - Cours d'Allemand à Dakar",
    default: "Deutsch Institut - Cours d'Allemand à Dakar | A1 à C1",
  },
  description:
    "Institut de formation en langue allemande à Dakar, Sénégal. Cours certifiés A1 à C1, préparation aux examens Goethe-Zertifikat, accompagnement visa et hébergement. 500+ étudiants formés, 98% de réussite.",
  keywords: [
    "cours allemand dakar",
    "apprendre allemand sénégal",
    "deutsch institut",
    "goethe zertifikat",
    "cours allemand en ligne",
    "formation allemande",
    "préparation examen goethe",
    "visa allemagne sénégal",
    "allemand A1 A2 B1 B2 C1",
    "cours de langue dakar",
  ],
  authors: [{ name: "Deutsch-Institut" }],
  creator: "Deutsch-Institut",
  publisher: "Deutsch-Institut",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Deutsch Institut - Cours d'Allemand à Dakar",
    title: "Deutsch Institut - Cours d'Allemand à Dakar | A1 à C1",
    description:
      "Formation intensive certifiée en allemand, niveaux A1 à C1. Préparation Goethe, accompagnement visa. Dakar, Sénégal.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} antialiased`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers>
            {children}
            <Toaster />
            <ChatbotWidget />
            <WhatsAppWidget />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
