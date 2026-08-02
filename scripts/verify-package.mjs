import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
import { join, resolve } from 'node:path'

const outputDir = join(process.cwd(), 'dist-lib')
const budgets = {
  'base.css': 3_000,
  'core.css': 16_000,
  'cloud.css': 13_000,
  'astian-ui.css': 28_000,
  'fonts.css': 1_000,
  'forms.css': 8_000,
  'marketing.css': 8_000,
  'astian-ui.js': 35_000,
  'cloud.js': 25_000,
  'input.js': 12_000,
  'textarea.js': 12_000,
  'checkbox.js': 12_000,
  'button.js': 12_000,
  'marketing-navigation.js': 18_000,
  'locale-switch.js': 10_000,
  'marketing-action.js': 10_000
}
const fontlessCss = [
  'base.css',
  'core.css',
  'cloud.css',
  'astian-ui.css',
  'forms.css',
  'marketing.css'
]
const results = []

const collectFiles = (directory, predicate) => readdirSync(directory).flatMap((entry) => {
  const path = join(directory, entry)
  return statSync(path).isDirectory()
    ? collectFiles(path, predicate)
    : predicate(path) ? [path] : []
})

const splitSelectorList = (selectorList) => {
  const selectors = []
  let current = ''
  let parenthesisDepth = 0

  for (const character of selectorList) {
    if (character === '(') parenthesisDepth += 1
    if (character === ')') parenthesisDepth = Math.max(0, parenthesisDepth - 1)

    if (character === ',' && parenthesisDepth === 0) {
      selectors.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  if (current.trim()) selectors.push(current.trim())
  return selectors
}

const manifest = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))
const rootDeclaration = readFileSync(join(outputDir, 'types', 'index.d.ts'), 'utf8')
if (/^import\s+['"][^'"]+\.css['"];?$/m.test(rootDeclaration)) {
  throw new Error('La declaración principal contiene un import CSS no resoluble')
}
const componentSubpaths = [
  './input',
  './textarea',
  './checkbox',
  './button',
  './marketing-navigation',
  './locale-switch',
  './marketing-action'
]

for (const subpath of componentSubpaths) {
  const contract = manifest.exports?.[subpath]
  for (const condition of ['types', 'import', 'require']) {
    const target = contract?.[condition]
    if (typeof target !== 'string' || !target.startsWith('./')) {
      throw new Error(`Export inválido ${subpath} (${condition}): ${String(target)}`)
    }

    const targetPath = resolve(process.cwd(), target)
    if (!existsSync(targetPath) || !statSync(targetPath).isFile() || statSync(targetPath).size === 0) {
      throw new Error(`Falta el target ${subpath} (${condition}): ${target}`)
    }
  }
}

for (const subpath of ['./forms.css', './marketing.css']) {
  const target = manifest.exports?.[subpath]
  if (typeof target !== 'string' || !target.startsWith('./')) {
    throw new Error(`Export CSS inválido ${subpath}: ${String(target)}`)
  }

  const targetPath = resolve(process.cwd(), target)
  if (!existsSync(targetPath) || !statSync(targetPath).isFile() || statSync(targetPath).size === 0) {
    throw new Error(`Falta el target CSS ${subpath}: ${target}`)
  }
}

for (const [file, gzipBudget] of Object.entries(budgets)) {
  const path = join(outputDir, file)
  if (!existsSync(path)) throw new Error(`Falta ${file} en dist-lib`)
  const content = readFileSync(path)
  const gzipBytes = gzipSync(content, { level: 9 }).byteLength
  const brotliBytes = brotliCompressSync(content, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 }
  }).byteLength
  if (gzipBytes > gzipBudget) {
    throw new Error(`${file} supera el presupuesto gzip: ${gzipBytes} > ${gzipBudget}`)
  }
  results.push({
    file,
    raw: content.byteLength,
    gzip: gzipBytes,
    brotli: brotliBytes,
    gzipBudget
  })
}

for (const file of fontlessCss) {
  const css = readFileSync(join(outputDir, file), 'utf8')
  if (/@font-face|data:font|base64/i.test(css)) {
    throw new Error(`${file} contiene una fuente embebida`)
  }
}

for (const file of ['forms.css', 'marketing.css']) {
  const css = readFileSync(join(outputDir, file), 'utf8')
  if (/Roboto|\.q-|@import\s+[^;]*(?:quasar|astian-ui\.css|base\.css|core\.css)/i.test(css)) {
    throw new Error(`${file} depende de estilos globales o Quasar`)
  }

  const selectors = [...css.matchAll(/([^{}]+)\{/g)]
    .map((match) => match[1].trim())
    .filter((selector) => selector && !selector.startsWith('@'))
    .flatMap(splitSelectorList)
  const globalSelectors = selectors.filter((selector) => (
    /^(?:html|body|:root|\*|:where\()/i.test(selector)
    || /^(?:h[1-6]|button|input|textarea|select)(?::[\w-]+(?:\([^)]*\))?)*$/i.test(selector)
  ))

  if (globalSelectors.length) {
    throw new Error(`${file} contiene selectores globales: ${globalSelectors.join(', ')}`)
  }
}

const unsafePublishedJs = collectFiles(
  outputDir,
  (path) => path.endsWith('.js') || path.endsWith('.cjs')
).flatMap((path) => {
  const source = readFileSync(path, 'utf8')
  return /quasar\/src\/|__QUASAR_[A-Z_]+__/i.test(source)
    ? [path.slice(outputDir.length + 1)]
    : []
})

if (unsafePublishedJs.length) {
  throw new Error(
    `El JavaScript publicado contiene imports internos o defines sin resolver de Quasar:\n`
    + unsafePublishedJs.join('\n')
  )
}

const fontsCss = readFileSync(join(outputDir, 'fonts.css'), 'utf8')
if (!fontsCss.includes("url('./fonts/material-icons-round.woff2')") || /data:|base64/i.test(fontsCss)) {
  throw new Error('fonts.css debe referenciar el WOFF2 externo sin embeberlo')
}

const fontPath = join(outputDir, 'fonts', 'material-icons-round.woff2')
if (!existsSync(fontPath) || statSync(fontPath).size === 0) {
  throw new Error('Falta el asset WOFF2 opt-in')
}

const segmentedGzip = results
  .filter(({ file }) => ['base.css', 'core.css', 'cloud.css'].includes(file))
  .reduce((total, { gzip }) => total + gzip, 0)
if (segmentedGzip > 30_000) {
  throw new Error(`El CSS segmentado supera 30 KB gzip: ${segmentedGzip}`)
}

console.table(results)
console.log(`CSS base + core + cloud: ${segmentedGzip} bytes gzip`)
