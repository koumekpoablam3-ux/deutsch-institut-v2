// Types, valeurs par défaut et schémas de validation du contenu éditable de
// l'accueil. Ce fichier est "pur" (aucun import Prisma) : il peut donc être
// utilisé aussi bien côté client que côté serveur.
import { z } from "zod"
import { admissionSettingsSchema, DEFAULT_ADMISSION, type AdmissionSettings } from "@/lib/admission"

// ───────────── Types ─────────────
export interface HeroSlideData {
  id: string
  position: number
  active: boolean
  image: string
  overlay: number
  title: string
  highlight: string
  subtitle: string
  badge: string | null
  pills: string[]
  tags: string[]
  tagsTitle: string | null
  partnerName: string | null
  partnerLogo: string | null
  partnerText: string | null
  showButtons: boolean
  primaryLabel: string | null
  primaryHref: string | null
  secondaryLabel: string | null
  secondaryHref: string | null
}

export interface HeroSettings {
  intervalSeconds: number
  autoplay: boolean
  showArrows: boolean
  showDots: boolean
  badgeEnabled: boolean
  badgeText: string
}

export interface StatItem { value: string; label: string }
export interface StatsSettings { enabled: boolean; items: StatItem[] }

export interface CtaSettings {
  title: string
  text: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

export const FEATURE_ICONS = ["award", "plane", "home", "users", "book", "globe", "star", "graduation"] as const
export type FeatureIcon = (typeof FEATURE_ICONS)[number]
export const FEATURE_ICON_LABELS: Record<FeatureIcon, string> = {
  award: "Certification", plane: "Voyage / visa", home: "Logement", users: "Équipe / tuteurs",
  book: "Cours", globe: "Monde", star: "Étoile", graduation: "Diplôme",
}

export interface FeatureItem { icon: FeatureIcon; title: string; description: string; image: string }
export interface FeaturesSettings { eyebrow: string; title: string; subtitle: string; items: FeatureItem[] }

export interface TestimonialItem { name: string; level: string; stars: number; text: string }
export interface TestimonialsSettings { items: TestimonialItem[] }

export interface SocialLink { label: string; url: string }
export interface ContactSettings {
  siteName: string
  tagline: string
  footerText: string
  phone: string
  phoneNote: string
  email: string
  emailNote: string
  city: string
  addressDetail: string
  hoursDays: string
  hoursTime: string
  whatsappNumber: string
  whatsappDisplay: string
  socialText: string
  socials: SocialLink[]
}

export interface HomeContent {
  slides: HeroSlideData[]
  hero: HeroSettings
  stats: StatsSettings
  cta: CtaSettings
  features: FeaturesSettings
  testimonials: TestimonialsSettings
}

export type SettingKey = "hero" | "stats" | "cta" | "features" | "testimonials" | "contact" | "admission"

// ───────────── Valeurs par défaut ─────────────
export const DEFAULT_BUTTONS = {
  primaryLabel: "Voir les cours",
  primaryHref: "/cours",
  secondaryLabel: "Prendre rendez-vous",
  secondaryHref: "/contact",
}

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  intervalSeconds: 10,
  autoplay: true,
  showArrows: true,
  showDots: true,
  badgeEnabled: true,
  badgeText: "Inscriptions ouvertes",
}

export const DEFAULT_STATS: StatsSettings = {
  enabled: true,
  items: [
    { value: "500+", label: "Étudiants formés" },
    { value: "98%", label: "Taux de réussite" },
    { value: "15+", label: "Années d'expérience" },
    { value: "4.9/5", label: "Note moyenne" },
  ],
}

export const DEFAULT_CTA: CtaSettings = {
  title: "Prêt pour la prochaine étape ?",
  text: "Rejoignez plus de 500 étudiants. Essai gratuit de 7 jours, sans engagement.",
  primaryLabel: "S'inscrire maintenant",
  primaryHref: "/contact",
  secondaryLabel: "Découvrir le processus",
  secondaryHref: "/processus",
}

export const DEFAULT_FEATURES: FeaturesSettings = {
  eyebrow: "Pourquoi nous choisir",
  title: "Une formation complète et certifiée",
  subtitle: "Plus qu'un simple cours de langue : un accompagnement global pour votre projet de vie en Allemagne.",
  items: [
    { icon: "award", title: "Cours Certifiés A1 - B2", image: "/images/features/certification.jpg", description: "Programme aligné sur le Cadre Européen Commun de Référence. Préparation complète aux examens Goethe-Zertifikat avec un taux de réussite de 98%. Nos instructeurs certifiés vous accompagnent à chaque niveau avec des méthodes pédagogiques éprouvées." },
    { icon: "plane", title: "Accompagnement Visa", image: "/images/features/visa.jpg", description: "Assistance complète pour vos démarches administratives : dossier visa étudiant, lettres de motivation, justificatifs d'inscription. Notre équipe juridique partenaire vous guide de la constitution du dossier jusqu'à l'obtention du visa." },
    { icon: "home", title: "Hébergement & Intégration", image: "/images/features/hebergement.jpg", description: "Recherche de logement adapté à votre budget en Allemagne : résidence étudiante, colocation ou famille d'accueil. Programme d'intégration culturelle incluant visites guidées, événements communautaires et ateliers de vie quotidienne." },
    { icon: "users", title: "Tuteurs Bilingues", image: "/images/features/tuteurs.jpg", description: "Professeurs natifs allemands parlant couramment le français. Sessions individuelles de tutorat, groupes de conversation hebdomadaires et pratique immersive. Un accompagnement personnalisé pour progresser rapidement et avec confiance." },
  ],
}

