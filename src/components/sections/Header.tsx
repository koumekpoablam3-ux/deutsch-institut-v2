"use client"

import { useState, useSyncExternalStore, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, Sun, Moon, GraduationCap, User, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import NotificationBell from "@/components/NotificationBell"

const emptySub = () => () => {}

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Cours", href: "/cours" },
  { label: "Processus", href: "/processus" },
  { label: "Témoignages", href: "/temoignages" },
  { label: "Blog", href: "/blog" },
  { label: "Direct", href: "/direct" },
  { label: "Contact", href: "/contact" },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const scrolled = useSyncExternalStore(
    (cb) => { window.addEventListener("scroll", cb, { passive: true }); return () => window.removeEventListener("scroll", cb) },
    () => window.scrollY > 20,
    () => false
  )
  const mounted = useSyncExternalStore(emptySub, () => true, () => false)
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href)

  // Fermer le menu mobile sur changement de page
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header className={"fixed top-0 left-0 right-0 z-50 transition-all duration-300 " + (scrolled ? "bg-white/95 dark:bg-[#0a1628]/95 shadow-lg backdrop-blur-md" : "bg-white dark:bg-[#0a1628]" )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1B3A5C] flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-[#D4A843]" />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-sm text-[#1B3A5C] dark:text-white leading-tight">Deutsch-Institut</p>
              <p className="text-[10px] text-[#D4A843]">Deutsch Für Alle</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href}
                className={"px-3 py-2 rounded-lg text-sm font-medium transition-colors " + (isActive(link.href) ? "text-[#D4A843] font-bold" : "text-[#1B3A5C]/70 dark:text-white/60 hover:text-[#1B3A5C] dark:hover:text-white hover:bg-[#1B3A5C]/5")}
              >{link.label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-[#1B3A5C]/60 dark:text-white/60 hover:text-[#1B3A5C] dark:hover:text-white transition-colors">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            {status === "authenticated" && session?.user ? (
              <>
                <NotificationBell />
                {(session.user as { role?: string }).role === "admin" && (
                  <Link href="/admin" className="hidden md:block text-sm font-semibold text-[#D4A843] hover:text-[#C49A3A]">Admin</Link>
                )}
                <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#1B3A5C]/70 dark:text-white/60 hover:text-[#1B3A5C] dark:hover:text-white">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{session.user.name}</span>
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden md:block text-sm font-medium text-[#1B3A5C]/70 dark:text-white/60 hover:text-red-500 transition-colors" title="Se déconnecter">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link href="/login" className="hidden md:block text-sm font-medium text-[#1B3A5C]/70 dark:text-white/60 hover:text-[#1B3A5C] dark:hover:text-white">Se connecter</Link>
            )}
            <button className="lg:hidden text-[#1B3A5C] dark:text-white" onClick={() => setOpen(!open)}>
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white dark:bg-[#0a1628] border-t border-[#1B3A5C]/10">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                  className={"block px-4 py-2.5 rounded-lg text-sm font-medium " + (isActive(link.href) ? "text-[#D4A843] bg-[#D4A843]/10" : "text-[#1B3A5C]/70 dark:text-white/60")}
                >{link.label}</Link>
              ))}
              {status === "authenticated" && session?.user ? (
                <>
                  {(session.user as { role?: string }).role === "admin" && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-[#D4A843]">Panneau Admin</Link>
                  )}
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-[#D4A843]">Tableau de bord ({session.user.name?.split(" ")[0]})</Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-500">Se déconnecter</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-[#D4A843]">Se connecter</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
