import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Providers from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import ChatbotWidget from "@/components/ChatbotWidget"
import WhatsAppWidget from "@/components/WhatsAppWidget"
import { I18nProvider } from "@/i18n/I18nProvider"
import { getLocale, getOverrides, getServerT } from "@/i18n/server"
import { LOCALE_INFO } from "@/i18n/config"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT()
  const brand = t("Deutsch Institut - Cours d'Allemand à Dakar")
  return {
    title: {
      template: `%s | ${brand}`,
      default: t("Deutsch Institut - Cours d'Allemand à Dakar | A1 à B2"),
    },
    description: t(
      "Institut de formation en langue allemande à Dakar, Sénégal. Cours certifiés A1 à B2, préparation aux examens Goethe-Zertifikat, accompagnement visa et hébergement. 500+ étudiants formés, 98% de réussite."
    ),
    keywords: [
      "cours allemand dakar",
      "apprendre allemand sénégal",
      "deutsch institut",
      "goethe zertifikat",
      "cours allemand en ligne",
      "formation allemande",
      "préparation examen goethe",
      "visa allemagne sénégal",
      "allemand A1 A2 B1 B2",
      "cours de langue dakar",
    ].map((k) => t(k)),
    authors: [{ name: "Deutsch-Institut" }],
    creator: "Deutsch-Institut",
    publisher: "Deutsch-Institut",
    openGraph: {
      type: "website",
      locale: LOCALE_INFO[locale].og,
      siteName: brand,
      title: t("Deutsch Institut - Cours d'Allemand à Dakar | A1 à B2"),
      description: t("Formation intensive certifiée en allemand, niveaux A1 à B2. Préparation Goethe, accompagnement visa. Dakar, Sénégal."),
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Langue choisie par le visiteur (cookie) + traductions saisies par l'admin
  const locale = await getLocale()
  const overrides = await getOverrides(locale)

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} antialiased`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <I18nProvider locale={locale} overrides={overrides}>
            <Providers>
              {children}
              <Toaster />
              <ChatbotWidget />
              <WhatsAppWidget />
            </Providers>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
