import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { join } from 'node:path'

const projectDir = process.cwd()
const outputDir = join(projectDir, 'dist-lib')
const sourceCssDir = join(projectDir, 'src', 'css')

const readOutput = (file) => readFileSync(join(outputDir, file), 'utf8').trim()
const joinCss = (...parts) => `${parts.filter(Boolean).join('\n')}\n`

const splitCssFiles = readdirSync(outputDir)
  .filter((file) => file.endsWith('.css'))

const canonicalCssFiles = [
  'style.css',
  'index.css',
  'cloud.css',
  'forms.css',
  'marketing.css'
]

for (const required of ['style.css', 'index.css', 'cloud.css']) {
  if (!splitCssFiles.includes(required)) {
    throw new Error(`No se generó el segmento CSS requerido: ${required}`)
  }
}

const sharedFiles = splitCssFiles
  .filter((file) => !canonicalCssFiles.includes(file))
  .sort()

const baseCss = readOutput('style.css')
const sharedCss = sharedFiles.map(readOutput).join('\n')
const coreCss = joinCss(sharedCss, readOutput('index.css'))
const cloudCss = joinCss(readOutput('cloud.css'))
const portableTokensCss = readFileSync(join(projectDir, 'tokens.css'), 'utf8').trim()
const astianTokensCss = readFileSync(join(sourceCssDir, 'tokens.css'), 'utf8')
  .replace(/^\s*@import\s+['"]\.\.\/\.\.\/tokens\.css['"];\s*/, '')
  .trim()

writeFileSync(join(outputDir, 'base.css'), joinCss(baseCss))
writeFileSync(join(outputDir, 'core.css'), coreCss)
writeFileSync(join(outputDir, 'cloud.css'), cloudCss)
writeFileSync(join(outputDir, 'astian-ui.css'), joinCss(baseCss, coreCss, cloudCss))
writeFileSync(join(outputDir, 'tokens.css'), joinCss(portableTokensCss, astianTokensCss))
copyFileSync(join(sourceCssDir, 'fonts.css'), join(outputDir, 'fonts.css'))
copyFileSync(join(sourceCssDir, 'forms.css'), join(outputDir, 'forms.css'))
copyFileSync(join(sourceCssDir, 'marketing.css'), join(outputDir, 'marketing.css'))

const fontDir = join(outputDir, 'fonts')
mkdirSync(fontDir, { recursive: true })
copyFileSync(
  join(
    projectDir,
    'node_modules',
    '@quasar',
    'extras',
    'material-icons-round',
    'web-font',
    'LDItaoyNOAY6Uewc665JcIzCKsKc_M9flwmPq_HTTw.woff2'
  ),
  join(fontDir, 'material-icons-round.woff2')
)

for (const file of ['index.css', 'style.css', 'style.js', 'style.cjs', ...sharedFiles]) {
  rmSync(join(outputDir, file), { force: true })
}
