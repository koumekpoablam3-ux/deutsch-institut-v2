// Construit la liste des textes français à traduire -> scripts/.i18n-all-keys.json
const ts = require("typescript"), fs = require("fs"), path = require("path")
const ROOT = "src"
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])
const all = walk(ROOT).filter((f) => /\.(tsx?)$/.test(f))
const LETTER = /[A-Za-zÀ-ÿ]{2,}/
const out = new Map() // text -> Set(source)
const add = (text, src) => { if (!LETTER.test(text)) return; if (!out.has(text)) out.set(text, new Set()); out.get(text).add(src) }

const isUI = (f) => !/src\/app\/admin|src\/components\/ui|src\/app\/api\/admin|src\/i18n/.test(f.replace(/\\/g, "/"))
const TARGET_MODULE_LEVEL = /src\/(app\/(HomeClient|contact|cours|dashboard|direct|entrainement-ia|forgot-password|login|processus|reset-password|temoignages|test-de-niveau)|components\/(WhatsAppWidget|ChatbotWidget|NotificationBell|sections))/

for (const f of all.filter(isUI)) {
  const norm = f.replace(/\\/g, "/")
  const src = fs.readFileSync(f, "utf8")
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const isApi = /src\/app\/api\//.test(norm) && !/api\/(chat|assistant)\//.test(norm)
  const visit = (node) => {
    // 1. t("…") (y compris les littéraux imbriqués : t(data.error || "…"))
    if (ts.isCallExpression(node) && node.expression.getText() === "t") {
      const lits = []
      const dig = (n) => { if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) lits.push(n.text); ts.forEachChild(n, dig) }
      node.arguments.forEach(dig)
      lits.forEach((l) => add(l, norm))
    }
    // 4. messages d'API destinés à l'utilisateur
    if (isApi && ts.isPropertyAssignment(node) && ["error", "message", "title"].includes(node.name.getText()) && (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer))) add(node.initializer.text, norm)
    ts.forEachChild(node, visit)
  }
  visit(sf)

  // 2. chaînes des constantes de module dans les pages ciblées
  if (TARGET_MODULE_LEVEL.test(norm)) {
    for (const st of sf.statements) {
      if (!ts.isVariableStatement(st) && !ts.isFunctionDeclaration(st)) continue
      if (ts.isFunctionDeclaration(st) && /^[A-Z]/.test(st.name?.text || "") ) continue
      const dig = (n) => {
        if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && !(n.parent && ts.isPropertyAssignment(n.parent) && n.parent.name === n)) {
          const raw = n.text
          if (/\s/.test(raw.trim()) || /[À-ÿ]/.test(raw) || /^[A-Z][a-zà-ÿ]{3,}/.test(raw)) {
            if (!/^(bg-|text-|from-|to-|border|hover:|dark:|absolute|fixed|flex|w-|h-|px-|py-|rounded|max-)/.test(raw) && !/^\//.test(raw) && !/^[A-Za-z0-9_-]+$/.test(raw) || /[À-ÿ]/.test(raw) || (/\s/.test(raw.trim()) && /^[A-ZÀ-Ý]/.test(raw))) add(raw, norm + " (module)")
          }
        }
        ts.forEachChild(n, dig)
      }
      dig(st)
    }
  }
}

// 3. contenu par défaut (lib/site-content.ts)
{
  const f = "src/lib/site-content.ts"
  const src = fs.readFileSync(f, "utf8")
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const KEYS = new Set(["title", "highlight", "subtitle", "tagsTitle", "partnerText", "badgeText", "eyebrow", "text", "label", "level", "description", "primaryLabel", "secondaryLabel", "footerText", "tagline", "phoneNote", "emailNote", "city", "addressDetail", "hoursDays", "hoursTime", "socialText"])
  const visit = (n) => {
    if (ts.isArrayLiteralExpression(n) && n.parent && ts.isPropertyAssignment(n.parent) && ["pills", "tags"].includes(n.parent.name.getText())) n.elements.forEach((e) => ts.isStringLiteral(e) && add(e.text, f))
    if (ts.isPropertyAssignment(n) && KEYS.has(n.name.getText()) && ts.isStringLiteral(n.initializer) && !/^(Plus qu|min|max)/.test("")) {
      const parentText = n.parent.parent && n.parent.parent.getText().slice(0, 60)
      if (!/z\.|Le titre est requis|Chaque|requis/.test(n.initializer.text)) add(n.initializer.text, f)
    }
    ts.forEachChild(n, visit)
  }
  visit(sf)
}
// 5. divers
;["cours allemand dakar","apprendre allemand sénégal","deutsch institut","goethe zertifikat","cours allemand en ligne","formation allemande","préparation examen goethe","visa allemagne sénégal","allemand A1 A2 B1 B2","cours de langue dakar"].forEach((k) => add(k, "layout"))

const keys = [...out.keys()].sort((a, b) => a.localeCompare(b, "fr"))
fs.writeFileSync("scripts/.i18n-all-keys.json", JSON.stringify(Object.fromEntries(keys.map((k) => [k, [...out.get(k)][0]])), null, 1))
console.log("Textes à traduire :", keys.length, "| caractères :", keys.join("").length)