export const DEFAULT_TESTIMONIALS: TestimonialsSettings = {
  items: [
    { name: "Maria P.", level: "Étudiante B1", stars: 5, text: "Grâce à Deutsch-Institut, j'ai progressé plus en 3 mois qu'en un an d'apprentissage classique. Les cours sont bien structurés et les professeurs sont très disponibles." },
    { name: "Ahmed B.", level: "Étudiant B1", stars: 5, text: "J'ai obtenu mon Goethe B1 du premier coup. La méthode pédagogique est vraiment efficace et l'accompagnement visa m'a permis de rejoindre l'Allemagne en 6 mois." },
    { name: "Sofia L.", level: "Étudiante A2", stars: 5, text: "En tant que débutante, j'étais inquiète. Mais la plateforme est si bien faite que j'ai pris confiance dès les premières semaines. Je recommande vivement." },
  ],
}

export const DEFAULT_CONTACT: ContactSettings = {
  siteName: "Deutsch-Institut",
  tagline: "Deutsch Für Alle",
  footerText: "Institut de formation en langue allemande. Cours certifiés de A1 à B2, préparation aux examens Goethe, accompagnement visa et hébergement.",
  phone: "+221 77 123 45 67",
  phoneNote: "Lun - Ven, 8h - 18h",
  email: "contact@deutsch-institut.com",
  emailNote: "Réponse sous 24h",
  city: "Dakar, Sénégal",
  addressDetail: "Plateau, Rue 10",
  hoursDays: "Lundi - Vendredi",
  hoursTime: "8h00 - 18h00",
  whatsappNumber: "22893839645",
  whatsappDisplay: "+228 93 83 96 45",
  socialText: "Restez informé de nos actualités, nouvelles sessions et offres spéciales.",
  socials: [],
}

type SlideDefault = Omit<HeroSlideData, "id" | "position">

const blank: Omit<SlideDefault, "image" | "title"> = {
  active: true, overlay: 100, highlight: "", subtitle: "", badge: null, pills: [], tags: [], tagsTitle: null,
  partnerName: null, partnerLogo: null, partnerText: null, showButtons: true,
  primaryLabel: null, primaryHref: null, secondaryLabel: null, secondaryHref: null,
}

/** Slides utilisés tant que l'admin n'en a créé aucun (= contenu validé par le client). */
export const DEFAULT_SLIDES: SlideDefault[] = [
  {
    ...blank,
    image: "/images/hero/hero-1.jpg",
    title: "L'allemand appliqué aux",
    highlight: "soins médicaux et à la restauration",
    subtitle: "Des formations spécialisées pour exercer votre métier en Allemagne, en présentiel ou en ligne.",
    pills: ["En présentiel", "En ligne"],
    tagsTitle: "Nos centres sont présents au :",
    tags: ["Togo", "Bénin", "Gabon", "Côte d'Ivoire", "Cameroun", "Sénégal"],
  },
  {
    ...blank,
    image: "/images/hero/hero-2.jpg",
    title: "Voyagez pour seulement",
    highlight: "850 000 FCFA",
    subtitle: "Puis payez 100 € par mois pendant 33 mois, une fois arrivé en Allemagne.",
  },
  {
    ...blank,
    image: "/images/hero/hero-3.jpg",
    title: "Notre partenaire",
    highlight: "en Allemagne",
    partnerName: "Partenaire en Allemagne",
    partnerLogo: "/images/partner/partenaire-logo.svg",
    partnerText: "Présentation du partenaire en Allemagne : activité, engagements et accompagnement des candidats à leur arrivée.",
  },
]

export function withDefaultIds(slides: SlideDefault[]): HeroSlideData[] {
  return slides.map((s, i) => ({ ...s, id: `default-${i}`, position: i }))
}

// ───────────── Validation (zod) ─────────────
const isSafeUrl = (v: string) => (v.startsWith("/") && !v.startsWith("//")) || /^https?:\/\//i.test(v)

const urlField = z.string().trim().min(1, "L'image est requise").max(500).refine(isSafeUrl, "Lien invalide (doit commencer par / ou https://)")
const optUrl = z
  .string().trim().max(500)
  .refine((v) => v === "" || isSafeUrl(v), "Lien invalide (doit commencer par / ou https://)")
  .nullable().optional()
const optText = (max: number) => z.string().trim().max(max).nullable().optional()
const stringList = (maxItems: number, maxLen: number) =>
  z.array(z.string().trim().min(1).max(maxLen)).max(maxItems)

