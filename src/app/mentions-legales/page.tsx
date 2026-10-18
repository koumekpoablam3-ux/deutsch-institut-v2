import { getServerT } from "@/i18n/server"
import type { Metadata } from "next"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT()
  return {
    title: t("Mentions légales"),
    description: t("Mentions légales du site Deutsch-Institut, institut de formation en langue allemande à Dakar, Sénégal."),
  }
}

export default async function MentionsLegalesPage() {
  const { t } = await getServerT()
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-8">{t("Mentions légales")}</h1>

          <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 shadow-sm space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("1. Éditeur du site")}</h2>
              <div className="text-[#1B3A5C]/70 dark:text-white/60 space-y-1 text-sm leading-relaxed">
                <p><strong className="text-[#1B3A5C] dark:text-white">{t("Raison sociale :")}</strong> {t("Deutsch-Institut")}</p>
                <p><strong className="text-[#1B3A5C] dark:text-white">{t("Forme juridique :")}</strong> {t("Société à responsabilité limitée (SARL)")}</p>
                <p><strong className="text-[#1B3A5C] dark:text-white">{t("Siège social :")}</strong> {t("Dakar, Sénégal")}</p>
                <p><strong className="text-[#1B3A5C] dark:text-white">{t("Téléphone :")}</strong> +221 77 123 45 67</p>
                <p><strong className="text-[#1B3A5C] dark:text-white">{t("Email :")}</strong> {t("contact@deutsch-institut.com")}</p>
                <p><strong className="text-[#1B3A5C] dark:text-white">{t("Directeur de la publication :")}</strong> {t("Le gérant de Deutsch-Institut")}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("2. Hébergement")}</h2>
              <div className="text-[#1B3A5C]/70 dark:text-white/60 space-y-1 text-sm leading-relaxed">
                <p>{t("Le site est hébergé par un prestataire d'hébergement professionnel assurant la disponibilité et la sécurité des données.")}</p>
                <p><strong className="text-[#1B3A5C] dark:text-white">{t("Hébergeur :")}</strong> {t("Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis")}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("3. Propriété intellectuelle")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                {t("L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels, etc.) est protégé par le droit d'auteur et le droit de la propriété intellectuelle. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de Deutsch-Institut. Le nom « Deutsch-Institut » et le logo associé sont la propriété exclusive de l'éditeur du site.")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("4. Responsabilité")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                {t("Deutsch-Institut s'efforce de fournir des informations aussi précises que possible sur le site. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations. Toutes les informations indiquées sur le site sont données à titre indicatif et sont susceptibles d'évoluer. Par ailleurs, les renseignements figurant sur le site ne sont pas exhaustifs. Ils sont donnés sous réserve de modifications ayant été apportées depuis leur mise en ligne.")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("5. Données personnelles (RGPD)")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                {t("Deutsch-Institut s'engage à respecter la confidentialité des données personnelles collectées sur ce site, conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi sénégalaise n° 2008-12 relative à la protection des données à caractère personnel. Pour plus d'informations sur la collecte, le traitement et la protection de vos données, veuillez consulter notre")}{" "}<a href="/confidentialite" className="text-[#D4A843] hover:underline font-medium">{t("Politique de confidentialité")}</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("6. Contact")}</h2>
              <div className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                <p>{t("Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :")}</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{t("Par email :")}{" "}<a href="mailto:contact@deutsch-institut.com" className="text-[#D4A843] hover:underline">{t("contact@deutsch-institut.com")}</a></li>
                  <li>{t("Par téléphone : +221 77 123 45 67")}</li>
                  <li>{t("Via notre")}{" "}<a href="/contact" className="text-[#D4A843] hover:underline">{t("formulaire de contact")}</a></li>
                </ul>
              </div>
            </section>

            <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{t("Dernière mise à jour : Janvier 2025")}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}