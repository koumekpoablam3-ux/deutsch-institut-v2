import type { Metadata } from "next"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente des cours d'allemand en ligne de Deutsch-Institut à Dakar, Sénégal.",
}

export default function CGVPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-8">Conditions générales de vente</h1>

          <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 shadow-sm space-y-8">
            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">1. Objet</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                Les présentes Conditions Générales de Vente (CGV) régissent les ventes de cours de langue allemande en ligne proposés par Deutsch-Institut, situé à Dakar, Sénégal. Toute inscription à un cours implique l'acceptation pleine et entière des présentes CGV.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">2. Inscription et prix</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                Les prix des cours sont indiqués en FCFA (Franc CFA) et incluent l'accès à la plateforme en ligne, le matériel pédagogique numérique et le suivi de progression. Les prix sont susceptibles de modification sans préavis ; toutefois, le tarif applicable est celui en vigueur au moment de l'inscription. L'inscription devient effective après réception du paiement intégral.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">3. Paiement</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                Le paiement s'effectue en ligne via les méthodes de paiement acceptées sur notre plateforme (paiement mobile, virement bancaire, carte bancaire). Deutsch-Institut se réserve le droit de suspendre l'accès aux cours en cas de paiement refusé ou non abouti. Les frais de transaction éventuels sont à la charge de l'étudiant.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">4. Rétractation et remboursement</h2>
              <div className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed space-y-2">
                <p>Conformément à la réglementation en vigueur, l'étudiant dispose d'un délai de rétractation de <strong className="text-[#1B3A5C] dark:text-white">14 jours calendaires</strong> à compter de l'inscription, sous réserve de ne pas avoir commencé à suivre le cours.</p>
                <p>Conditions de remboursement :</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Avant le début du cours et dans le délai de rétractation : remboursement intégral</li>
                  <li>Après le début du cours (moins de 25% du programme suivi) : remboursement de 50%</li>
                  <li>Après 25% du programme suivi : aucun remboursement</li>
                  <li>Les certificats et attestations déjà délivrés ne donnent lieu à aucun remboursement</li>
                </ul>
                <p>Les demandes de remboursement doivent être adressées par email à <a href="mailto:contact@deutsch-institut.com" className="text-[#D4A843] hover:underline font-medium">contact@deutsch-institut.com</a>. Le remboursement sera effectué sous 30 jours ouvrables.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">5. Accès aux cours</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                L'accès aux cours en ligne est personnel et non transférable. L'étudiant s'engage à ne pas partager ses identifiants de connexion avec des tiers. Toute utilisation abusive pourra entraîner la suspension immédiate du compte sans remboursement. L'accès à la plateforme est garanti 24h/24, sous réserve de maintenance planifiée ou de force majeure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">6. Propriété intellectuelle</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                L'ensemble des contenus pédagogiques (vidéos, textes, exercices, quiz, documents) mis à disposition sur la plateforme sont la propriété exclusive de Deutsch-Institut ou de ses partenaires. L'étudiant s'engage à ne pas reproduire, distribuer, vendre ou exploiter commercialement ces contenus, même partiellement, sans autorisation écrite préalable. Le certificat de formation délivré est un document nominatif et non transférable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">7. Responsabilité</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                Deutsch-Institut s'engage à fournir un enseignement de qualité. Cependant, l'Institut ne saurait être tenu responsable de l'échec aux examens de certification (Goethe-Zertifikat ou autres) dont la réussite dépend également du travail personnel de l'étudiant. Les sessions en direct sont soumises à disponibilité et peuvent être annulées ou reportées en cas de force majeure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-3">8. Litiges</h2>
              <p className="text-[#1B3A5C]/70 dark:text-white/60 text-sm leading-relaxed">
                En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action en justice. À défaut d'accord amiable, le tribunal compétent sera celui du ressort du siège social de Deutsch-Institut, à Dakar, Sénégal.
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