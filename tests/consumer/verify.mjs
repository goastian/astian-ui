import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const testDir = dirname(fileURLToPath(import.meta.url))
const projectDir = join(testDir, '..', '..')
const temporaryDir = mkdtempSync(join(tmpdir(), 'astian-ui-consumer-'))
const appDir = join(temporaryDir, 'app')
const cacheDir = join(temporaryDir, 'npm-cache')

execFileSync('npm', ['pack', '--pack-destination', temporaryDir], { cwd: projectDir, stdio: 'inherit', env: { ...process.env, npm_config_cache: cacheDir } })
cpSync(join(testDir, 'fixture'), appDir, { recursive: true })
const tarball = readdirSync(temporaryDir).find((file) => file.endsWith('.tgz'))
if (!tarball) throw new Error('npm pack no generó un tarball')

const packagePath = join(appDir, 'package.json')
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'))
packageJson.dependencies['@goastian/astian-ui'] = `file:${join(temporaryDir, tarball)}`
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

execFileSync('npm', ['install'], { cwd: appDir, stdio: 'inherit', env: { ...process.env, npm_config_cache: cacheDir } })

const installedPackageDir = join(appDir, 'node_modules', '@goastian', 'astian-ui')
const installedManifestPath = join(installedPackageDir, 'package.json')
if (!existsSync(installedManifestPath)) {
  throw new Error('El tarball no se instaló como @goastian/astian-ui')
}

const installedManifest = JSON.parse(readFileSync(installedManifestPath, 'utf8'))
if (installedManifest.name !== '@goastian/astian-ui') {
  throw new Error(`Nombre de paquete inesperado: ${installedManifest.name}`)
}

const collectFiles = (directory, predicate) => readdirSync(directory).flatMap((entry) => {
  const path = join(directory, entry)
  return statSync(path).isDirectory()
    ? collectFiles(path, predicate)
    : predicate(path) ? [path] : []
})

const rootExport = installedManifest.exports?.['.']
const cloudExport = installedManifest.exports?.['./cloud']
const componentExports = [
  './input',
  './textarea',
  './checkbox',
  './button',
  './marketing-navigation',
  './locale-switch',
  './marketing-action'
].map((subpath) => ({
  subpath,
  contract: installedManifest.exports?.[subpath]
}))
const styleExport = installedManifest.exports?.['./style.css']
const baseStyleExport = installedManifest.exports?.['./base.css']
const coreStyleExport = installedManifest.exports?.['./core.css']
const cloudStyleExport = installedManifest.exports?.['./cloud.css']
const formsStyleExport = installedManifest.exports?.['./forms.css']
const marketingStyleExport = installedManifest.exports?.['./marketing.css']
const fontsStyleExport = installedManifest.exports?.['./fonts.css']
const tokensStyleExport = installedManifest.exports?.['./tokens.css']

const publishedTargets = [
  ['root ESM', rootExport?.import],
  ['root CommonJS', rootExport?.require],
  ['root types', rootExport?.types],
  ['cloud ESM', cloudExport?.import],
  ['cloud CommonJS', cloudExport?.require],
  ['cloud types', cloudExport?.types],
  ...componentExports.flatMap(({ subpath, contract }) => [
    [`${subpath} ESM`, contract?.import],
    [`${subpath} CommonJS`, contract?.require],
    [`${subpath} types`, contract?.types]
  ]),
  ['compatibility CSS', styleExport],
  ['base CSS', baseStyleExport],
  ['core CSS', coreStyleExport],
  ['cloud CSS', cloudStyleExport],
  ['forms CSS', formsStyleExport],
  ['marketing CSS', marketingStyleExport],
  ['optional fonts CSS', fontsStyleExport],
  ['tokens CSS', tokensStyleExport]
]

for (const [label, target] of publishedTargets) {
  if (typeof target !== 'string' || !target.startsWith('./')) {
    throw new Error(`Export inválido para ${label}: ${String(target)}`)
  }

  const targetPath = resolve(installedPackageDir, target)
  if (!existsSync(targetPath) || !statSync(targetPath).isFile() || statSync(targetPath).size === 0) {
    throw new Error(`El tarball no contiene ${label}: ${target}`)
  }
}

for (const target of [
  styleExport,
  baseStyleExport,
  coreStyleExport,
  cloudStyleExport,
  formsStyleExport,
  marketingStyleExport
]) {
  const css = readFileSync(resolve(installedPackageDir, target), 'utf8')
  if (/@font-face|data:font|base64/i.test(css)) {
    throw new Error(`${target} no es fontless`)
  }
}

