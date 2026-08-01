"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, CheckCircle, Phone, Mail, MapPin, Clock, MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import { toast } from "sonner"

const NIVEAUX = [
  { label: "Débutant (A1)", value: "A1" },
  { label: "Élémentaire (A2)", value: "A2" },
  { label: "Intermédiaire (B1)", value: "B1" },
  { label: "Avancé (B2)", value: "B2" },
  { label: "Je ne sais pas", value: "autre" },
]

const contactInfo = [
  { icon: Phone, label: "Téléphone", value: "+221 77 123 45 67", sub: "Lun - Ven, 8h - 18h" },
  { icon: Mail, label: "Email", value: "contact@deutsch-institut.com", sub: "Réponse sous 24h" },
  { icon: MapPin, label: "Adresse", value: "Dakar, Sénégal", sub: "Plateau, Rue 10" },
  { icon: Clock, label: "Horaires", value: "Lundi - Vendredi", sub: "8h00 - 18h00" },
  { icon: MessageCircle, label: "WhatsApp", value: "+221 77 123 45 67", sub: "Disponible 24h/24" },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ nom: "", prenom: "", email: "", telephone: "", niveau: "", message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.nom.trim()) e.nom = "Le nom est requis"
    if (!formData.prenom.trim()) e.prenom = "Le prénom est requis"
    if (!formData.email.trim()) e.email = "L'email est requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Email invalide"
    if (!formData.telephone.trim()) e.telephone = "Le téléphone est requis"
    if (!formData.message.trim()) e.message = "Le message est requis"
    else if (formData.message.trim().length < 10) e.message = "Le message doit contenir au moins 10 caractères"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSubmitted(true)
        toast.success("Message envoyé avec succès !")
      } else {
        toast.error(data.error || "Une erreur est survenue")
      }
    } catch {
      toast.error("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  return (
    <>
      <Header />
      <section className="relative pt-16">
        <div className="relative h-72 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A5C] via-[#1B3A5C] to-[#0f2a45]" />
          <div className="absolute top-10 left-20 w-72 h-72 rounded-full bg-[#D4A843]/10" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-[#D4A843]/20 text-[#D4A843] font-semibold text-sm px-4 py-1.5 rounded-full mb-4">Contact</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">Contactez-nous</h1>
              <p className="text-white/70 max-w-xl text-lg">Une question ? Besoin d'informations ? Notre équipe est à votre écoute.</p>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-extrabold text-[#1B3A5C] dark:text-white mb-2">Nos coordonnées</h2>
                <p className="text-[#1B3A5C]/60 dark:text-white/50 text-sm mb-8">N'hésitez pas à nous contacter par le moyen qui vous convient le mieux.</p>
              </motion.div>
              {contactInfo.map((info, i) => (
                <motion.div key={info.label} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-start gap-4 bg-white dark:bg-[#132d4a] rounded-xl p-4 shadow-sm">
                  <div className="w-11 h-11 rounded-lg bg-[#1B3A5C]/5 dark:bg-[#1B3A5C]/20 flex items-center justify-center shrink-0">
                    <info.icon className="h-5 w-5 text-[#D4A843]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 font-medium uppercase tracking-wide">{info.label}</p>
                    <p className="font-semibold text-sm text-[#1B3A5C] dark:text-white mt-0.5">{info.value}</p>
                    <p className="text-xs text-[#1B3A5C]/40 dark:text-white/30 mt-0.5">{info.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="lg:col-span-3">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white dark:bg-[#132d4a] rounded-2xl p-8 shadow-sm">
                {submitted ? (
                  <div className="text-center py-12">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#1B3A5C] dark:text-white mb-3">Message envoyé !</h3>
                    <p className="text-[#1B3A5C]/60 dark:text-white/50 mb-6">Merci pour votre message. Notre équipe vous recontactera sous 24 heures.</p>
                    <Button onClick={() => { setSubmitted(false); setFormData({ nom: "", prenom: "", email: "", telephone: "", niveau: "", message: "" }) }} variant="outline" className="border-[#1B3A5C] text-[#1B3A5C] dark:border-white/30 dark:text-white">Envoyer un autre message</Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-[#1B3A5C] dark:text-white mb-6">Envoyez-nous un message</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <Label className="text-[#1B3A5C] dark:text-white/80 text-sm font-medium mb-1.5 block">Nom *</Label>
                          <Input placeholder="Votre nom" value={formData.nom} onChange={(e) => handleChange("nom", e.target.value)} className={errors.nom ? "border-red-500 focus:border-red-500" : "border-[#1B3A5C]/20 focus:border-[#D4A843]"} />
                          {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                        </div>
                        <div>
                          <Label className="text-[#1B3A5C] dark:text-white/80 text-sm font-medium mb-1.5 block">Prénom *</Label>
                          <Input placeholder="Votre prénom" value={formData.prenom} onChange={(e) => handleChange("prenom", e.target.value)} className={errors.prenom ? "border-red-500 focus:border-red-500" : "border-[#1B3A5C]/20 focus:border-[#D4A843]"} />
                          {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <Label className="text-[#1B3A5C] dark:text-white/80 text-sm font-medium mb-1.5 block">Email *</Label>
                          <Input type="email" placeholder="votre@email.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={errors.email ? "border-red-500 focus:border-red-500" : "border-[#1B3A5C]/20 focus:border-[#D4A843]"} />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <Label className="text-[#1B3A5C] dark:text-white/80 text-sm font-medium mb-1.5 block">Téléphone *</Label>
                          <Input placeholder="+221 77 000 00 00" value={formData.telephone} onChange={(e) => handleChange("telephone", e.target.value)} className={errors.telephone ? "border-red-500 focus:border-red-500" : "border-[#1B3A5C]/20 focus:border-[#D4A843]"} />
                          {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                        </div>
                      </div>
                      <div>
                        <Label className="text-[#1B3A5C] dark:text-white/80 text-sm font-medium mb-1.5 block">Niveau d'allemand</Label>
                        <Select value={formData.niveau} onValueChange={(v) => handleChange("niveau", v ?? "")}>
                          <SelectTrigger className={"w-full h-11 border-[#1B3A5C]/20 focus:border-[#D4A843] " + (errors.niveau ? "border-red-500 focus:border-red-500" : "")}>
                            <SelectValue placeholder="Sélectionnez votre niveau" />
                          </SelectTrigger>
                          <SelectContent>
                            {NIVEAUX.map((niveau) => (
                              <SelectItem key={niveau.value} value={niveau.value}>
                                {niveau.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[#1B3A5C] dark:text-white/80 text-sm font-medium mb-1.5 block">Message *</Label>
                        <Textarea placeholder="Décrivez votre projet, posez vos questions..." rows={5} value={formData.message} onChange={(e) => handleChange("message", e.target.value)} className={errors.message ? "border-red-500 focus:border-red-500" : "border-[#1B3A5C]/20 focus:border-[#D4A843]"} />
                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                      </div>
                      <Button type="submit" disabled={submitting} className="w-full bg-[#D4A843] hover:bg-[#C49A3A] text-white font-bold h-12 text-base disabled:opacity-60">
                        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours...</> : <>Envoyer le message <Send className="ml-2 h-4 w-4" /></>}
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </div>
          <div className="mt-12 bg-white dark:bg-[#132d4a] rounded-2xl overflow-hidden shadow-sm">
            <div className="h-64 bg-[#1B3A5C]/5 dark:bg-[#1B3A5C]/20 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-[#D4A843] mx-auto mb-3" />
                <p className="text-[#1B3A5C] dark:text-white font-semibold">Deutsch-Institut</p>
                <p className="text-[#1B3A5C]/50 dark:text-white/40 text-sm">Plateau, Rue 10 - Dakar, Sénégal</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}