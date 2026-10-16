"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Props {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  max?: number
}

// Saisie d'une liste de mots : Entrée ou virgule pour ajouter, croix pour retirer
export default function TagInput({ label, values, onChange, placeholder, max = 20 }: Props) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const v = draft.trim().replace(/,$/, "").trim()
    if (v && !values.includes(v) && values.length < max) onChange([...values, v])
    setDraft("")
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-[#1B3A5C] dark:text-white/80">{label}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 bg-[#D4A843]/15 text-[#1B3A5C] dark:text-[#D4A843] text-xs font-medium rounded-full pl-3 pr-1.5 py-1">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="rounded-full hover:bg-black/10 p-0.5" aria-label={"Retirer " + v}><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <Input
        value={draft}
        placeholder={placeholder || "Écrire puis appuyer sur Entrée"}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add() } }}
        onBlur={add}
      />
    </div>
  )
}
