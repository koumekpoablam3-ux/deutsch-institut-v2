// Codemod : enveloppe les textes français d'un fichier TSX dans t("…") et injecte le hook de traduction.
// Usage : node scripts/i18n-codemod.cjs [--write] [--server] fichier1.tsx fichier2.tsx …
// Écrit les clés trouvées dans scripts/.i18n-keys.json (fusionnées entre les exécutions).
const ts = require("typescript")
const fs = require("fs")
const path = require("path")

const args = process.argv.slice(2)
const WRITE = args.includes("--write")
const SERVER = args.includes("--server")
const files = args.filter((a) => !a.startsWith("--"))
const KEYS_FILE = path.join(__dirname, ".i18n-keys.json")
const allKeys = fs.existsSync(KEYS_FILE) ? JSON.parse(fs.readFileSync(KEYS_FILE, "utf8")) : {}

const LETTER = /[A-Za-zÀ-ÿ]{2,}/
const ATTRS = new Set(["placeholder", "title", "alt", "aria-label", "label"])
const CALLS = /^(toast\.(success|error|info|warning)|setError|setMessage|setMsg|setStatus|confirm|alert)$/

const decode = (s) =>
  s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, "\u00a0")
    .replace(/&rsquo;/g, "\u2019").replace(/&lsquo;/g, "\u2018").replace(/&laquo;/g, "«").replace(/&raquo;/g, "»")
    .replace(/&eacute;/g, "é").replace(/&egrave;/g, "è").replace(/&agrave;/g, "à").replace(/&ecirc;/g, "ê").replace(/&ccedil;/g, "ç")
    .replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&#39;/g, "'").replace(/&hellip;/g, "…").replace(/&middot;/g, "·")

