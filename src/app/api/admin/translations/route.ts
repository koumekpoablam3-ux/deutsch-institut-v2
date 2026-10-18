import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { builtinDictionary } from "@/i18n/dictionary";
import { collectTranslatableStrings } from "@/lib/translatable-content";

const localeSchema = z.enum(["en", "de"]);
const sha1 = (s: string) => createHash("sha1").update(s).digest("hex");

// Liste des textes à traduire, avec leur traduction actuelle (saisie par l'admin ou fournie par défaut)
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const locale = localeSchema.safeParse(request.nextUrl.searchParams.get("locale"));
    if (!locale.success) return NextResponse.json({ error: "Langue invalide" }, { status: 400 });

    const [items, overrides] = await Promise.all([
      collectTranslatableStrings(),
      db.translation.findMany({ where: { locale: locale.data }, select: { source: true, value: true } }),
    ]);
    const custom = new Map<string, string>(overrides.map((o: { source: string; value: string }) => [o.source, o.value]));
    const builtin = builtinDictionary(locale.data);

    return NextResponse.json({
      items: items.map((i) => ({
        source: i.source,
        group: i.group,
        value: custom.get(i.source) ?? null,
        builtin: builtin[i.source] ?? null,
      })),
    });
  } catch (err) {
    console.error("Admin translations GET error:", err);
    return NextResponse.json({ error: "Une erreur est survenue (la table Translation existe-t-elle ? Lancez npm run db:push)" }, { status: 500 });
  }
}

const putSchema = z.object({
  locale: localeSchema,
  source: z.string().min(1).max(20000),
  value: z.string().max(20000),
});

// Enregistre (ou supprime si vide) la traduction d'un texte
export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const parsed = putSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    const { locale, source } = parsed.data;
    const value = parsed.data.value.trim();
    const sourceHash = sha1(source);

    if (!value) {
      await db.translation.deleteMany({ where: { locale, sourceHash } });
      return NextResponse.json({ message: "Traduction supprimée" });
    }
    await db.translation.upsert({
      where: { locale_sourceHash: { locale, sourceHash } },
      create: { locale, sourceHash, source, value },
      update: { value, source },
    });
    return NextResponse.json({ message: "Traduction enregistrée" });
  } catch (err) {
    console.error("Admin translations PUT error:", err);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
