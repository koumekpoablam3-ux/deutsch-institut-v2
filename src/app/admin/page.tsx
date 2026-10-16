"use client"

import React, { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AdminSidebar, AdminHeader, type AdminTab } from "./AdminTabs"
import CoursesTab from "./tabs/CoursesTab"
import UsersTab from "./tabs/UsersTab"
import MessagesTab from "./tabs/MessagesTab"
import ArticlesTab from "./tabs/ArticlesTab"
import ReviewsTab from "./tabs/ReviewsTab"
import SessionsTab from "./tabs/SessionsTab"
import PaymentsTab from "./tabs/PaymentsTab"

const tabComponents: Record<AdminTab, React.ComponentType> = {
  cours: CoursesTab,
  messages: MessagesTab,
  utilisateurs: UsersTab,
  paiements: PaymentsTab,
  avis: ReviewsTab,
  sessions: SessionsTab,
  blog: ArticlesTab,
}

const validTabs: AdminTab[] = ["cours", "messages", "utilisateurs", "paiements", "avis", "sessions", "blog"]

function AdminContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawTab = searchParams.get("tab") || "cours"
  const tab = validTabs.includes(rawTab as AdminTab) ? (rawTab as AdminTab) : "cours"
  const [open, setOpen] = React.useState(false)

  const handleTabChange = (newTab: AdminTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", newTab)
    router.push(`/admin?${params.toString()}`)
  }

  const ActiveTabComponent = tabComponents[tab]

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex">
      <AdminSidebar activeTab={tab} onTabChange={handleTabChange} open={open} onOpenChange={setOpen} />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8">
          <AdminHeader activeTab={tab} onOpenChange={setOpen} />
          <ActiveTabComponent />
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#D4A843] animate-spin" />
      </div>
    }>
      <AdminContent />
    </Suspense>
  )
}