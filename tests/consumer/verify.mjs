import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
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
packageJson.dependencies['@astian/astian-ui'] = `file:${join(temporaryDir, tarball)}`
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

execFileSync('npm', ['install'], { cwd: appDir, stdio: 'inherit', env: { ...process.env, npm_config_cache: cacheDir } })
execFileSync('npm', ['run', 'build'], { cwd: appDir, stdio: 'inherit' })
