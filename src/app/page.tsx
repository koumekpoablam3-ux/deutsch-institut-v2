import HomeClient from "./HomeClient"
import { getHomeContent } from "@/lib/site-content-server"

// Le contenu de l'accueil (carrousel, chiffres, appel à l'action) vient de PostgreSQL :
// la page est rendue à chaque visite pour refléter immédiatement les modifications de l'admin.
export const dynamic = "force-dynamic"

export default async function Home() {
  const content = await getHomeContent()
  return <HomeClient content={content} />
}
