import { createRequire } from 'node:module'

for (const name of ['window', 'document', 'navigator']) {
  Reflect.deleteProperty(globalThis, name)
}

if ('window' in globalThis || 'document' in globalThis || 'navigator' in globalThis) {
  throw new Error('El proceso SSR debe ejecutarse sin globals de DOM')
}

const { createSSRApp, h } = await import('vue')
const { renderToString } = await import('vue/server-renderer')
const require = createRequire(import.meta.url)

const locales = [
  { locale: 'es', label: 'Español', shortLabel: 'ES', href: '/es' },
  { locale: 'en', label: 'English', shortLabel: 'EN', href: '/en' }
]

const cases = [
  {
    specifier: '@goastian/astian-ui/input',
    exportName: 'AInput',
    props: { label: 'Nombre', modelValue: 'Astian' },
    expectedMarkup: '<input'
  },
  {
    specifier: '@goastian/astian-ui/textarea',
    exportName: 'ATextarea',
    props: { label: 'Mensaje', modelValue: 'Hola' },
    expectedMarkup: '<textarea'
  },
  {
    specifier: '@goastian/astian-ui/checkbox',
    exportName: 'ACheckbox',
    props: { label: 'Acepto', modelValue: true },
    expectedMarkup: 'type="checkbox"'
  },
  {
    specifier: '@goastian/astian-ui/button',
    exportName: 'AButton',
    props: { label: 'Guardar' },
    slots: { default: () => 'Guardar' },
    expectedMarkup: '<button'
  },
  {
    specifier: '@goastian/astian-ui/marketing-navigation',
    exportName: 'AMarketingNavigation',
    props: {
      ariaLabel: 'Navegación principal',
      mobileTitle: 'Navegación',
      mobileOpenLabel: 'Abrir navegación',
      mobileCloseLabel: 'Cerrar navegación',
      entries: [{ kind: 'link', id: 'home', label: 'Inicio', href: '/' }]
    },
    expectedMarkup: '<nav'
  },
  {
    specifier: '@goastian/astian-ui/locale-switch',
    exportName: 'ALocaleSwitch',
    props: { label: 'Cambiar idioma', currentLocale: 'es', locales },
    expectedMarkup: 'hreflang="es"'
  },
  {
    specifier: '@goastian/astian-ui/marketing-action',
    exportName: 'AMarketingAction',
    props: { href: '/registro' },
    slots: { default: () => 'Crear cuenta' },
    expectedMarkup: '<a'
  }
]

const formats = [
  { name: 'ESM', load: (specifier) => import(specifier) },
  { name: 'CommonJS', load: async (specifier) => require(specifier) }
]

for (const format of formats) {
  const rootModule = await format.load('@goastian/astian-ui')
  if (!rootModule.AstianUI || !rootModule.AInput) {
    throw new Error(`${format.name}: la entrada principal no exporta AstianUI y AInput`)
  }

  for (const testCase of cases) {
    const module = await format.load(testCase.specifier)
    const component = module[testCase.exportName] ?? module.default

    if (!component) {
      throw new Error(`${format.name}: ${testCase.specifier} no exporta ${testCase.exportName}`)
    }

    const app = createSSRApp({
      render: () => h(component, testCase.props, testCase.slots)
    })
    app.config.warnHandler = (message) => {
      if (/Failed to resolve component/i.test(message)) {
        throw new Error(`${format.name}: ${testCase.specifier}: ${message}`)
      }
    }

    const html = await renderToString(app)
    if (!html.includes(testCase.expectedMarkup)) {
      throw new Error(
        `${format.name}: ${testCase.specifier} no produjo markup SSR esperado `
        + `(${testCase.expectedMarkup}): ${html}`
      )
    }
  }
}

console.log(`SSR Node sin DOM: ${cases.length} subpaths × ${formats.length} formatos`)
