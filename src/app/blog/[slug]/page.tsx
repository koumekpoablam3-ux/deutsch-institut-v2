import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"
import React from "react"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ slug: string }>
}

function renderContent(content: string): React.ReactNode[] {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []
  let inList = false

  const closeList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={elements.length} className="list-disc pl-6 mb-4 space-y-2 text-[#1B3A5C]/75 dark:text-white/60">
          {listItems}
        </ul>
      )
    }
    listItems = []
    inList = false
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (inList) closeList()
      elements.push(
        <h2 key={elements.length} className="text-2xl font-bold mt-8 mb-4 text-[#1B3A5C] dark:text-white">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      if (inList) closeList()
      elements.push(
        <h3 key={elements.length} className="text-xl font-semibold mt-6 mb-3 text-[#1B3A5C] dark:text-white">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) inList = true
      const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      listItems.push(<li key={listItems.length} dangerouslySetInnerHTML={{ __html: text }} />)
    } else if (line.trim() === '') {
      if (inList) closeList()
    } else {
      if (inList) closeList()
      const text = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      elements.push(
        <p key={elements.length} className="mb-4 text-[#1B3A5C]/75 dark:text-white/60 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
      )
    }
  }
  if (inList) closeList()
  return elements
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params

  let article
  try {
    article = await db.article.findUnique({
      where: { slug },
      include: { author: { select: { name: true } } },
    })
  } catch {
    notFound()
  }

  if (!article || !article.published) {
    notFound()
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        {article.coverImage && (
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#1B3A5C]/60 dark:text-white/50 hover:text-[#1B3A5C] dark:hover:text-white text-sm mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour au blog
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A5C] dark:text-white mb-4">{article.title}</h1>

          <div className="flex items-center gap-4 text-xs text-[#1B3A5C]/40 dark:text-white/30 mb-8 pb-8 border-b border-[#1B3A5C]/10 dark:border-white/10">
            <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{article.author.name}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(article.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          <div className="prose prose-sm max-w-none">
            {renderContent(article.content)}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
