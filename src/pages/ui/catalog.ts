import { publicComponentNames } from '@/migration/publicComponentNames'

export const uiVersion = __ASTIAN_UI_VERSION__

export type UiCatalogCategory = 'foundations' | 'components' | 'patterns'

export interface UiCatalogEntry {
  name: string
  label: string
  category: UiCatalogCategory
  summary: string
  importPath: string
  anchor: string
  searchText: string
}

export interface UiCatalogCategorySpec {
  id: UiCatalogCategory
  label: string
  description: string
}

export const catalogCategories: readonly UiCatalogCategorySpec[] = [
  {
    id: 'foundations',
    label: 'Fundamentos',
    description: 'Tokens, tipografía, superficies e iconografía.'
  },
  {
    id: 'components',
    label: 'Componentes',
    description: 'Controles y estados para interfaces de producto.'
  },
  {
    id: 'patterns',
    label: 'Patrones',
    description: 'Composiciones accesibles para navegación, datos y marketing.'
  }
] as const

const foundationComponents = new Set([
  'ADivider',
  'AIcon',
  'AIconText',
  'AKeyCodeSequence',
  'AMonoTag',
  'APortal',
  'ASurface',
  'ATypography'
])

const patternComponents = new Set([
  'AAppShell',
  'ABreadcrumbs',
  'AContextMenu',
  'ADataTable',
  'ADrawer',
  'ADropzone',
  'AEmptyState',
  'AErrorState',
  'AFileUpload',
  'ALocaleSwitch',
  'AMarketingAction',
  'AMarketingNavigation',
  'ANavItem',
  'ANavigationRail',
  'APagination',
  'APopover',
  'ASidePanel',
  'ASidebar',
  'AStepper',
  'AUploadQueue'
])

const summaryByComponent: Readonly<Partial<Record<string, string>>> = {
  AAppShell: 'Shell con landmarks, navegación y foco de ruta.',
  AButton: 'Acción de formulario o navegación con estados explícitos.',
  ACheckbox: 'Selección booleana nativa, etiquetada y SSR segura.',
  ACombobox: 'Búsqueda y selección con patrón combobox accesible.',
  ADataTable: 'Datos tabulares con orden y selección controlados.',
  ADrawer: 'Panel lateral con Escape, foco y restauración.',
  AEmptyState: 'Ausencia de contenido con siguiente acción clara.',
  AErrorState: 'Fallo recuperable con mensaje y reintento.',
  AFileUpload: 'Selección de archivos con validación presentacional.',
  AInput: 'Entrada HTML semántica, ligera y segura durante SSR.',
  ALocaleSwitch: 'Idiomas mediante enlaces reales y hreflang.',
  AMarketingAction: 'Enlace de marketing para HTML, Inertia o URL externa.',
  AMarketingNavigation: 'Navegación de marketing para desktop y drawer móvil.',
  ANavigationRail: 'Navegación agrupada con destino activo y teclado.',
  APagination: 'Navegación de páginas con estado controlado.',
  APopover: 'Contenido interactivo anclado con cierre accesible.',
  ASurface: 'Superficie semántica con niveles de elevación discretos.',
  ATextarea: 'Texto multilínea nativo con ayuda y validación.',
  ATypography: 'Escala tipográfica y tonos semánticos del sistema.',
  AUploadQueue: 'Progreso de cargas administrado por el producto.'
}

const subpathByComponent: Readonly<Partial<Record<string, string>>> = {
  AButton: '@goastian/astian-ui/button',
  ACheckbox: '@goastian/astian-ui/checkbox',
  AInput: '@goastian/astian-ui/input',
  ALocaleSwitch: '@goastian/astian-ui/locale-switch',
  AMarketingAction: '@goastian/astian-ui/marketing-action',
  AMarketingNavigation: '@goastian/astian-ui/marketing-navigation',
  ATextarea: '@goastian/astian-ui/textarea'
}

const defaultSummary: Record<UiCatalogCategory, string> = {
  foundations: 'Primitiva visual y semántica del lenguaje Astian.',
  components: 'Control reutilizable con estado y accesibilidad integrados.',
  patterns: 'Composición de interfaz con comportamiento accesible.'
}

const categoryOrder: Record<UiCatalogCategory, number> = {
  foundations: 0,
  components: 1,
  patterns: 2
}

const categoryFor = (name: string): UiCatalogCategory => {
  if (foundationComponents.has(name)) return 'foundations'
  if (patternComponents.has(name)) return 'patterns'
  return 'components'
}

const labelFor = (name: string) => name
  .replace(/^A/, '')
  .replace(/([a-z\d])([A-Z])/g, '$1 $2')

const normalizeSearch = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es')
  .trim()

export const componentCatalog: readonly UiCatalogEntry[] = publicComponentNames
  .map((name): UiCatalogEntry => {
    const category = categoryFor(name)
    const label = labelFor(name)
    const summary = summaryByComponent[name] ?? defaultSummary[category]
    const importPath = subpathByComponent[name] ?? '@goastian/astian-ui'

    return {
      name,
      label,
      category,
      summary,
      importPath,
      anchor: `ui-${category}`,
      searchText: normalizeSearch(`${name} ${label} ${summary} ${category} ${importPath}`)
    }
  })
  .sort((left, right) => categoryOrder[left.category] - categoryOrder[right.category]
    || left.name.localeCompare(right.name))

export const filterComponentCatalog = (query: string) => {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return componentCatalog
  return componentCatalog.filter(({ searchText }) => terms.every((term) => searchText.includes(term)))
}

export const getCatalogCategory = (category: UiCatalogCategory) => catalogCategories
  .find(({ id }) => id === category)
