import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function generateGermanExercise(message: string, niveau: string): {
  reply: string;
  correction?: string;
} {
  const lowerMessage = message.toLowerCase();

  // Check for common mistakes and provide corrections
  const commonMistakes: Record<string, { correction: string; explanation: string }> = {
    "ich bin gehen": {
      correction: "Ich gehe",
      explanation:
        "En allemand, le verbe 'gehen' (aller) se conjugue avec 'ich' donne 'ich gehe', pas 'ich bin gehen'.",
    },
    "ich habe hunger": {
      correction: "Ich habe Hunger",
      explanation:
        "Les noms en allemand s'écrivent toujours avec une majuscule : 'Hunger'.",
    },
    "mein name ist": {
      correction: "Mein Name ist",
      explanation:
        "Les noms en allemand s'écrivent toujours avec une majuscule : 'Name'.",
    },
    "guten morgen": {
      correction: "Guten Morgen",
      explanation:
        "Les noms en allemand s'écrivent toujours avec une majuscule : 'Morgen'.",
    },
    "danke schon": {
      correction: "Danke schön",
      explanation: "En allemand, 'schön' prend un tréma : 'ö' (schön).",
    },
  };

  for (const [mistake, data] of Object.entries(commonMistakes)) {
    if (lowerMessage.includes(mistake)) {
      return {
        reply: `Bien tenté ! Voici une correction : "${data.correction}". ${data.explanation} Continuez vos efforts ! 🇩🇪`,
        correction: data.correction,
      };
    }
  }

  // Level-specific exercises
  switch (niveau.toUpperCase()) {
    case "A1": {
      const vocabExercises = [
        {
          topic: "Les salutations",
          exercise: `Salutations en allemand :
• Guten Morgen = Bonjour (matin)
• Guten Tag = Bonjour (après-midi)
• Guten Abend = Bonsoir
• Auf Wiedersehen = Au revoir
• Tschüss = Salut (informel)

Essayez de former une salutation simple !`,
        },
        {
          topic: "Les nombres",
          exercise: `Les nombres en allemand :
• eins = 1, zwei = 2, drei = 3
• vier = 4, fünf = 5, sechs = 6
• sieben = 7, acht = 8, neun = 9, zehn = 10

Comptez de 1 à 10 en allemand !`,
        },
        {
          topic: "Le vocabulaire de base",
          exercise: `Mots de base :
• der Tisch = la table
• das Buch = le livre
• die Blume = la fleur
• der Stuhl = la chaise

Répétez ces mots et essayez de faire une phrase !`,
        },
        {
          topic: "Se présenter",
          exercise: `Pour se présenter :
• Ich heiße... = Je m'appelle...
• Ich komme aus... = Je viens de...
• Ich wohne in... = J'habite à...

Essayez : "Ich heiße [votre nom]"`,
        },
      ];
      const selected = vocabExercises[Math.floor(Math.random() * vocabExercises.length)];
      return { reply: selected.exercise };
    }

    case "A2": {
      const sentenceExercises = [
        {
          topic: "Au restaurant",
          exercise: `Phrases utiles au restaurant :
• Ich möchte bitte... = Je voudrais s'il vous plaît...
• Die Speisekarte, bitte. = Le menu, s'il vous plaît.
• Die Rechnung, bitte. = L'addition, s'il vous plaît.
• Das schmeckt sehr gut ! = C'est très bon !

Formez une phrase pour commander au restaurant !`,
        },
        {
          topic: "Les directions",
          exercise: `Demander son chemin :
• Wo ist...? = Où est...?
• Wie komme ich zu...? = Comment aller à...?
• Geradeaus = tout droit
• Links = à gauche, Rechts = à droite

Essayez : "Wo ist der Bahnhof?" (Où est la gare ?)`,
        },
        {
          topic: "Les temps quotidiens",
          exercise: `Parler de la routine :
• Ich stehe um 7 Uhr auf. = Je me lève à 7h.
• Ich frühstücke um 7:30 Uhr. = Je prends le petit-déj à 7h30.
• Ich gehe um 8 Uhr zur Arbeit. = Je vais au travail à 8h.

Décrivez votre routine matinale en allemand !`,
        },
      ];
      const selected = sentenceExercises[Math.floor(Math.random() * sentenceExercises.length)];
      return { reply: selected.exercise };
    }

    case "B1": {
      const grammarExercises = [
        {
          topic: "Les cas (Kasus)",
          exercise: `Exercice sur les cas en allemand :

Nominatif (sujet) : Der Mann liest ein Buch.
Accusatif (COD) : Ich sehe den Mann.
Datif (COI) : Ich helfe dem Mann.
Génitif (possession) : Das Buch des Mannes.

Remplacez les articles correctement :
1. Ich gebe ___ Hund einen Knochen. (Datif)
2. ___ Frau kauft ___ Apfel. (Nom. + Acc.)
3. Das Auto ___ Lehrers ist neu. (Gén.)`,
        },
        {
          topic: "Les verbes à particule (Trennbare Verben)",
          exercise: `Les verbes séparables en allemand :

La particule se détache et va à la fin en proposition principale.
• ankommen → Ich komme um 10 Uhr an.
• aufstehen → Ich stehe um 7 Uhr auf.
• zumachen → Mach bitte die Tür zu !

Transformez ces phrases :
1. Ich (aufstehen) um 6 Uhr. →
2. Er (anrufen) seine Mutter. →
3. Wir (ausgehen) am Wochenende. →`,
        },
        {
          topic: "Le prétérit (Präteritum)",
          exercise: `Le Präteritum des verbes forts :

sein → war, waren  |  werden → wurde, wurden
gehen → ging       |  kommen → kam
essen → aß          |  trinken → trank
sehen → sah         |  lesen → las

Mettez au Präteritum :
1. Ich bin gestern im Kino. →
2. Wir gehen ins Restaurant. →
3. Er sieht einen Hund. →`,
        },
        {
          topic: "Les prépositions à deux cas",
          exercise: `Prépositions avec accusatif ou datif (Wechselpräpositionen) :

Accusatif = mouvement (wohin?) : in, auf, an, über, unter, vor, hinter, neben, zwischen
Datif = position (wo?) : in, auf, an, über, unter, vor, hinter, neben, zwischen

• Ich gehe in die Stadt. (Acc. — mouvement)
• Ich bin in der Stadt. (Dat. — position)

Complétez :
1. Das Buch liegt ___ ___ Tisch. (Dat.)
2. Ich stelle die Vase ___ ___ Fenster. (Acc.)`,
        },
      ];
      const selected = grammarExercises[Math.floor(Math.random() * grammarExercises.length)];
      return { reply: selected.exercise };
    }

    case "B2": {
      const complexExercises = [
        {
          topic: "Le style indirect (Indirekte Rede)",
          exercise: `Le style indirect en allemand :

Direct : Er sagt : "Ich bin müde."
Indirect : Er sagt, dass er müde sei.

Direct : Sie fragt : "Wann kommst du?"
Indirect : Sie fragt, wann ich komme.

Transformez en style indirect :
1. Er behauptet : "Ich habe das Buch gelesen."
2. Sie sagt : "Ich werde morgen kommen."
3. Er fragt : "Hast du die Hausaufgaben gemacht?"`,
        },
        {
          topic: "Le Konjunktiv II",
          exercise: `Le subjonctif II (Konjunktiv II) — exprimer l'irréel :

sein → wäre          |  haben → hätte
gehen → würde gehen  |  können → könnte
müssen → müsste     |  wissen → wüsste

Phrase d'exemple : Wenn ich Zeit hätte, würde ich nach Deutschland reisen.

Formulez des phrases irréelles :
1. Si j'étais riche… → Wenn ich reich ___ …
2. Si je pouvais parler allemand couramment…
3. Si nous avions un professeur…`,
        },
        {
          topic: "Les propositions subordonnées complexes",
          exercise: `Propositions subordonnées en allemand :

Conjonctions : weil, dass, wenn, obwohl, während, seit(dem), sobald
Règle : le verbe conjugué va à la FIN de la subordonnée.

• Ich lerne Deutsch, weil ich in Berlin arbeiten möchte.
• Obwohl es regnet, gehe ich spazieren.

Reliez les propositions :
1. Ich habe Hunger. → Ich esse ..., ___ ich Hunger habe.
2. Es ist kalt. → ___ es kalt ist, trage ich eine Jacke.
3. Ich lerne seit 2 Jahren Deutsch.`,
        },
        {
          topic: "Le passif (Passiv)",
          exercise: `La voix passive en allemand :

Présent : Das Haus wird gebaut.
Prétérit : Das Haus wurde gebaut.
Parfait  : Das Haus ist gebaut worden.

Avec agent (von + datif) :
• Das Haus wird von dem Architekten gebaut.

Mettez à la voix passive :
1. Der Lehrer korrigiert die Hausaufgaben. →
2. Man spricht hier Deutsch. →
3. Goethe schrieb den Faust. →`,
        },
      ];
      const selected = complexExercises[Math.floor(Math.random() * complexExercises.length)];
      return { reply: selected.exercise };
    }

    case "C1": {
      const advancedExercises = [
        {
          topic: "Les subordonnées infinitives (Infinitivkonstruktionen)",
          exercise: `L'infinitif avec zu en allemand :

Structure : ... zu + infinitif
• Ich hoffe, dich bald zu sehen.
• Es ist wichtig, pünktlich zu sein.
• Sie hat aufgehört, zu rauchen.

Attention : um ... zu, ohne ... zu, statt ... zu, anstatt ... zu
• Er geht nach Deutschland, um Deutsch zu lernen.
• Sie verließ den Raum, ohne ein Wort zu sagen.

Transformez :
1. Ich möchte Deutsch lernen. → Ich habe vor ...
2. Er a dit nichts. Er ist gegangen. → Er ist gegangen, ohne ...
3. Es ist schwer, Fremdsprachen zu lernen. (Réécrivez avec "es")`,
        },
        {
          topic: "Le style nominal (Nominalstil)",
          exercise: `Le style nominal en allemand — préférer les noms aux verbes :

Au lieu de : Weil er krank ist, kommt er nicht.
Nominalstil : Wegen seiner Krankheit kommt er nicht.

Au lieu de : Bevor er abreist, packt er.
Nominalstil : Vor seiner Abreise packt er.

Transformez en style nominal :
1. Weil es regnet, bleiben wir zu Hause.
2. Nachdem sie das Studium beendet hatte, fand sie einen Job.
3. Während er in Berlin lebte, hat er viel gelernt.`,
        },
        {
          topic: "Les connecteurs argumentatifs (Konnektoren)",
          exercise: `Connecteurs pour structurer un argumentaire :

Ajout : darüber hinaus, zudem, ferner, zudem
Opposition : dennoch, jedoch, hingegen, wohingegen
Conséquence : daher, folglich, infolgedessen, demzufolge
Cause : angesichts, aufgrund, infolge, mangels

Complétez :
1. Die Kosten sind hoch. ___ entscheiden wir uns für eine Alternative.
2. ___ der guten Noten wurde er ausgezeichnet.
3. Die Qualität ist gut; ___ ist der Preis zu hoch.`,
        },
        {
          topic: "Les verbes à préfixe inséparable",
          exercise: `Verbes à préfixe inséparable (be-, emp-, ent-, er-, ge-, miss-, ver-, zer-) :

Ces verbes ne sont jamais séparables et leur participe passé ne prend pas de « ge- ».
• besuchen → besuchte → hat besucht
• verstehen → verstand → hat verstanden
• erzählen → erzählte → hat erzählt
• zerstören → zerstörte → hat zerstört

Conjuguez au parfait :
1. Ich (verstehen) die Frage.
2. Er (erzählen) eine Geschichte.
3. Wir (besuchen) das Museum.`,
        },
      ];
      const selected = advancedExercises[Math.floor(Math.random() * advancedExercises.length)];
      return { reply: selected.exercise };
    }

    default:
      return {
        reply:
          "Bienvenue à l'entraînement d'allemand ! 🇩🇪 Pour commencer, essayez de me dire quelque chose en allemand, comme se présenter ou poser une question. Je vais vous aider avec la grammaire, le vocabulaire et la prononciation !",
      };
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const userId = (session.user as { userId: string }).userId;
    const userNiveau = (session.user as { niveau: string }).niveau || "A1";

    const body = await request.json();
    const { message, niveau } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Le message est requis" },
        { status: 400 }
      );
    }

    // Save user message
    await db.chatMessage.create({
      data: {
        userId,
        role: "user",
        content: message,
      },
    });

    // Generate exercise response
    const effectiveNiveau = niveau || userNiveau;
    const { reply, correction } = generateGermanExercise(message, effectiveNiveau);

    // Save AI response
    await db.chatMessage.create({
      data: {
        userId,
        role: "assistant",
        content: reply,
        correction: correction || null,
      },
    });

    return NextResponse.json({ success: true, data: { reply, correction } });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const userId = (session.user as { userId: string }).userId;

    const chatHistory = await db.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: { messages: chatHistory } });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const userId = (session.user as { userId: string }).userId;

    const result = await db.chatMessage.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      data: { deletedCount: result.count },
    });
  } catch (error) {
    console.error("Chat DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
