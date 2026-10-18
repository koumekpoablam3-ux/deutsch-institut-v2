// Niveaux proposés par l'institut : A1 à B2 uniquement.
export const LEVELS = ["A1", "A2", "B1", "B2"] as const
export type Level = (typeof LEVELS)[number]

/**
 * Ramène n'importe quelle valeur enregistrée en base à un niveau valide.
 * Les anciens profils C1/C2 (niveaux supprimés) sont traités comme B2 ; une valeur inconnue devient A1.
 */
export function normalizeLevel(value: string | null | undefined): Level {
  const v = (value || "").trim().toUpperCase()
  if ((LEVELS as readonly string[]).includes(v)) return v as Level
  if (v === "C1" || v === "C2") return "B2"
  return "A1"
}