const looksTranslatable = (s) => LETTER.test(s) && !/^(https?:|\/|#|mailto:|tel:)/.test(s.trim()) && !/^[\w-]+(\s[\w-]+)*$/.test(s.trim()) || /\s/.test(s.trim()) && LETTER.test(s)

function isPascal(name) { return !!name && /^[A-Z]/.test(name) }

function enclosingComponent(node) {
  for (let n = node.parent; n; n = n.parent) {
    if (ts.isFunctionDeclaration(n) && (isPascal(n.name?.text) || (n.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)))) return n
    if ((ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && ts.isVariableDeclaration(n.parent) && ts.isIdentifier(n.parent.name) && isPascal(n.parent.name.text)) return n
  }
  return null
}

let totalEdits = 0
const manual = []

for (const file of files) {
  const src = fs.readFileSync(file, "utf8")
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const edits = [] // {start,end,text}
  const comps = new Map() // component node -> {t:bool, intl:bool}
  const keys = new Set()

  const useComp = (node, what) => {
    const c = enclosingComponent(node)
    if (!c) return false
    const entry = comps.get(c) || { t: false, intl: false }
    entry[what] = true
    comps.set(c, entry)
    return true
  }
  const wrapExpr = (node, text) => `t(${text})`

  function wrapLiteral(node) {
    const raw = node.text
    if (!looksTranslatable(raw)) return
    if (!useComp(node, "t")) { manual.push(`${file}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1} (hors composant) ${JSON.stringify(raw).slice(0, 70)}`); return }
    keys.add(raw)
    edits.push({ start: node.getStart(), end: node.getEnd(), text: `t(${JSON.stringify(raw)})` })
  }

  // Ascend from a string literal through ||, ??, ?:, && and parentheses; true if it ends at a JSX child expression or call arg we handle
  function inJsxChildExpr(node) {
    let n = node
    while (n.parent) {
      const p = n.parent
      if (ts.isParenthesizedExpression(p)) { n = p; continue }
      if (ts.isConditionalExpression(p) && p.condition !== n) { n = p; continue }
      if (ts.isBinaryExpression(p) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.AmpersandAmpersandToken].includes(p.operatorToken.kind) && p.left !== n) { n = p; continue }
      if (ts.isJsxExpression(p) && (ts.isJsxElement(p.parent) || ts.isJsxFragment(p.parent))) return true
      return false
    }
    return false
  }

  function visit(node) {
    if (ts.isJsxText(node)) {
      const raw = node.getText()
      const text = decode(raw)
      if (LETTER.test(text)) {
        const lead = (raw.match(/^\s*/) || [""])[0]
        const trail = (raw.match(/\s*$/) || [""])[0]
        const core = decode(raw.slice(lead.length, raw.length - trail.length)).replace(/\s+/g, " ")
        if (core && useComp(node, "t")) {
          keys.add(core)
          const l = /\n/.test(lead) || lead === "" ? lead : '{" "}'
          const tr = /\n/.test(trail) || trail === "" ? trail : '{" "}'
          edits.push({ start: node.getStart(), end: node.getEnd(), text: `${l}{t(${JSON.stringify(core)})}${tr}` })
        } else if (core) manual.push(`${file}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1} (JSX hors composant) ${core.slice(0, 60)}`)
      }
      return
    }
    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && ATTRS.has(node.name.getText())) {
      const raw = node.initializer.text
      if (looksTranslatable(raw) && useComp(node, "t")) {
        keys.add(raw)
        edits.push({ start: node.initializer.getStart(), end: node.initializer.getEnd(), text: `{t(${JSON.stringify(raw)})}` })
      }
      return
    }
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && inJsxChildExpr(node)) {
      wrapLiteral(node)
      return
    }
    if (ts.isCallExpression(node) && CALLS.test(node.expression.getText()) && node.arguments.length > 0) {
      const a0 = node.arguments[0]
      if (ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0)) {
        wrapLiteral(a0)
      } else if (ts.isBinaryExpression(a0) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(a0.operatorToken.kind)) {
        // data.error || "Erreur…" : on traduit le résultat (message de l'API ou texte de secours)
        const lit = a0.right
        if ((ts.isStringLiteral(lit) || ts.isNoSubstitutionTemplateLiteral(lit)) && looksTranslatable(lit.text)) {
          if (useComp(node, "t")) { keys.add(lit.text); edits.push({ start: a0.getStart(), end: a0.getEnd(), text: `t(${a0.getText()})` }) }
        }
      } else if (ts.isTemplateExpression(a0)) {
        manual.push(`${file}:${sf.getLineAndCharacterOfPosition(a0.getStart()).line + 1} (gabarit) ${a0.getText().slice(0, 70)}`)
      }
      // continue descent for nested args
    }
    // dates : "fr-FR" → langue courante
    if (ts.isStringLiteral(node) && node.text === "fr-FR" && node.parent && ts.isCallExpression(node.parent) && /toLocale/.test(node.parent.expression.getText())) {
      if (useComp(node, "intl")) edits.push({ start: node.getStart(), end: node.getEnd(), text: "intlLocale" })
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  if (edits.length === 0 && comps.size === 0) { console.log(`- ${file}: rien à faire`); continue }

  // Injection du hook dans chaque composant concerné
  for (const [comp, use] of comps) {
    const body = comp.body
    if (!body || !ts.isBlock(body)) { manual.push(`${file}: composant sans corps de bloc (${comp.getText().slice(0, 40)})`); continue }
    const names = []
    if (use.t) names.push("t")
    if (use.intl) names.push("intlLocale")
    const line = SERVER ? `\n  const { ${names.join(", ")} } = await getServerT()` : `\n  const { ${names.join(", ")} } = useI18n()`
    edits.push({ start: body.getStart() + 1, end: body.getStart() + 1, text: line })
    if (SERVER && !(comp.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword))) {
      if (ts.isFunctionDeclaration(comp)) edits.push({ start: comp.getStart() + (comp.modifiers ? comp.modifiers.reduce((acc, m) => Math.max(acc, m.getEnd() - comp.getStart()), 0) + 1 : 0), end: comp.getStart() + (comp.modifiers ? comp.modifiers.reduce((acc, m) => Math.max(acc, m.getEnd() - comp.getStart()), 0) + 1 : 0), text: "async " })
    }
  }

  // Import
  const hasImport = /from ["']@\/i18n\//.test(src)
  if (!hasImport) {
    const importLine = SERVER ? `import { getServerT } from "@/i18n/server"\n` : `import { useI18n } from "@/i18n/I18nProvider"\n`
    // après le "use client" et les imports existants : on insère avant le premier import
    const firstImport = sf.statements.find((s) => ts.isImportDeclaration(s))
    const pos = firstImport ? firstImport.getStart() : 0
    edits.push({ start: pos, end: pos, text: importLine })
  }

  edits.sort((a, b) => b.start - a.start || b.end - a.end)
  let out = src
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end)

  keys.forEach((k) => { (allKeys[k] = allKeys[k] || []).includes(file) || allKeys[k].push(file) })
  totalEdits += edits.length
  console.log(`- ${file}: ${keys.size} textes, ${comps.size} composant(s)`)
  if (WRITE) fs.writeFileSync(file, out)
}

if (WRITE) fs.writeFileSync(KEYS_FILE, JSON.stringify(allKeys, null, 1))
console.log(`\nTotal modifications : ${totalEdits}${WRITE ? " (écrites)" : " (simulation)"}`)
if (manual.length) { console.log("\nÀ traiter à la main :"); manual.forEach((m) => console.log("  " + m)) }
