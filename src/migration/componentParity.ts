import { publicComponentNames } from './publicComponentNames'

export type MigrationStrategy = 'ported' | 'adapted' | 'quasar-native'

export interface ComponentParityEntry {
  source: string
  targets: string[]
  strategy: MigrationStrategy
  contract: string
  verification: string
}

/**
 * Inventario canónico de las 28 familias públicas del paquete React original.
 * Una entrada sólo puede considerarse migrada si tiene destino, decisión de
 * contrato y una forma concreta de verificación.
 */
export const componentParity: ComponentParityEntry[] = [
  { source: 'Avatar', targets: ['AAvatar'], strategy: 'ported', contract: 'Iniciales, imagen, seis tamaños, color, estado, badge y forma.', verification: 'Catálogo responsive y estados de identidad.' },
  { source: 'Banner', targets: ['ABanner'], strategy: 'ported', contract: 'Mensaje, tono, icono, acciones y cierre.', verification: 'Catálogo, interacción de cierre y regresión visual.' },
  { source: 'Button', targets: ['AButton', 'AIconButton'], strategy: 'adapted', contract: 'Jerarquías, tamaños, icono, carga, disabled, ancho y tooltip; eventos Vue sustituyen handlers React.', verification: 'Estados del catálogo, accesibilidad del botón de icono y regresión visual.' },
  { source: 'ButtonGroup', targets: ['AButtonGroup'], strategy: 'adapted', contract: 'Layout inline/stacked, alineación y ancho completo por slots.', verification: 'Catálogo responsive.' },
  { source: 'ButtonGroupItem', targets: ['AButtonGroupItem'], strategy: 'ported', contract: 'Acción declarativa con label, icono, tipo, carga, disabled y hidden.', verification: 'Catálogo de API y prueba de exportación.' },
  { source: 'Chip', targets: ['AChip'], strategy: 'ported', contract: 'Etiqueta, icono/avatar, tonos, selección y eliminación.', verification: 'Catálogo de estados y regresión visual.' },
  { source: 'CircularProgress', targets: ['ACircularProgress'], strategy: 'quasar-native', contract: 'Progreso determinado y spinner con tamaños equivalentes.', verification: 'Catálogo de carga y prueba funcional.' },
  { source: 'CodeInput', targets: ['ACodeInput'], strategy: 'ported', contract: 'Longitud, texto/número, pegado, teclado, error, carga y envío automático.', verification: 'Pruebas de entrada, pegado y submit.' },
  { source: 'Dialog', targets: ['ADialog'], strategy: 'quasar-native', contract: 'Modelo controlado, variantes, scrim, Escape, persistencia, carga y fullscreen.', verification: 'Pruebas de apertura/cierre y catálogo de overlays.' },
  { source: 'Divider', targets: ['ADivider'], strategy: 'ported', contract: 'Orientación, inset y énfasis semántico.', verification: 'Catálogo y regresión visual.' },
  { source: 'Dropdown', targets: ['ADropdown'], strategy: 'quasar-native', contract: 'Modelo controlado, anclaje, offset, dimensiones, auto-close y portal.', verification: 'Catálogo de overlays y navegación Quasar.' },
  { source: 'DropdownItem', targets: ['ADropdownItem'], strategy: 'ported', contract: 'Label, caption, icono, shortcut, active, disabled y destructivo.', verification: 'Catálogo de overlays.' },
  { source: 'DropdownSubmenu', targets: ['ADropdownSubmenu'], strategy: 'quasar-native', contract: 'Submenú por hover/click con salida y posicionamiento administrados por Quasar.', verification: 'Catálogo exhaustivo y prueba de exportación.' },
  { source: 'Facepile', targets: ['AFacepile'], strategy: 'ported', contract: 'Personas, layouts inline/stacked, límite visible y acción more.', verification: 'Catálogo responsive.' },
  { source: 'IconText', targets: ['AIconText'], strategy: 'ported', contract: 'Iconos inicial/final, tono, tamaño, variante, disabled e interacción.', verification: 'Catálogo de acciones.' },
  { source: 'Icons', targets: ['AIcon'], strategy: 'adapted', contract: 'Material Icons Round común y modo legacy para los 302 SVG originales.', verification: 'Pruebas anti-ligadura, inventario de assets y matriz visual.' },
  { source: 'InputField', targets: ['AInput', 'ATextarea'], strategy: 'adapted', contract: 'Modelo Vue, label, hint, error, adornos, tipos, readonly, autogrow y eventos DOM.', verification: 'Catálogo de formulario y pruebas de estados.' },
  { source: 'KeyCodeSequence', targets: ['AKeyCodeSequence'], strategy: 'ported', contract: 'Atajo tokenizado y cuatro tamaños.', verification: 'Catálogo tipográfico.' },
  { source: 'MonoTag', targets: ['AMonoTag'], strategy: 'ported', contract: 'Etiqueta mono, icono y tono semántico.', verification: 'Catálogo de acciones.' },
  { source: 'Portal', targets: ['APortal'], strategy: 'quasar-native', contract: 'Teleport nativo configurable y desactivable.', verification: 'Prueba de destino del portal y catálogo exhaustivo.' },
  { source: 'Select', targets: ['ASelect'], strategy: 'quasar-native', contract: 'Modelo controlado, opciones ricas, filtro, múltiple, clearable, tamaños y disabled.', verification: 'Catálogo de formulario y prueba funcional.' },
  { source: 'Skeleton', targets: ['ASkeleton'], strategy: 'quasar-native', contract: 'Dimensiones, formas y animaciones de carga.', verification: 'Catálogo de identidad y regresión visual.' },
  { source: 'Surface', targets: ['ASurface'], strategy: 'adapted', contract: 'Niveles semánticos, padding, interacción, glass y elemento HTML configurable.', verification: 'Todas las aplicaciones base y regresión visual.' },
  { source: 'Tabs', targets: ['ATabs'], strategy: 'quasar-native', contract: 'Modelo controlado, tamaños, iconos, badges, ancho y orientación.', verification: 'Catálogo, cambio de modelo y regresión visual.' },
  { source: 'Toast', targets: ['AToast'], strategy: 'adapted', contract: 'Título, cuerpo, icono, imagen, acciones, cierre y servicio global Notify.', verification: 'Prueba funcional y catálogo exhaustivo.' },
  { source: 'Toggle', targets: ['AToggle'], strategy: 'quasar-native', contract: 'Modelo booleano, label, tamaños, disabled y label izquierdo.', verification: 'Catálogo y prueba de modelo.' },
  { source: 'Tooltip', targets: ['ATooltip'], strategy: 'quasar-native', contract: 'Título, shortcut, cuatro posiciones y demora.', verification: 'Catálogo de overlays y foco/hover nativos.' },
  { source: 'Typography', targets: ['ATypography'], strategy: 'ported', contract: 'Escala, pesos, tonos, alineación, transformaciones, mono, truncado, ancho y elemento HTML.', verification: 'Catálogo tipográfico y regresión visual.' }
]

export const originalComponentFamilies = componentParity.map(({ source }) => source)

/**
 * Primitivas y aliases públicos nacidos en Vue. No se añaden a la matriz de
 * 28 familias React porque no representan una migración uno-a-uno.
 */
export const vueNativePublicComponents = [
  'AAppShell',
  'ABreadcrumbs',
  'ACheckbox',
  'ACheckboxGroup',
  'ACombobox',
  'AContextMenu',
  'ADataTable',
  'ADrawer',
  'ADropzone',
  'AEmptyState',
  'AErrorState',
  'AFileUpload',
  'ALinearProgress',
  'ALocaleSwitch',
  'AMarketingAction',
  'AMarketingNavigation',
  'ANavItem',
  'ANavigationRail',
  'APagination',
  'APopover',
  'AQuotaMeter',
  'ARadio',
  'ARadioGroup',
  'ASearchAutocomplete',
  'ASidePanel',
  'ASidebar',
  'AStepper',
  'AUploadQueue'
]

export const migratedPublicComponents: readonly string[] = publicComponentNames
