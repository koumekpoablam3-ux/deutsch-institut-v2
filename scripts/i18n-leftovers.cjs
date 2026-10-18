// Liste les chaînes de texte restantes (hors t("…")) pour traitement manuel
const ts = require("typescript"), fs = require("fs")
const files = process.argv.slice(2)
const SKIP_ATTR = new Set(["className", "href", "src", "id", "key", "type", "name", "variant", "size", "style", "target", "rel", "value", "htmlFor", "viewBox", "d", "fill", "stroke", "autoComplete", "inputMode", "method", "role", "sizes", "loading", "mode", "initial", "animate", "exit", "transition", "ease", "side", "align", "autoCapitalize", "width", "height", "min", "max", "step", "accept", "action", "cx", "cy", "r", "x", "y", "points", "data-slot"])
let n = 0
for (const f of files) {
  const src = fs.readFileSync(f, "utf8")
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const visit = (node) => {
    if (ts.isImportDeclaration(node)) return
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) {
      const raw = node.text
      const p = node.parent
      let skip = false
      if (p && ts.isCallExpression(p) && p.expression.getText() === "t") skip = true
      if (p && ts.isJsxAttribute(p) && SKIP_ATTR.has(p.name.getText())) skip = true
      if (p && ts.isPropertyAssignment(p) && p.name === node) skip = true
      if (p && ts.isElementAccessExpression(p)) skip = true
      if (p && ts.isCaseClause(p)) skip = true
      if (p && ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind)) skip = true
      if (p && ts.isCallExpression(p) && /fetch|push|replace|getItem|setItem|signIn|get|has|includes|startsWith|JSON|Error|log|cn|require|split|join|querySelector|addEventListener|removeEventListener|toLocale|NextResponse|new/.test(p.expression.getText()) ) skip = true
      if (!skip && /[A-Za-zÀ-ÿ]/.test(raw) && (/\s/.test(raw.trim()) || /[À-ÿ]/.test(raw) || /^[A-ZÀ-Ý][a-zà-ÿ]{2,}/.test(raw)) && !/^(bg-|text-|from-|to-|w-|h-|flex|grid|px-|py-|border|rounded|hover:|dark:|sm:|md:|lg:)/.test(raw) && !/^[a-z-]+$/.test(raw) && !/^\//.test(raw) && !/^[A-Z_]+$/.test(raw)) {
        const line = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1
        console.log(`${f}:${line}: ${JSON.stringify(raw).slice(0, 110)}`); n++
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}
console.log("Total restant :", n)
