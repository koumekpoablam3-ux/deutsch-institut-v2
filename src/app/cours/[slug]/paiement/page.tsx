"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { CreditCard, Loader2, ShieldCheck, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  price: string
  image: string
  level: string
}

export default function PaiementPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)

  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  const formatCardNumber = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    const parts = digits.match(/.{1,4}/g)
    return parts ? parts.join(" ") : ""
  }, [])

  const formatExpiry = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4)
    if (digits.length >= 3) {
      return digits.slice(0, 2) + "/" + digits.slice(2)
    }
    return digits
  }, [])

  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
  }, [formatCardNumber])

  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    setCardExpiry(formatted)
  }, [formatExpiry])

  useEffect(() => {
    (async () => {
      try {
        const sessionRes = await fetch("/api/auth/session")
        const session = await sessionRes.json()
        if (!session?.user) { router.push("/login"); return }

        const res = await fetch(`/api/courses/${slug}`)
        const data = await res.json()
        if (res.ok) setCourse(data.data?.course)
        else toast.error("Cours introuvable")
      } catch { toast.error("Erreur de connexion") }
      finally { setLoading(false) }
    })()
  }, [slug, router])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return
    setPaying(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push("/dashboard"), 2000)
      } else {
        toast.error(data.error || "Erreur lors du paiement")
      }
    } catch { toast.error("Erreur de connexion") }
    finally { setPaying(false) }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-16 flex items-center justify-center bg-[#f8f9fb] dark:bg-[#050d1a]">
          <Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" />
        </div>
        <Footer />
      </>
    )
  }

  if (!course) return null

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a] py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-400">
              Paiement de démonstration — Aucune transaction réelle ne sera effectuée
            </p>
          </div>

          <div className="bg-white dark:bg-[#132d4a] rounded-2xl shadow-sm p-6 lg:p-8">
            {success ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-[#1B3A5C] dark:text-white">Paiement validé !</h2>
                <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50">Vous êtes inscrit à &quot;{course.title}&quot;. Redirection vers votre tableau de bord...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#1B3A5C]/10 dark:border-white/10">
                  <div>
                    <p className="text-xs text-[#1B3A5C]/50 dark:text-white/40">Vous vous inscrivez à</p>
                    <p className="font-bold text-[#1B3A5C] dark:text-white">{course.title}</p>
                  </div>
                  <p className="text-2xl font-extrabold text-[#D4A843]">{course.price}</p>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                  <div>
                    <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Nom sur la carte</Label>
                    <Input required value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Jean Dupont" className="h-11" />
                  </div>
                  <div>
                    <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Numéro de carte</Label>
                    <div className="relative">
                      <Input required value={cardNumber} onChange={handleCardNumberChange} placeholder="4242 4242 4242 4242" maxLength={19} className="h-11 pl-10" />
                      <CreditCard className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1B3A5C]/40" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">Expiration</Label>
                      <Input required value={cardExpiry} onChange={handleExpiryChange} placeholder="MM/AA" maxLength={5} className="h-11" />
                    </div>
                    <div>
                      <Label className="text-[#1B3A5C] dark:text-white/80 font-medium mb-1.5 block">CVC</Label>
                      <Input required value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" maxLength={3} className="h-11" />
                    </div>
                  </div>

                  <Button type="submit" disabled={paying} className="w-full bg-[#1B3A5C] hover:bg-[#0f2a45] text-white font-bold h-12 mt-2">
                    {paying ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Traitement...</span> : `Payer ${course.price}`}
                  </Button>
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#1B3A5C]/40 dark:text-white/30">
                    <ShieldCheck className="h-3.5 w-3.5" /> Paiement simulé — aucune donnée réelle transmise
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}