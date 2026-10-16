"use client"

import { useEffect, useState } from "react"
import { DEFAULT_CONTACT, type ContactSettings } from "@/lib/site-content"

// Cache partagé entre tous les composants de la page (le pied de page apparaît sur presque toutes les pages)
let cache: ContactSettings | null = null
let inflight: Promise<ContactSettings> | null = null

function load(): Promise<ContactSettings> {
  if (!inflight) {
    inflight = fetch("/api/site-settings")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fetch failed"))))
      .then((d) => { cache = { ...DEFAULT_CONTACT, ...d.contact }; return cache as ContactSettings })
      .catch(() => { inflight = null; return DEFAULT_CONTACT })
  }
  return inflight
}

/** Coordonnées du site modifiables dans l'admin. Affiche les valeurs par défaut le temps du chargement. */
export function useContactSettings(): ContactSettings {
  const [contact, setContact] = useState<ContactSettings>(cache ?? DEFAULT_CONTACT)

  useEffect(() => {
    if (cache) return
    let active = true
    load().then((c) => { if (active) setContact(c) })
    return () => { active = false }
  }, [])

  return contact
}
