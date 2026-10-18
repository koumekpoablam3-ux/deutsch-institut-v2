import { getServerT } from "@/i18n/server"
import type { Metadata } from "next"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT()
  return {
    title: t("Politique de confidentialité"),
    description: t("Politique de confidentialité de Deutsch-Institut. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles."),
  }
}

export default async function ConfidentialitePage() {
  const { t } = await getServerT()
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-8">{t("Politique de confidentialité")}</h1>

          <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 shadow-sm space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("1. Introduction")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                {t("Deutsch-Institut (ci-après « nous », « notre » ou « l'Institut ») s'engage à protéger la vie privée de ses utilisateurs. La présente Politique de confidentialité explique comment nous collectons, utilisons, conservons et protégeons vos données personnelles lorsque vous utilisez notre site web (deutsch-institut.com) et nos services associés.")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("2. Données collectées")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mb-3">{t("Nous collectons les données suivantes :")}</p>
              <ul className="list-disc list-inside text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-1">
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Données d'inscription :")}</strong> {t("nom, prénom, adresse email, numéro de téléphone, niveau d'allemand")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Données de paiement :")}</strong> {t("informations de transaction (montant, date, statut) — aucun numéro de carte bancaire n'est stocké sur nos serveurs")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Données de navigation :")}</strong> {t("pages visitées, durée de visite, type de navigateur, adresse IP (collectées automatiquement par les cookies)")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Données de formation :")}</strong> {t("progression dans les cours, résultats aux tests, certificats obtenus")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Données de contact :")}</strong> {t("messages envoyés via le formulaire de contact")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("3. Utilisation des données")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mb-3">{t("Vos données sont utilisées pour :")}</p>
              <ul className="list-disc list-inside text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-1">
                <li>{t("Gérer votre inscription et votre parcours de formation")}</li>
                <li>{t("Vous fournir les services d'enseignement demandés")}</li>
                <li>{t("Émettre des certificats de formation")}</li>
                <li>{t("Vous envoyer des notifications relatives à votre compte (confirmations, rappels, résultats)")}</li>
                <li>{t("Améliorer nos services et notre contenu pédagogique")}</li>
                <li>{t("Répondre à vos demandes de contact")}</li>
                <li>{t("Respecter nos obligations légales et réglementaires")}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("4. Cookies")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                {t("Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers texte stockés sur votre appareil. Nous utilisons des cookies essentiels (nécessaires au fonctionnement du site), des cookies de session (pour maintenir votre connexion) et des cookies d'analyse (pour comprendre l'utilisation de notre site). Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("5. Services tiers")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mb-3">{t("Nous pouvons faire appel à des prestataires tiers :")}</p>
              <ul className="list-disc list-inside text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-1">
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Hébergement :")}</strong> {t("Vercel Inc. pour l'hébergement de notre application")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Authentification :")}</strong> {t("NextAuth.js pour la gestion des sessions")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Paiement :")}</strong> {t("services de paiement tiers sécurisés")}</li>
              </ul>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mt-3">
                {t("Ces prestataires sont soumis à des obligations contractuelles strictes quant à la protection de vos données.")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("6. Vos droits")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mb-3">
                {t("Conformément au RGPD et à la législation sénégalaise applicable, vous disposez des droits suivants :")}
              </p>
              <ul className="list-disc list-inside text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-1">
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Droit d'accès :")}</strong> {t("obtenir une copie de vos données personnelles")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Droit de rectification :")}</strong> {t("corriger des données inexactes")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Droit à l'effacement :")}</strong> {t("demander la suppression de vos données")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Droit à la portabilité :")}</strong> {t("recevoir vos données dans un format structuré")}</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">{t("Droit d'opposition :")}</strong> {t("vous opposer au traitement de vos données")}</li>
              </ul>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mt-3">
                {t("Pour exercer ces droits, contactez-nous à :")}{" "}<a href="mailto:contact@deutsch-institut.com" className="text-[#D4A843] hover:underline font-medium">{t("contact@deutsch-institut.com")}</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("7. Sécurité des données")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                {t("Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Les mots de passe sont stockés de manière sécurisée (hachage). Les échanges de données sont chiffrés via le protocole HTTPS.")}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">{t("8. Contact")}</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                {t("Pour toute question concernant la présente politique, veuillez nous contacter à")}{" "}<a href="mailto:contact@deutsch-institut.com" className="text-[#D4A843] hover:underline font-medium">{t("contact@deutsch-institut.com")}</a> {t("ou via notre")}{" "}<a href="/contact" className="text-[#D4A843] hover:underline">{t("formulaire de contact")}</a>.
              </p>
            </section>

            <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">{t("Dernière mise à jour : Janvier 2025")}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}