const declarationsDir = join(installedPackageDir, 'dist-lib', 'types')
const declarationLeaks = collectFiles(
  declarationsDir,
  (path) => path.endsWith('.d.ts')
).flatMap((path) => {
  const declaration = readFileSync(path, 'utf8')
  const leaksImplementation =
    /(?:@\/|\/home\/|import\s*(?:\(\s*)?['"]@?quasar(?:\/|['"])|from\s+['"]@?quasar(?:\/|['"]))/
  return leaksImplementation.test(declaration)
    ? [path.slice(installedPackageDir.length + 1)]
    : []
})

if (declarationLeaks.length) {
  throw new Error(
    `Las declaraciones públicas filtran paths privados o Quasar:\n${declarationLeaks.join('\n')}`
  )
}

execFileSync(process.execPath, ['ssr-render.mjs'], {
  cwd: appDir,
  stdio: 'inherit'
})

const profileNames = ['baseline', 'input', 'forms', 'marketing']
const profileBudgets = {
  input: { jsGzipDelta: 5_000, cssGzipDelta: 3_000 },
  forms: { jsGzipDelta: 8_000, cssGzipDelta: 3_000 },
  marketing: { jsGzipDelta: 10_000, cssGzipDelta: 3_500 }
}
const viteBin = join(appDir, 'node_modules', 'vite', 'bin', 'vite.js')
const profileResults = {}

for (const profile of profileNames) {
  execFileSync(process.execPath, [viteBin, 'build', '--config', 'vite.profiles.config.mjs'], {
    cwd: appDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production', ASTIAN_CONSUMER_PROFILE: profile }
  })

  const outputDir = join(appDir, 'dist-profiles', profile)
  const moduleGraphPath = join(outputDir, 'module-graph.json')
  if (!existsSync(moduleGraphPath)) {
    throw new Error(`El perfil ${profile} no generó module-graph.json`)
  }

  const modules = JSON.parse(readFileSync(moduleGraphPath, 'utf8'))
    .map((id) => id.replaceAll('\\', '/'))
  const quasarModules = modules.filter((id) => (
    id.includes('/node_modules/quasar/')
    || id.includes('/node_modules/@quasar/')
    || id.includes('/quasar/src/')
  ))
  const monolithicModules = modules.filter((id) => (
    /\/node_modules\/@goastian\/astian-ui\/dist-lib\/(?:astian-ui|cloud)\.(?:js|cjs)(?:\?|$)/.test(id)
  ))

  if (quasarModules.length) {
    throw new Error(
      `El perfil ${profile} incorporó Quasar:\n${quasarModules.join('\n')}`
    )
  }
  if (monolithicModules.length) {
    throw new Error(
      `El perfil ${profile} incorporó una entrada monolítica:\n${monolithicModules.join('\n')}`
    )
  }

  const assets = collectFiles(
    outputDir,
    (path) => path.endsWith('.css') || path.endsWith('.js')
  )
  profileResults[profile] = assets.reduce((result, path) => {
    const kind = path.endsWith('.css') ? 'css' : 'js'
    const content = readFileSync(path)
    result[kind].raw += content.byteLength
    result[kind].gzip += gzipSync(content, { level: 9 }).byteLength
    return result
  }, { css: { raw: 0, gzip: 0 }, js: { raw: 0, gzip: 0 } })
}

const baseline = profileResults.baseline
const profileTable = profileNames.map((profile) => {
  const result = profileResults[profile]
  const jsGzipDelta = result.js.gzip - baseline.js.gzip
  const cssGzipDelta = result.css.gzip - baseline.css.gzip
  const budget = profileBudgets[profile]

  if (budget && jsGzipDelta > budget.jsGzipDelta) {
    throw new Error(
      `El perfil ${profile} supera el delta JS gzip: `
      + `${jsGzipDelta} > ${budget.jsGzipDelta}`
    )
  }
  if (budget && cssGzipDelta > budget.cssGzipDelta) {
    throw new Error(
      `El perfil ${profile} supera el delta CSS gzip: `
      + `${cssGzipDelta} > ${budget.cssGzipDelta}`
    )
  }

  return {
    profile,
    jsRaw: result.js.raw,
    jsGzip: result.js.gzip,
    jsGzipDelta,
    cssRaw: result.css.raw,
    cssGzip: result.css.gzip,
    cssGzipDelta,
    jsDeltaBudget: budget?.jsGzipDelta ?? '-',
    cssDeltaBudget: budget?.cssGzipDelta ?? '-'
  }
})

console.table(profileTable)

execFileSync('npm', ['run', 'build'], { cwd: appDir, stdio: 'inherit' })

const consumerAssets = collectFiles(
  join(appDir, 'dist', 'assets'),
  (path) => path.endsWith('.css') || path.endsWith('.js')
)
const consumerBundle = consumerAssets.reduce(
  (result, path) => {
    const kind = path.endsWith('.css') ? 'css' : 'js'
    const content = readFileSync(path)
    result[kind].raw += content.byteLength
    result[kind].gzip += gzipSync(content, { level: 9 }).byteLength
    return result
  },
  { css: { raw: 0, gzip: 0 }, js: { raw: 0, gzip: 0 } }
)

const consumerBudgets = { css: 60_000, js: 125_000 }
for (const kind of ['css', 'js']) {
  if (consumerBundle[kind].gzip > consumerBudgets[kind]) {
    throw new Error(
      `El bundle consumidor ${kind.toUpperCase()} supera el presupuesto gzip: `
      + `${consumerBundle[kind].gzip} > ${consumerBudgets[kind]}`
    )
  }
}

console.table([
  {
    asset: 'consumer.css',
    raw: consumerBundle.css.raw,
    gzip: consumerBundle.css.gzip,
    budget: consumerBudgets.css
  },
  {
    asset: 'consumer.js',
    raw: consumerBundle.js.raw,
    gzip: consumerBundle.js.gzip,
    budget: consumerBudgets.js
  }
])
