import type { Metadata } from "next"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Deutsch-Institut. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles.",
}

export default function ConfidentialitePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-8">Politique de confidentialité</h1>

          <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 shadow-sm space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">1. Introduction</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                Deutsch-Institut (ci-après « nous », « notre » ou « l'Institut ») s'engage à protéger la vie privée de ses utilisateurs. La présente Politique de confidentialité explique comment nous collectons, utilisons, conservons et protégeons vos données personnelles lorsque vous utilisez notre site web (deutsch-institut.com) et nos services associés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">2. Données collectées</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mb-3">Nous collectons les données suivantes :</p>
              <ul className="list-disc list-inside text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-1">
                <li><strong className="text-[#1B3A5C] dark:text-white">Données d'inscription :</strong> nom, prénom, adresse email, numéro de téléphone, niveau d'allemand</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Données de paiement :</strong> informations de transaction (montant, date, statut) — aucun numéro de carte bancaire n'est stocké sur nos serveurs</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Données de navigation :</strong> pages visitées, durée de visite, type de navigateur, adresse IP (collectées automatiquement par les cookies)</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Données de formation :</strong> progression dans les cours, résultats aux tests, certificats obtenus</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Données de contact :</strong> messages envoyés via le formulaire de contact</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">3. Utilisation des données</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mb-3">Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-1">
                <li>Gérer votre inscription et votre parcours de formation</li>
                <li>Vous fournir les services d'enseignement demandés</li>
                <li>Émettre des certificats de formation</li>
                <li>Vous envoyer des notifications relatives à votre compte (confirmations, rappels, résultats)</li>
                <li>Améliorer nos services et notre contenu pédagogique</li>
                <li>Répondre à vos demandes de contact</li>
                <li>Respecter nos obligations légales et réglementaires</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">4. Cookies</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers texte stockés sur votre appareil. Nous utilisons des cookies essentiels (nécessaires au fonctionnement du site), des cookies de session (pour maintenir votre connexion) et des cookies d'analyse (pour comprendre l'utilisation de notre site). Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités du site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">5. Services tiers</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mb-3">Nous pouvons faire appel à des prestataires tiers :</p>
              <ul className="list-disc list-inside text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-1">
                <li><strong className="text-[#1B3A5C] dark:text-white">Hébergement :</strong> Vercel Inc. pour l'hébergement de notre application</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Authentification :</strong> NextAuth.js pour la gestion des sessions</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Paiement :</strong> services de paiement tiers sécurisés</li>
              </ul>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mt-3">
                Ces prestataires sont soumis à des obligations contractuelles strictes quant à la protection de vos données.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">6. Vos droits</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mb-3">
                Conformément au RGPD et à la législation sénégalaise applicable, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-1">
                <li><strong className="text-[#1B3A5C] dark:text-white">Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Droit de rectification :</strong> corriger des données inexactes</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong className="text-[#1B3A5C] dark:text-white">Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              </ul>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed mt-3">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@deutsch-institut.com" className="text-[#D4A843] hover:underline font-medium">contact@deutsch-institut.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">7. Sécurité des données</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, modification, divulgation ou destruction. Les mots de passe sont stockés de manière sécurisée (hachage). Les échanges de données sont chiffrés via le protocole HTTPS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">8. Contact</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                Pour toute question concernant la présente politique, veuillez nous contacter à <a href="mailto:contact@deutsch-institut.com" className="text-[#D4A843] hover:underline font-medium">contact@deutsch-institut.com</a> ou via notre <a href="/contact" className="text-[#D4A843] hover:underline">formulaire de contact</a>.
              </p>
            </section>

            <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30">Dernière mise à jour : Janvier 2025</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}