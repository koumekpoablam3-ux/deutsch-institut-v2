import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data — delete in reverse dependency order to avoid FK errors
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create demo users
  const marc = await prisma.user.create({
    data: {
      name: "Marc Diallo",
      email: "marc@exemple.com",
      password: hashedPassword,
      telephone: "+221 77 123 45 67",
      niveau: "B1",
      role: "student",
    },
  });

  const sophie = await prisma.user.create({
    data: {
      name: "Sophie Martin",
      email: "sophie@exemple.com",
      password: hashedPassword,
      telephone: "+33 6 12 34 56 78",
      niveau: "A2",
      role: "student",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin Institut",
      email: "admin@deutsch-institut.com",
      password: hashedPassword,
      telephone: "+33 1 23 45 67 89",
      niveau: "C1",
      role: "admin",
    },
  });

  // Extra students for reviews
  const amadou = await prisma.user.create({
    data: {
      name: "Amadou Sow",
      email: "amadou@exemple.com",
      password: hashedPassword,
      telephone: "+221 76 234 56 78",
      niveau: "B2",
      role: "student",
    },
  });

  const aminata = await prisma.user.create({
    data: {
      name: "Aminata Fall",
      email: "aminata@exemple.com",
      password: hashedPassword,
      telephone: "+221 78 345 67 89",
      niveau: "A1",
      role: "student",
    },
  });

  console.log("✅ Created 5 demo users");

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: "Allemand Débutant A1",
        slug: "allemand-debutant-a1",
        level: "A1",
        lessons: 24,
        duration: "3 mois",
        price: "150 000 FCFA",
        badge: "Populaire",
        badgeColor: "bg-emerald-500",
        image: "/images/cours/levels.jpg",
        description:
          "Commencez votre apprentissage de l'allemand avec notre cours pour débutants absolus. Apprenez les bases de la grammaire, le vocabulaire essentiel et les expressions courantes de la vie quotidienne.",
        objectives:
          "Maîtriser les salutations et présentations, compter et épeler, demander et donner des informations simples, utiliser les verbes de base au présent, comprendre des textes très simples.",
        prerequisites: "Aucun prérequis. Ce cours est conçu pour les débutants absolus.",
      },
    }),
    prisma.course.create({
      data: {
        title: "Allemand Élémentaire A2",
        slug: "allemand-elementaire-a2",
        level: "A2",
        lessons: 30,
        duration: "4 mois",
        price: "180 000 FCFA",
        badge: "Recommandé",
        badgeColor: "bg-blue-500",
        image: "/images/cours/levels.jpg",
        description:
          "Renforcez vos bases en allemand avec ce cours élémentaire. Développez votre capacité à communiquer dans des situations familières et apprenez à exprimer vos opinions.",
        objectives:
          "Communiquer dans des situations simples et courantes, décrire son environnement et ses activités, raconter des événements passés récents, comprendre des annonces et messages simples.",
        prerequisites: "Niveau A1 ou équivalent. Connaître les bases de la grammaire allemande.",
      },
    }),
    prisma.course.create({
      data: {
        title: "Allemand Intermédiaire B1",
        slug: "allemand-intermediaire-b1",
        level: "B1",
        lessons: 36,
        duration: "5 mois",
        price: "220 000 FCFA",
        badge: null,
        badgeColor: null,
        image: "/images/cours/success.jpg",
        description:
          "Atteignez un niveau intermédiaire en allemand. Ce cours vous permettra de vous exprimer de manière plus fluide et de comprendre des textes plus complexes.",
        objectives:
          "S'exprimer clairement sur des sujets familiers, voyager et se débrouiller en situation de séjour, raconter des expériences et décrire des événements, comprendre la plupart des articles de journaux.",
        prerequisites: "Niveau A2 ou équivalent. Pouvoir communiquer dans des situations simples.",
      },
    }),
    prisma.course.create({
      data: {
        title: "Allemand Intermédiaire Supérieur B2",
        slug: "allemand-intermediaire-superieur-b2",
        level: "B2",
        lessons: 40,
        duration: "6 mois",
        price: "280 000 FCFA",
        badge: null,
        badgeColor: null,
        image: "/images/cours/success.jpg",
        description:
          "Développez une compétence avancée en allemand. Ce cours vous prépare à interagir avec des locuteurs natifs de manière naturelle et spontanée.",
        objectives:
          "Comprendre les idées principales de textes complexes, interagir avec une certaine fluidité et spontanéité, s'exprimer clairement et en détail sur un large éventail de sujets, comprendre la plupart des films et émissions.",
        prerequisites: "Niveau B1 ou équivalent. Pouvoir s'exprimer sur des sujets familiers.",
      },
    }),
    prisma.course.create({
      data: {
        title: "Allemand Avancé C1",
        slug: "allemand-avance-c1",
        level: "C1",
        lessons: 45,
        duration: "7 mois",
        price: "350 000 FCFA",
        badge: "Premium",
        badgeColor: "bg-amber-500",
        image: "/images/cours/exam.jpg",
        description:
          "Maîtrisez l'allemand à un niveau avancé. Ce cours vous permet de comprendre une grande variété de textes longs et exigeants et de vous exprimer de façon fluide.",
        objectives:
          "Comprendre des textes longs et exigeants, s'exprimer de façon fluide et spontanée, utiliser la langue de manière flexible et efficace, rédiger des textes bien structurés sur des sujets complexes.",
        prerequisites: "Niveau B2 ou équivalent. Bonne maîtrise de la grammaire allemande.",
      },
    }),
    prisma.course.create({
      data: {
        title: "Préparation TestDaF / Goethe-Zertifikat B2",
        slug: "preparation-testdaf-goethe-b2",
        level: "B2",
        lessons: 50,
        duration: "4 mois",
        price: "300 000 FCFA",
        badge: "Certification",
        badgeColor: "bg-rose-500",
        image: "/images/cours/exam.jpg",
        description:
          "Préparez-vous spécifiquement aux examens TestDaF et Goethe-Zertifikat B2. Ce cours intensif couvre toutes les compétences testées : compréhension écrite, compréhension orale, expression écrite et expression orale.",
        objectives:
          "Maîtriser le format de l'examen, développer des stratégies pour chaque section, pratiquer avec des examens blancs, atteindre le score requis pour l'admission dans les universités allemandes.",
        prerequisites: "Niveau B2 recommandé. Expérience préalable avec la grammaire avancée allemande.",
      },
    }),
    prisma.course.create({
      data: {
        title: "Allemand des Affaires B2-C1",
        slug: "allemand-des-affaires-b2-c1",
        level: "B2",
        lessons: 35,
        duration: "4 mois",
        price: "320 000 FCFA",
        badge: "Professionnel",
        badgeColor: "bg-slate-700",
        image: "/images/cours/success.jpg",
        description:
          "Apprenez l'allemand des affaires pour réussir dans un environnement professionnel germanophone. Maîtrisez le vocabulaire commercial, la correspondance professionnelle et la communication en réunion.",
        objectives:
          "Rédiger des emails et courriers professionnels, participer activement à des réunions en allemand, comprendre des documents commerciaux et contrats, présenter un projet ou une entreprise.",
        prerequisites: "Niveau B1 minimum. Expérience professionnelle souhaitée.",
      },
    }),
    prisma.course.create({
      data: {
        title: "Allemand pour les Universités C1",
        slug: "allemand-universites-c1",
        level: "C1",
        lessons: 48,
        duration: "6 mois",
        price: "400 000 FCFA",
        badge: "Universitaire",
        badgeColor: "bg-violet-600",
        image: "/images/cours/exam.jpg",
        description:
          "Préparez-vous aux études supérieures en Allemagne. Ce cours spécialisé couvre le vocabulaire académique, la rédaction scientifique et la compréhension de cours magistraux en allemand.",
        objectives:
          "Comprendre des conférences et séminaires complexes, rédiger des essais académiques, participer à des discussions universitaires, maîtriser le vocabulaire technique de votre domaine.",
        prerequisites: "Niveau B2 confirmé. Admission dans un programme d'études en Allemagne recommandée.",
      },
    }),
  ]);

  console.log("✅ Created 8 courses");

  // Create enrollments for Marc
  await prisma.enrollment.createMany({
    data: [
      {
        userId: marc.id,
        courseId: courses[0].id, // A1 - completed
        progress: 100,
        status: "completed",
      },
      {
        userId: marc.id,
        courseId: courses[1].id, // A2 - completed
        progress: 100,
        status: "completed",
      },
      {
        userId: marc.id,
        courseId: courses[2].id, // B1 - in progress
        progress: 45,
        status: "active",
      },
      {
        userId: marc.id,
        courseId: courses[5].id, // TestDaF - in progress
        progress: 20,
        status: "active",
      },
    ],
  });

  console.log("✅ Created 4 enrollments for Marc");

  // Create contact messages
  await prisma.contactMessage.createMany({
    data: [
      {
        nom: "Diallo",
        prenom: "Marc",
        email: "marc@exemple.com",
        telephone: "+221 77 123 45 67",
        niveau: "B1",
        message:
          "Bonjour, je souhaiterais en savoir plus sur le cours de préparation TestDaF. Est-ce que les cours sont disponibles en ligne ? J'aimerais aussi connaître les dates des prochaines sessions d'examen.",
        read: true,
      },
      {
        nom: "Martin",
        prenom: "Sophie",
        email: "sophie@exemple.com",
        telephone: "+33 6 12 34 56 78",
        niveau: "A2",
        message:
          "Guten Tag ! Je suis intéressée par le cours d'allemand élémentaire A2. Je travaille dans une entreprise allemande et j'aimerais améliorer ma communication avec mes collègues. Quelles sont les horaires disponibles ?",
        read: false,
      },
      {
        nom: "Ndiaye",
        prenom: "Fatou",
        email: "fatou.ndiaye@email.com",
        telephone: "+221 78 987 65 43",
        niveau: "A1",
        message:
          "Bonjour, je suis étudiante au Sénégal et je voudrais étudier en Allemagne. Parlez-vous français ? J'aimerais des informations sur les cours pour débutants et les possibilités de bourse. Merci d'avance !",
        read: false,
      },
    ],
  });

  console.log("✅ Created 3 contact messages");

  // Create chat messages for demo
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: marc.id,
        role: "user",
        content: "Guten Tag ! Ich heiße Marc. Ich komme aus Senegal.",
      },
      {
        userId: marc.id,
        role: "assistant",
        content:
          "Sehr gut, Marc ! Votre présentation est correcte. Vous avez bien utilisé 'Ich heiße' (Je m'appelle) et 'Ich komme aus' (Je viens de). Essayons maintenant de dire quelque chose de plus : 'Ich wohne in Dakar' (J'habite à Dakar). Continuez !",
        correction: null,
      },
      {
        userId: marc.id,
        role: "user",
        content: "Ich bin gehen zur Arbeit morgen.",
      },
      {
        userId: marc.id,
        role: "assistant",
        content:
          'Bien tenté ! Voici une correction : "Ich gehe morgen zur Arbeit.". En allemand, le verbe "gehen" (aller) se conjugue avec "ich" donne "ich gehe", pas "ich bin gehen". Et l\'adverbe de temps "morgen" (demain) se place juste après le verbe conjugué.',
        correction: "Ich gehe morgen zur Arbeit.",
      },
      {
        userId: marc.id,
        role: "user",
        content: "Können Sie mir ein Grammatik Übungen geben?",
      },
      {
        userId: marc.id,
        role: "assistant",
        content:
          "Exercice sur les cas en allemand :\n\nNominatif (sujet) : Der Mann liest ein Buch.\nAccusatif (COD) : Ich sehe den Mann.\nDatif (COI) : Ich helfe dem Mann.\nGénitif (possession) : Das Buch des Mannes.\n\nRemplacez les articles correctement :\n1. Ich gebe ___ Hund einen Knochen. (Datif)\n2. ___ Frau kauft ___ Apfel. (Nom. + Acc.)\n3. Das Auto ___ Lehrers ist neu. (Gén.)",
        correction: null,
      },
      {
        userId: sophie.id,
        role: "user",
        content: "Bonjour, je voudrais apprendre des phrases pour le restaurant.",
      },
      {
        userId: sophie.id,
        role: "assistant",
        content:
          "Phrases utiles au restaurant :\n• Ich möchte bitte... = Je voudrais s'il vous plaît...\n• Die Speisekarte, bitte. = Le menu, s'il vous plaît.\n• Die Rechnung, bitte. = L'addition, s'il vous plaît.\n• Das schmeckt sehr gut ! = C'est très bon !\n\nFormez une phrase pour commander au restaurant !",
        correction: null,
      },
    ],
  });

  console.log("✅ Created chat messages for demo");

  // Blog articles
  await prisma.article.createMany({
    data: [
      {
        title: "5 astuces pour mémoriser le vocabulaire allemand",
        slug: "5-astuces-memoriser-vocabulaire-allemand",
        excerpt:
          "Découvrez des méthodes éprouvées pour retenir durablement le vocabulaire allemand, des cartes mémoire à la répétition espacée.",
        content:
          "Apprendre du vocabulaire est souvent le plus grand défi pour les étudiants d'allemand.\nLa première astuce consiste à utiliser la répétition espacée grâce à des applications comme Anki.\nEnsuite, associez chaque nouveau mot à une image mentale ou une histoire personnelle pour renforcer la mémorisation.\nTroisièmement, groupez les mots par thème plutôt que par ordre alphabétique.\nQuatrièmement, pratiquez à voix haute : la mémoire auditive est un excellent complément à la mémoire visuelle.\nEnfin, révisez régulièrement, même quelques minutes par jour, plutôt que de longues sessions occasionnelles.",
        coverImage: "/images/cours/success.jpg",
        published: true,
        authorId: admin.id,
      },
      {
        title: "Comprendre les cas en allemand (Kasus) sans stress",
        slug: "comprendre-cas-allemand-sans-stress",
        excerpt:
          "Le nominatif, l'accusatif, le datif et le génitif effraient souvent les débutants. Voici comment les apprivoiser étape par étape.",
        content:
          "Les quatre cas de l'allemand structurent toute la grammaire de la langue.\nLe nominatif désigne le sujet de la phrase : celui qui fait l'action.\nL'accusatif désigne le complément d'objet direct, celui qui subit l'action.\nLe datif désigne le complément d'objet indirect, souvent introduit par une préposition comme 'mit' ou 'zu'.\nLe génitif exprime la possession, un peu comme le 's en anglais.\nLa meilleure façon de les apprendre est de mémoriser les déclinaisons des articles définis avant de se lancer dans des phrases complexes.",
        coverImage: "/images/cours/exam.jpg",
        published: true,
        authorId: admin.id,
      },
      {
        title: "Pourquoi apprendre l'allemand ouvre des portes en Europe",
        slug: "pourquoi-apprendre-allemand-portes-europe",
        excerpt:
          "L'allemand est la langue la plus parlée en Europe en tant que langue maternelle. Voici pourquoi cela peut transformer votre carrière.",
        content:
          "L'Allemagne est la première économie d'Europe et un pôle majeur pour l'industrie, l'ingénierie et la recherche.\nMaîtriser l'allemand ouvre l'accès à des dizaines de milliers d'offres d'emploi chaque année.\nC'est aussi la porte d'entrée vers des études supérieures de qualité, souvent gratuites ou à faibles frais de scolarité.\nAu-delà de l'Allemagne, l'allemand est aussi parlé en Autriche, en Suisse et dans certaines régions d'autres pays européens.\nEnfin, apprendre l'allemand permet de mieux comprendre une culture riche en littérature, musique et philosophie.",
        coverImage: "/images/cours/levels.jpg",
        published: true,
        authorId: admin.id,
      },
    ],
  });
  console.log("✅ Created blog articles");

  // Live sessions
  await prisma.liveSession.createMany({
    data: [
      {
        courseId: courses[0].id, // A1
        title: "Atelier de conversation : se présenter",
        description: "Pratiquez les salutations et présentations en petit groupe.",
        startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 3),
        durationMinutes: 60,
        roomName: `deutsch-institut-a1-${Math.random().toString(36).slice(2, 10)}`,
      },
      {
        courseId: courses[2].id, // B1
        title: "Grammaire en direct : les cas allemands",
        description: "Session de questions-réponses sur le nominatif, accusatif, datif et génitif.",
        startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 60 * 5),
        durationMinutes: 90,
        roomName: `deutsch-institut-b1-${Math.random().toString(36).slice(2, 10)}`,
      },
      {
        courseId: courses[5].id, // TestDaF/Goethe B2
        title: "Simulation d'examen oral TestDaF",
        description: "Entraînement en conditions réelles avec correction immédiate.",
        startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 2),
        durationMinutes: 120,
        roomName: `deutsch-institut-testdaf-${Math.random().toString(36).slice(2, 10)}`,
      },
    ],
  });
  console.log("✅ Created live sessions");

  // Reviews — existing + additional ones from different users on different courses
  await prisma.review.createMany({
    data: [
      {
        userId: marc.id,
        courseId: courses[0].id, // A1
        rating: 5,
        comment: "Excellent cours pour débuter ! Les explications sont claires et les exercices très pratiques.",
      },
      {
        userId: marc.id,
        courseId: courses[1].id, // A2
        rating: 4,
        comment: "Très bon contenu, j'aurais aimé un peu plus d'exercices oraux.",
      },
      {
        userId: amadou.id,
        courseId: courses[2].id, // B1
        rating: 5,
        comment: "Le cours B1 m'a permis de passer un entretien en allemand avec confiance. Les sessions en direct sont un vrai plus !",
      },
      {
        userId: amadou.id,
        courseId: courses[3].id, // B2
        rating: 4,
        comment: "Niveau exigeant mais très bien structuré. J'ai particulièrement aimé les exercices de compréhension orale.",
      },
      {
        userId: sophie.id,
        courseId: courses[1].id, // A2
        rating: 5,
        comment: "Parfait pour progresser à son rythme. Les professeurs sont disponibles et les corrections sont détaillées.",
      },
      {
        userId: aminata.id,
        courseId: courses[0].id, // A1
        rating: 4,
        comment: "Très bon point de départ pour l'allemand. Le support en français aide beaucoup quand on débute.",
      },
    ],
  });
  console.log("✅ Created 6 reviews");

  // Notifications for Marc
  await prisma.notification.createMany({
    data: [
      {
        userId: marc.id,
        title: "Bienvenue au Deutsch Institut !",
        message:
          "Merci de vous être inscrit, Marc ! Commencez par évaluer votre niveau dans votre tableau de bord, puis explorez nos cours disponibles.",
        type: "info",
        link: "/dashboard",
      },
      {
        userId: marc.id,
        title: "Inscription confirmée : Allemand Intermédiaire B1",
        message:
          "Votre inscription au cours « Allemand Intermédiaire B1 » a été confirmée. Bon apprentissage !",
        type: "success",
        link: "/dashboard",
      },
      {
        userId: marc.id,
        title: "Session en direct à venir",
        message:
          "Une session de grammaire en direct est prévue dans 4 jours. N'oubliez pas de réserver votre place !",
        type: "info",
        link: "/dashboard",
      },
    ],
  });
  console.log("✅ Created notifications for Marc");

  // Completed payment for Marc's A1 course
  await prisma.payment.createMany({
    data: [
      {
        userId: marc.id,
        courseId: courses[0].id, // A1
        amount: "150 000 FCFA",
        status: "completed",
        method: "mobile_money",
      },
    ],
  });
  console.log("✅ Created payment for Marc's A1 course");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
