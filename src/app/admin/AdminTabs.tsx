"use client"

import { signOut } from "next-auth/react"
import { GraduationCap, LogOut, Menu, BookOpen, Mail, Users as UsersIcon, CreditCard, Star, Video, Newspaper } from "lucide-react"

export type AdminTab = "cours" | "messages" | "utilisateurs" | "paiements" | "avis" | "sessions" | "blog"

const tabs: { key: AdminTab; icon: typeof BookOpen; label: string }[] = [
  { key: "cours", icon: BookOpen, label: "Cours" },
  { key: "messages", icon: Mail, label: "Messages" },
  { key: "utilisateurs", icon: UsersIcon, label: "Utilisateurs" },
  { key: "paiements", icon: CreditCard, label: "Paiements" },
  { key: "avis", icon: Star, label: "Avis" },
  { key: "sessions", icon: Video, label: "Sessions live" },
  { key: "blog", icon: Newspaper, label: "Blog" },
]

const tabTitles: Record<AdminTab, string> = {
  cours: "Gestion des cours",
  messages: "Messages de contact",
  utilisateurs: "Utilisateurs",
  paiements: "Paiements",
  avis: "Modération des avis",
  sessions: "Sessions en direct",
  blog: "Blog",
}

interface AdminTabsProps {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSidebar({ activeTab, onTabChange, open, onOpenChange }: AdminTabsProps) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => onOpenChange(false)} />}
      <div className={"fixed top-0 left-0 h-full w-64 bg-[#1B3A5C] text-white z-50 transition-transform lg:translate-x-0 " + (open ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-5 flex items-center gap-2.5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-[#D4A843] flex items-center justify-center"><GraduationCap className="h-5 w-5 text-white" /></div>
          <div><p className="font-bold text-sm">Deutsch-Institut</p><p className="text-[10px] text-white/50">Panneau Admin</p></div>
        </div>
        <nav className="p-3 space-y-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => { onTabChange(item.key); onOpenChange(false) }}
              className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm " + (activeTab === item.key ? "bg-[#D4A843]/20 text-[#D4A843] font-semibold" : "text-white/60 hover:text-white hover:bg-white/5")}
            >
              <item.icon className="h-5 w-5" />{item.label}
            </button>
          ))}
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5">
            <GraduationCap className="h-5 w-5" />Retour au site
          </a>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full"><LogOut className="h-5 w-5" />Se déconnecter</button>
        </div>
      </div>
    </>
  )
}

export function AdminHeader({ activeTab, onOpenChange }: { activeTab: AdminTab; onOpenChange: (open: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={() => onOpenChange(true)} className="lg:hidden"><Menu className="h-6 w-6 text-[#1B3A5C] dark:text-white" /></button>
      <h1 className="text-xl font-bold text-[#1B3A5C] dark:text-white">{tabTitles[activeTab]}</h1>
    </div>
  )
}

export { tabs, tabTitles }
