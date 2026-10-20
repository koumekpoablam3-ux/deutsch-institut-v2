// Dossier d'inscription : étapes, champs, documents et validation.
// Fichier "pur" (sans Prisma) : utilisable côté client et côté serveur.
import { z } from "zod"

export const APPLICATION_STATUSES = ["draft", "submitted", "needs_changes", "accepted", "rejected"] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Brouillon",
  submitted: "À vérifier",
  needs_changes: "Corrections demandées",
  accepted: "Accepté",
  rejected: "Refusé",
}

export const DOC_STATUSES = ["pending", "approved", "rejected"] as const
export type DocStatus = (typeof DOC_STATUSES)[number]

/** Étapes du parcours d'inscription (l'étape 1, la création du compte, est déjà faite quand le dossier s'ouvre). */
export const APPLICATION_STEPS = [
  { step: 1, title: "Compte" },
  { step: 2, title: "Informations personnelles" },
  { step: 3, title: "Projet et niveau" },
  { step: 4, title: "Documents" },
  { step: 5, title: "Vérification et envoi" },
] as const
export const FIRST_FORM_STEP = 2
export const LAST_STEP = 5

export const PATHWAYS = ["soins", "restauration", "etudes", "autre"] as const
export const PATHWAY_LABELS: Record<(typeof PATHWAYS)[number], string> = {
  soins: "Soins médicaux / santé",
  restauration: "Restauration / hôtellerie",
  etudes: "Études en Allemagne",
  autre: "Autre projet",
}

export const GERMAN_LEVELS = ["none", "A1", "A2", "B1", "B2"] as const
export const GERMAN_LEVEL_LABELS: Record<(typeof GERMAN_LEVELS)[number], string> = {
  none: "Aucun (je débute)", A1: "A1 - Débutant", A2: "A2 - Élémentaire", B1: "B1 - Intermédiaire", B2: "B2 - Intermédiaire supérieur",
}

export const EDUCATION_LEVELS = ["bac", "bac2", "licence", "master", "autre"] as const
export const EDUCATION_LABELS: Record<(typeof EDUCATION_LEVELS)[number], string> = {
  bac: "Baccalauréat", bac2: "Bac+2 (BTS / DUT)", licence: "Licence (Bac+3)", master: "Master ou plus", autre: "Autre",
}

// ───────────── Réglages modifiables par l'admin ─────────────
export interface AdmissionDocumentSpec { key: string; label: string; description: string; required: boolean }
export interface AdmissionSettings { required: boolean; intro: string; documents: AdmissionDocumentSpec[] }

export const DEFAULT_ADMISSION: AdmissionSettings = {
  required: true,
  intro: "Pour vous inscrire, complétez votre dossier en quelques étapes. Notre équipe vérifie chaque dossier avant de valider votre inscription.",
  documents: [
    { key: "identite", label: "Pièce d'identité ou passeport", description: "Document en cours de validité, recto-verso si carte d'identité.", required: true },
    { key: "photo", label: "Photo d'identité", description: "Fond clair, visage dégagé, récente.", required: true },
    { key: "diplome", label: "Dernier diplôme ou relevé de notes", description: "Copie lisible de votre dernier diplôme.", required: true },
    { key: "cv", label: "CV", description: "Votre parcours scolaire et professionnel.", required: false },
    { key: "motivation", label: "Lettre de motivation", description: "Expliquez votre projet en Allemagne.", required: false },
  ],
}

export const admissionSettingsSchema = z.object({
  required: z.boolean(),
  intro: z.string().trim().max(500),
  documents: z
    .array(
      z.object({
        key: z.string().trim().min(1).max(40).regex(/^[a-z0-9_-]+$/, "La clé d'un document ne peut contenir que des lettres minuscules, chiffres, - et _"),
        label: z.string().trim().min(1, "Chaque document doit avoir un nom").max(80),
        description: z.string().trim().max(200),
        required: z.boolean(),
      })
    )
    .max(12)
    .refine((docs) => new Set(docs.map((d) => d.key)).size === docs.length, "Deux documents ont la même clé"),
})

// ───────────── Informations saisies par l'étudiant ─────────────
const text = (max: number) => z.string().trim().max(max)

export const applicationDataSchema = z
  .object({
    birthDate: text(10),
    birthPlace: text(100),
    nationality: text(60),
    country: text(60),
    city: text(80),
    address: text(200),
    phone: text(40),
    pathway: z.enum(PATHWAYS),
    courseId: text(40),
    germanLevel: z.enum(GERMAN_LEVELS),
    education: z.enum(EDUCATION_LEVELS),
    profession: text(100),
    motivation: text(1500),
    emergencyName: text(100),
    emergencyPhone: text(40),
    consent: z.boolean(),
  })
  .partial()
export type ApplicationData = z.infer<typeof applicationDataSchema>

/** Date de naissance valide, dans le passé. */
export function isValidBirthDate(v: string | undefined): boolean {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const d = new Date(v + "T00:00:00Z")
  if (Number.isNaN(d.getTime())) return false
  const year = d.getUTCFullYear()
  return year >= 1930 && d.getTime() < Date.now()
}

/** Champs obligatoires de chaque étape, avec le message affiché s'ils manquent. */
export const REQUIRED_FIELDS: { step: 2 | 3; key: keyof ApplicationData; message: string }[] = [
  { step: 2, key: "birthDate", message: "La date de naissance est requise" },
  { step: 2, key: "nationality", message: "La nationalité est requise" },
  { step: 2, key: "country", message: "Le pays de résidence est requis" },
  { step: 2, key: "city", message: "La ville est requise" },
  { step: 2, key: "phone", message: "Le téléphone est requis" },
  { step: 3, key: "pathway", message: "Choisissez votre projet" },
  { step: 3, key: "germanLevel", message: "Indiquez votre niveau d'allemand" },
  { step: 3, key: "education", message: "Indiquez votre niveau d'études" },
  { step: 3, key: "motivation", message: "Expliquez votre motivation" },
]

/** Retourne la liste des problèmes d'un dossier (vide = complet). */
export function validateApplicationForSubmit(
  data: ApplicationData,
  uploadedTypes: string[],
  documents: AdmissionDocumentSpec[]
): string[] {
  const problems: string[] = []
  for (const f of REQUIRED_FIELDS) {
    const v = data[f.key]
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) problems.push(f.message)
  }
  if (data.birthDate && !isValidBirthDate(data.birthDate)) problems.push("La date de naissance est invalide")
  if (data.motivation && data.motivation.trim().length < 30) problems.push("Votre motivation doit contenir au moins 30 caractères")
  for (const d of documents) {
    if (d.required && !uploadedTypes.includes(d.key)) problems.push(`Document manquant : ${d.label}`)
  }
  if (data.consent !== true) problems.push("Vous devez certifier l'exactitude des informations")
  return problems
}

export const ALLOWED_DOC_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const
export const MAX_DOC_BYTES = 4 * 1024 * 1024