export const slideSchema = z.object({
  active: z.boolean().default(true),
  image: urlField,
  overlay: z.number().int().min(0).max(100).default(100),
  title: z.string().trim().min(1, "Le titre est requis").max(120),
  highlight: z.string().trim().max(120).default(""),
  subtitle: z.string().trim().max(400).default(""),
  badge: optText(80),
  pills: stringList(8, 40).default([]),
  tags: stringList(20, 40).default([]),
  tagsTitle: optText(120),
  partnerName: optText(120),
  partnerLogo: optUrl,
  partnerText: optText(600),
  showButtons: z.boolean().default(true),
  primaryLabel: optText(40),
  primaryHref: optUrl,
  secondaryLabel: optText(40),
  secondaryHref: optUrl,
})
export const slideUpdateSchema = slideSchema.partial()

export const heroSettingsSchema = z.object({
  intervalSeconds: z.number().int().min(3, "Minimum 3 secondes").max(60, "Maximum 60 secondes"),
  autoplay: z.boolean(),
  showArrows: z.boolean(),
  showDots: z.boolean(),
  badgeEnabled: z.boolean(),
  badgeText: z.string().trim().max(80),
})

export const statsSettingsSchema = z.object({
  enabled: z.boolean(),
  items: z.array(z.object({ value: z.string().trim().min(1, "Valeur requise").max(20), label: z.string().trim().min(1, "Libellé requis").max(60) })).max(8),
})

export const ctaSettingsSchema = z.object({
  title: z.string().trim().min(1, "Le titre est requis").max(120),
  text: z.string().trim().max(300),
  primaryLabel: z.string().trim().min(1).max(40),
  primaryHref: z.string().trim().min(1).max(500).refine(isSafeUrl, "Lien invalide"),
  secondaryLabel: z.string().trim().max(40),
  secondaryHref: z.string().trim().max(500).refine((v) => v === "" || isSafeUrl(v), "Lien invalide"),
})

export const featuresSettingsSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().min(1, "Le titre est requis").max(120),
  subtitle: z.string().trim().max(300),
  items: z.array(z.object({
    icon: z.enum(FEATURE_ICONS),
    title: z.string().trim().min(1, "Chaque carte doit avoir un titre").max(80),
    description: z.string().trim().min(1, "Chaque carte doit avoir une description").max(500),
    image: urlField,
  })).max(8),
})

export const testimonialsSettingsSchema = z.object({
  items: z.array(z.object({
    name: z.string().trim().min(1, "Le nom est requis").max(60),
    level: z.string().trim().max(60),
    stars: z.number().int().min(1).max(5),
    text: z.string().trim().min(1, "Le témoignage est requis").max(500),
  })).max(9),
})

const shortText = (max: number) => z.string().trim().max(max)

export const contactSettingsSchema = z.object({
  siteName: shortText(60).min(1, "Le nom du site est requis"),
  tagline: shortText(80),
  footerText: shortText(400),
  phone: shortText(40),
  phoneNote: shortText(60),
  email: z.string().trim().max(120).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email invalide"),
  emailNote: shortText(60),
  city: shortText(80),
  addressDetail: shortText(80),
  hoursDays: shortText(60),
  hoursTime: shortText(60),
  whatsappNumber: z.string().trim()
    .transform((v) => v.replace(/[\s+().-]/g, ""))
    .refine((v) => /^\d{6,15}$/.test(v), "Numéro WhatsApp invalide (chiffres uniquement, avec l'indicatif pays, ex. 22893839645)"),
  whatsappDisplay: shortText(40),
  socialText: shortText(200),
  socials: z.array(z.object({
    label: z.string().trim().min(1, "Chaque réseau doit avoir un nom").max(30),
    url: z.string().trim().min(1).max(500).refine((v) => /^https?:\/\//i.test(v), "Le lien d'un réseau social doit commencer par https://"),
  })).max(6),
})

export const settingSchemas = {
  hero: heroSettingsSchema,
  stats: statsSettingsSchema,
  cta: ctaSettingsSchema,
  features: featuresSettingsSchema,
  testimonials: testimonialsSettingsSchema,
  contact: contactSettingsSchema,
  admission: admissionSettingsSchema,
} as const

export const settingDefaults = {
  hero: DEFAULT_HERO_SETTINGS,
  stats: DEFAULT_STATS,
  cta: DEFAULT_CTA,
  features: DEFAULT_FEATURES,
  testimonials: DEFAULT_TESTIMONIALS,
  contact: DEFAULT_CONTACT,
  admission: DEFAULT_ADMISSION,
} as const

export const SETTING_KEYS = ["hero", "stats", "cta", "features", "testimonials", "contact", "admission"] as const
export type { AdmissionSettings }

/** Convertit "" en null pour les champs optionnels avant écriture en base. */
export function emptyToNull<T extends Record<string, unknown>>(data: T, keys: (keyof T)[]): T {
  const out = { ...data }
  for (const k of keys) {
    const v = out[k]
    if (typeof v === "string" && v.trim() === "") (out as Record<string, unknown>)[k as string] = null
  }
  return out
}
