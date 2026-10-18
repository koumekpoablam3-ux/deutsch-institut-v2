// Ramène les anciens niveaux C1 / C2 à B2 dans la base (utilisateurs).
// Usage : npm run db:fix-levels
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.updateMany({ where: { niveau: { in: ["C1", "C2"] } }, data: { niveau: "B2" } })
  console.log(`Utilisateurs mis à jour (C1/C2 -> B2) : ${users.count}`)

  const courses = await prisma.course.count({ where: { level: { in: ["C1", "C2"] } } })
  if (courses > 0) {
    console.log(`Attention : ${courses} cours ont encore le niveau C1/C2. Modifiez-les ou supprimez-les dans l'admin (onglet Cours).`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
