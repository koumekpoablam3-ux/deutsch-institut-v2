import { db } from "@/lib/db"
import Link from "next/link"
import Image from "next/image"
import { Newspaper, Calendar } from "lucide-react"
import Header from "@/components/sections/Header"
import Footer from "@/components/sections/Footer"

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  let articles: Awaited<ReturnType<typeof db.article.findMany>> = []
  try {
    articles = await db.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    })
  } catch { /* db pas encore migrée */ }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 text-[#D4A843] text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Newspaper className="h-3.5 w-3.5" /> Blog
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A5C] dark:text-white mb-3">Actualités & conseils</h1>
            <p className="text-[#1B3A5C]/60 dark:text-white/50 max-w-xl mx-auto">
              Astuces pour apprendre l&apos;allemand, actualités de l&apos;institut et retours d&apos;expérience.
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-12 text-center text-[#1B3A5C]/50 dark:text-white/40">
              Aucun article publié pour le moment.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link key={a.id} href={`/blog/${a.slug}`} className="bg-white dark:bg-[#132d4a] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  {a.coverImage && (
                    <div className="relative h-40 overflow-hidden">
                      <Image src={a.coverImage} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="flex items-center gap-1.5 text-[11px] text-[#1B3A5C]/40 dark:text-white/30 mb-2">
                      <Calendar className="h-3 w-3" />{new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h2 className="font-bold text-[#1B3A5C] dark:text-white mb-2 group-hover:text-[#D4A843] transition-colors">{a.title}</h2>
                    <p className="text-sm text-[#1B3A5C]/60 dark:text-white/50 line-clamp-3">{a.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
