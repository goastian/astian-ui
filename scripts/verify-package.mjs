import { existsSync, readFileSync, statSync } from 'node:fs'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
import { join } from 'node:path'

const outputDir = join(process.cwd(), 'dist-lib')
const budgets = {
  'base.css': 3_000,
  'core.css': 16_000,
  'cloud.css': 13_000,
  'astian-ui.css': 28_000,
  'fonts.css': 1_000,
  'astian-ui.js': 35_000,
  'cloud.js': 25_000
}
const fontlessCss = ['base.css', 'core.css', 'cloud.css', 'astian-ui.css']
const results = []

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
