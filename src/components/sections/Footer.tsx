"use client"

import { useI18n } from "@/i18n/I18nProvider"
import Link from "next/link"
import { Mail, Phone, GraduationCap, MapPin } from "lucide-react"
import { useContactSettings } from "@/lib/use-contact-settings"

export default function Footer() {
  const { t } = useI18n()
  const contact = useContactSettings()
  return (
    <footer className="bg-[#1B3A5C] dark:bg-[#050d1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#D4A843] flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-base">{contact.siteName}</p>
                {contact.tagline && <p className="text-[11px] text-[#D4A843]">{t(contact.tagline)}</p>}
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              {t(contact.footerText)}
            </p>
            <div className="space-y-2.5">
              {contact.phone && (
                <div className="flex items-center gap-2.5 text-white/50 text-sm">
                  <Phone className="h-4 w-4 text-[#D4A843]" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2.5 text-white/50 text-sm">
                  <Mail className="h-4 w-4 text-[#D4A843]" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.city && (
                <div className="flex items-center gap-2.5 text-white/50 text-sm">
                  <MapPin className="h-4 w-4 text-[#D4A843]" />
                  <span>{t(contact.city)}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5 text-[#D4A843]">{t("Nos Cours")}</h4>
            <ul className="space-y-3">
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">{t("Allemand A1")}</Link></li>
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">{t("Allemand A2")}</Link></li>
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">{t("Allemand B1")}</Link></li>
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">{t("Allemand B2")}</Link></li>
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">{t("Préparation Goethe")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5 text-[#D4A843]">{t("Navigation")}</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">{t("Accueil")}</Link></li>
              <li><Link href="/processus" className="text-white/50 hover:text-white text-sm transition-colors">{t("Notre Processus")}</Link></li>
              <li><Link href="/temoignages" className="text-white/50 hover:text-white text-sm transition-colors">{t("Témoignages")}</Link></li>
              <li><Link href="/contact" className="text-white/50 hover:text-white text-sm transition-colors">{t("Contact")}</Link></li>
              <li><Link href="/entrainement-ia" className="text-white/50 hover:text-white text-sm transition-colors">{t("Entraînement IA")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5 text-[#D4A843]">{t("Suivez-nous")}</h4>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              {t(contact.socialText)}
            </p>
            {contact.socials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contact.socials.map((so) => (
                  <a key={so.label + so.url} href={so.url} target="_blank" rel="noopener noreferrer" className="px-4 h-10 rounded-lg bg-white/10 hover:bg-[#D4A843] flex items-center justify-center text-sm transition-colors">
                    {t(so.label)}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">©{" "}{new Date().getFullYear()} {contact.siteName}{t(". Tous droits réservés.")}</p>
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="text-white/40 hover:text-white text-sm transition-colors">{t("Mentions légales")}</Link>
            <Link href="/confidentialite" className="text-white/40 hover:text-white text-sm transition-colors">{t("Confidentialité")}</Link>
            <Link href="/cgv" className="text-white/40 hover:text-white text-sm transition-colors">{t("CGV")}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}