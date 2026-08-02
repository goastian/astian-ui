import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const outputDir = join(process.cwd(), 'dist', 'assets')
const assets = readdirSync(outputDir)
  .filter((name) => !name.endsWith('.map'))
  .map((name) => {
    const content = readFileSync(join(outputDir, name))
    return {
      name,
      raw: content.byteLength,
      gzip: gzipSync(content, { level: 9 }).byteLength
    }
  })

const findAsset = (pattern, label) => {
  const matches = assets.filter(({ name }) => pattern.test(name))
  if (matches.length !== 1) {
    throw new Error(`${label}: se esperaba un asset y se encontraron ${matches.length}`)
  }
  return matches[0]
}

const assertAtMost = (asset, budget, label) => {
  if (asset.gzip > budget) {
    throw new Error(`${label} supera el presupuesto gzip: ${asset.gzip} > ${budget}`)
  }
}

const route = findAsset(/^DesignSystemPage-[\w-]+\.js$/, 'Entrada JS de /ui')
const routeCss = findAsset(/^DesignSystemPage-[\w-]+\.css$/, 'CSS de /ui')
const foundations = findAsset(/^UiFoundationsPanel-[\w-]+\.js$/, 'Panel Fundamentos')
const foundationsCss = findAsset(/^UiFoundationsPanel-[\w-]+\.css$/, 'CSS de Fundamentos')
const components = findAsset(/^UiComponentsPanel-[\w-]+\.js$/, 'Panel Componentes')
const componentsCss = findAsset(/^UiComponentsPanel-[\w-]+\.css$/, 'CSS de Componentes')
const patterns = findAsset(/^UiPatternsPanel-[\w-]+\.js$/, 'Panel Patrones')
const patternsCss = findAsset(/^UiPatternsPanel-[\w-]+\.css$/, 'CSS de Patrones')
const astianGo = findAsset(/^AstianGoPage-[\w-]+\.js$/, 'Entrada JS de /astiango')
const astianGoCss = findAsset(/^AstianGoPage-[\w-]+\.css$/, 'CSS de /astiango')
const calendar = findAsset(/^CalendarPage-[\w-]+\.js$/, 'Entrada JS de /calendar')
const calendarCss = findAsset(/^CalendarPage-[\w-]+\.css$/, 'CSS de /calendar')
const midori = findAsset(/^MidoriPage-[\w-]+\.js$/, 'Entrada JS de /midori')
const midoriCss = findAsset(/^MidoriPage-[\w-]+\.css$/, 'CSS de /midori')
const cloud = findAsset(/^CloudPage-[\w-]+\.js$/, 'Entrada JS inicial de /cloud')
const cloudCss = findAsset(/^CloudPage-[\w-]+\.css$/, 'CSS inicial de /cloud')
const drawer = findAsset(/^ADrawer-[\w-]+\.js$/, 'Drawer diferido de Cloud')
const drawerCss = findAsset(/^ADrawer-[\w-]+\.css$/, 'CSS del drawer diferido de Cloud')
const fileUpload = findAsset(/^AFileUpload-[\w-]+\.js$/, 'Carga diferida de Cloud')
const fileUploadCss = findAsset(/^AFileUpload-[\w-]+\.css$/, 'CSS de carga diferida de Cloud')
const uploadQueue = findAsset(/^AUploadQueue-[\w-]+\.js$/, 'Cola diferida de Cloud')
const uploadQueueCss = findAsset(/^AUploadQueue-[\w-]+\.css$/, 'CSS de cola diferida de Cloud')
const appEntry = findAsset(/^index-[\w-]+\.js$/, 'Entrada compartida de la app')
const appCss = findAsset(/^index-[\w-]+\.css$/, 'CSS compartido de la app')

assertAtMost(route, 6_000, 'Entrada JS de /ui')
assertAtMost(routeCss, 3_000, 'CSS de /ui')
assertAtMost(foundations, 4_000, 'Panel Fundamentos')
assertAtMost(foundationsCss, 3_000, 'CSS de Fundamentos')
assertAtMost(components, 8_000, 'Panel Componentes')
assertAtMost(componentsCss, 3_000, 'CSS de Componentes')
assertAtMost(patterns, 7_000, 'Panel Patrones')
assertAtMost(patternsCss, 3_000, 'CSS de Patrones')
assertAtMost(astianGo, 2_500, 'Entrada JS de /astiango')
assertAtMost(astianGoCss, 1_800, 'CSS de /astiango')
assertAtMost(calendar, 2_500, 'Entrada JS de /calendar')
assertAtMost(calendarCss, 1_800, 'CSS de /calendar')
assertAtMost(midori, 2_500, 'Entrada JS de /midori')
assertAtMost(midoriCss, 1_800, 'CSS de /midori')
assertAtMost(cloud, 20_000, 'Entrada JS inicial de /cloud')
assertAtMost(cloudCss, 6_000, 'CSS inicial de /cloud')
assertAtMost(drawer, 2_500, 'Drawer diferido de Cloud')
assertAtMost(drawerCss, 1_200, 'CSS del drawer diferido de Cloud')
assertAtMost(fileUpload, 4_000, 'Carga diferida de Cloud')
assertAtMost(fileUploadCss, 1_500, 'CSS de carga diferida de Cloud')
assertAtMost(uploadQueue, 2_500, 'Cola diferida de Cloud')
assertAtMost(uploadQueueCss, 1_500, 'CSS de cola diferida de Cloud')
assertAtMost(appEntry, 52_000, 'Entrada compartida de la app')
assertAtMost(appCss, 42_000, 'CSS compartido de la app')

const legacyFonts = assets.filter(({ name }) => name.endsWith('.woff'))
if (legacyFonts.length) {
  throw new Error(`El build de /ui todavía emite WOFF legacy: ${legacyFonts.map(({ name }) => name).join(', ')}`)
}

const materialWoff2 = assets.filter(({ name }) => name.endsWith('.woff2'))
if (materialWoff2.length !== 1 || statSync(join(outputDir, materialWoff2[0].name)).size > 180_000) {
  throw new Error('El shell debe emitir un único Material Icons Round WOFF2 de hasta 180 KB')
}

const report = [
  appEntry,
  appCss,
  route,
  routeCss,
  foundations,
  foundationsCss,
  components,
  componentsCss,
  patterns,
  patternsCss,
  astianGo,
  astianGoCss,
  calendar,
  calendarCss,
  midori,
  midoriCss,
  cloud,
  cloudCss,
  drawer,
  drawerCss,
  fileUpload,
  fileUploadCss,
  uploadQueue,
  uploadQueueCss
]
console.table(report)
console.log(`Overhead propio de /ui (entrada + CSS): ${route.gzip + routeCss.gzip} bytes gzip`)
console.log('Los paneles se presupuestan por separado porque Vite los carga bajo demanda.')
console.log('Cloud difiere drawer, selector y cola hasta que el usuario inicia una carga.')
