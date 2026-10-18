"use client"

import { signOut } from "next-auth/react"
import { GraduationCap, LogOut, Menu, BookOpen, Mail, Users as UsersIcon, CreditCard, Star, Video, Newspaper, GalleryHorizontal, PenLine, ImageIcon, Phone, Languages } from "lucide-react"

export type AdminTab = "cours" | "messages" | "utilisateurs" | "paiements" | "avis" | "sessions" | "blog" | "carrousel" | "contenu" | "contact" | "traductions" | "medias"

type TabItem = { key: AdminTab; icon: typeof BookOpen; label: string }

// Le menu est regroupé par thème pour rester lisible malgré le nombre d'onglets
const tabGroups: { title: string; items: TabItem[] }[] = [
  {
    title: "Gestion",
    items: [
      { key: "cours", icon: BookOpen, label: "Cours" },
      { key: "utilisateurs", icon: UsersIcon, label: "Utilisateurs" },
      { key: "paiements", icon: CreditCard, label: "Paiements" },
      { key: "sessions", icon: Video, label: "Sessions live" },
    ],
  },
  {
    title: "Communication",
    items: [
      { key: "messages", icon: Mail, label: "Messages" },
      { key: "avis", icon: Star, label: "Avis" },
      { key: "blog", icon: Newspaper, label: "Blog" },
    ],
  },
  {
    title: "Site web",
    items: [
      { key: "carrousel", icon: GalleryHorizontal, label: "Carrousel" },
      { key: "contenu", icon: PenLine, label: "Contenu du site" },
      { key: "contact", icon: Phone, label: "Coordonnées" },
      { key: "traductions", icon: Languages, label: "Traductions" },
      { key: "medias", icon: ImageIcon, label: "Médiathèque" },
    ],
  },
]

const tabs: TabItem[] = tabGroups.flatMap((g) => g.items)

const tabTitles: Record<AdminTab, string> = {
  cours: "Gestion des cours",
  messages: "Messages de contact",
  utilisateurs: "Utilisateurs",
  paiements: "Paiements",
  avis: "Modération des avis",
  sessions: "Sessions en direct",
  blog: "Blog",
  carrousel: "Carrousel de la page d'accueil",
  contenu: "Contenu de la page d'accueil",
  contact: "Coordonnées, WhatsApp et réseaux sociaux",
  traductions: "Traductions (anglais et allemand)",
  medias: "Médiathèque",
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
      <div className={"fixed top-0 left-0 h-dvh w-64 bg-[#1B3A5C] text-white z-50 transition-transform lg:translate-x-0 flex flex-col " + (open ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-5 flex items-center gap-2.5 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#D4A843] flex items-center justify-center"><GraduationCap className="h-5 w-5 text-white" /></div>
          <div><p className="font-bold text-sm">Deutsch-Institut</p><p className="text-[10px] text-white/50">Panneau Admin</p></div>
        </div>

        {/* Menu : défile s'il dépasse la hauteur de l'écran */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
          {tabGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { onTabChange(item.key); onOpenChange(false) }}
                    className={"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left " + (activeTab === item.key ? "bg-[#D4A843]/20 text-[#D4A843] font-semibold" : "text-white/60 hover:text-white hover:bg-white/5")}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" /><span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Pied de menu toujours visible */}
        <div className="shrink-0 p-3 border-t border-white/10 space-y-0.5">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5">
            <GraduationCap className="h-[18px] w-[18px] shrink-0" />Retour au site
          </a>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full">
            <LogOut className="h-[18px] w-[18px] shrink-0" />Se déconnecter
          </button>
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

export { tabs, tabGroups, tabTitles }
