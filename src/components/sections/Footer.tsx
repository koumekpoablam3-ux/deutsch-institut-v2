"use client"

import Link from "next/link"
import { Globe, Mail, Phone, MessageCircle, GraduationCap, MapPin } from "lucide-react"

export default function Footer() {
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
                <p className="font-bold text-base">Deutsch-Institut</p>
                <p className="text-[11px] text-[#D4A843]">Deutsch Für Alle</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Institut de formation en langue allemande. Cours certifiés de A1 à C1, préparation aux examens Goethe, accompagnement visa et hébergement.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-white/50 text-sm">
                <Phone className="h-4 w-4 text-[#D4A843]" />
                <span>+221 77 123 45 67</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/50 text-sm">
                <Mail className="h-4 w-4 text-[#D4A843]" />
                <span>contact@deutsch-institut.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/50 text-sm">
                <MapPin className="h-4 w-4 text-[#D4A843]" />
                <span>Dakar, Sénégal</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5 text-[#D4A843]">Nos Cours</h4>
            <ul className="space-y-3">
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">Allemand A1</Link></li>
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">Allemand A2</Link></li>
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">Allemand B1</Link></li>
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">Allemand B2</Link></li>
              <li><Link href="/cours" className="text-white/50 hover:text-white text-sm transition-colors">Préparation Goethe</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5 text-[#D4A843]">Navigation</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">Accueil</Link></li>
              <li><Link href="/processus" className="text-white/50 hover:text-white text-sm transition-colors">Notre Processus</Link></li>
              <li><Link href="/temoignages" className="text-white/50 hover:text-white text-sm transition-colors">Témoignages</Link></li>
              <li><Link href="/contact" className="text-white/50 hover:text-white text-sm transition-colors">Contact</Link></li>
              <li><Link href="/entrainement-ia" className="text-white/50 hover:text-white text-sm transition-colors">Entraînement IA</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-5 text-[#D4A843]">Suivez-nous</h4>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Restez informé de nos actualités, nouvelles sessions et offres spéciales.
            </p>
            <div className="flex gap-3">
              {[Globe, MessageCircle, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#D4A843] flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Deutsch-Institut. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="text-white/40 hover:text-white text-sm transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="text-white/40 hover:text-white text-sm transition-colors">Confidentialité</Link>
            <Link href="/cgv" className="text-white/40 hover:text-white text-sm transition-colors">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}