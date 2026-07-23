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
const styleExport = installedManifest.exports?.['./style.css']

const publishedTargets = [
  ['root ESM', rootExport?.import],
  ['root CommonJS', rootExport?.require],
  ['root types', rootExport?.types],
  ['cloud ESM', cloudExport?.import],
  ['cloud CommonJS', cloudExport?.require],
  ['cloud types', cloudExport?.types],
  ['shared CSS', styleExport]
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

execFileSync('npm', ['run', 'build'], { cwd: appDir, stdio: 'inherit' })
