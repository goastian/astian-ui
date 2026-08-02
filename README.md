# Astian UI

Sistema de diseño de AstianGO, Astian Cloud, Calendar, Midori y futuros productos
Astian. El paquete `@goastian/astian-ui` está construido con Vue 3, Quasar y
TypeScript.

La documentación describe la superficie disponible en este repositorio. No
implica que una versión nueva ya haya sido publicada en npm.

## Requisitos

- Vue `^3.5.0`.
- Quasar `^2.16.0` para la entrada convencional y los patrones Cloud. Es un
  peer opcional para los subpaths nativos de formularios y marketing.
- Node `^20.19.0` o `>=22.12.0` para desarrollar y construir el paquete.
- Una única instalación de Quasar en el punto de entrada cuando el producto
  consume `@goastian/astian-ui` o `@goastian/astian-ui/cloud`.

Quasar es una dependencia peer: Astian UI puede usarlo internamente, pero ningún
componente `Q*`, ref interna o detalle de su DOM forma parte del contrato público.

## Desarrollo local

```bash
cd astian-ui
npm install
npm run dev
```

Validación de producción:

```bash
npm run build
```

El build genera `dist` para las aplicaciones de referencia y `dist-lib` para el
paquete reutilizable en ESM, CommonJS, CSS y declaraciones TypeScript.

Rutas de referencia:

- `/ui`: catálogo interactivo del sistema de diseño.
- `/astiango`: aplicación base de búsqueda.
- `/cloud`: aplicación base de archivos.
- `/calendar`: aplicación base de calendario.
- `/midori`: aplicación base de navegador.
- `/marketing-preview`: referencia de navegación, locale y acciones responsive.

## Entradas públicas

| Import | Contenido |
| --- | --- |
| `@goastian/astian-ui` | Primitivas y patrones reutilizables del núcleo P0, tipos, composables y plugin `AstianUI`. |
| `@goastian/astian-ui/cloud` | Patrones P1 y tipos propios de Astian Cloud. No se registran globalmente con `AstianUI`. |
| `@goastian/astian-ui/input` | `AInput` nativo, SSR-safe y sin dependencia de Quasar. |
| `@goastian/astian-ui/textarea` | `ATextarea` nativo, SSR-safe y sin dependencia de Quasar. |
| `@goastian/astian-ui/checkbox` | `ACheckbox` nativo, SSR-safe y sin dependencia de Quasar. |
| `@goastian/astian-ui/button` | `AButton` nativo para formularios, SSR-safe y sin dependencia de Quasar. |
| `@goastian/astian-ui/marketing-navigation` | `AMarketingNavigation` y sus tipos, sin Vue Router ni Quasar. |
| `@goastian/astian-ui/locale-switch` | `ALocaleSwitch` con URLs de servidor, `hreflang` y `aria-current`. |
| `@goastian/astian-ui/marketing-action` | `AMarketingAction` para enlaces nativos o `Link` de Inertia. |
| `@goastian/astian-ui/base.css` | Tokens y estilos globales mínimos. No incluye componentes ni fuentes. |
| `@goastian/astian-ui/core.css` | Estilos de las primitivas del núcleo. |
| `@goastian/astian-ui/cloud.css` | Estilos exclusivos de los patrones Cloud; se usa junto con `base.css` y `core.css`. |
| `@goastian/astian-ui/forms.css` | Estilos aislados de los cuatro controles nativos. Se usa con `tokens.css`, sin reset global. |
| `@goastian/astian-ui/marketing.css` | Estilos aislados de navegación, locale y acciones. Se usa con `tokens.css`, sin reset global. |
| `@goastian/astian-ui/fonts.css` | Material Icons Round y su WOFF2 externo. Es opt-in. |
| `@goastian/astian-ui/style.css` | Entrada de compatibilidad fontless con base, núcleo y Cloud. Para código nuevo se prefieren las entradas segmentadas. |
| `@goastian/astian-ui/tokens.css` | Tokens `--a-*` sin el resto de estilos del paquete. |
| `@goastian/astian-ui/icons/*` | Recursos legacy que el consumidor todavía necesite copiar a su directorio público. |

La entrada `./cloud` permite que un producto que solo necesita el núcleo no
incorpore JavaScript ni CSS de almacenamiento. Los subpaths nativos permiten
consumir formularios y marketing sin cargar el entrypoint monolítico, Quasar,
Roboto, Material Icons ni su reset. Todas las entradas de estilo son fontless
salvo `fonts.css`; no contienen WOFF en base64.

## Configuración del consumidor

En la integración convencional, Quasar debe instalarse antes de `AstianUI`. El
plugin registra los componentes del núcleo y configura el mapeo de Material
Icons Round:

```ts
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import 'quasar/src/css/index.sass'

import { AstianUI } from '@goastian/astian-ui'
import '@goastian/astian-ui/base.css'
import '@goastian/astian-ui/core.css'

import App from './App.vue'

const app = createApp(App)

app.use(Quasar)
app.use(AstianUI)
app.mount('#app')
```

Un producto que usa Cloud añade:

```ts
import '@goastian/astian-ui/cloud.css'
```

Material Icons Round ya no se descarga por defecto. Si la aplicación conserva
el icon set basado en ligaduras, debe optar por la fuente:

```ts
import '@goastian/astian-ui/fonts.css'
```

`fonts.css` usa `font-display: block` para que las ligaduras no aparezcan como
texto durante la carga. Una aplicación con iconos SVG puede omitirlo.

También se pueden importar componentes concretos sin depender del registro
global:

```vue
<script setup lang="ts">
import {
  AAppShell,
  ACombobox,
  ADrawer
} from '@goastian/astian-ui'
import {
  ACloudToolbar,
  AFileGrid,
  AFolderPicker,
  type ACloudItem,
  type AFolderTreeNode
} from '@goastian/astian-ui/cloud'
</script>
```

### Formularios nativos sin Quasar

Los cuatro controles P0 ligeros usan HTML semántico. Un formulario público sólo
necesita los tokens, el CSS aislado y los subpaths que realmente renderiza:

```ts
import '@goastian/astian-ui/tokens.css'
import '@goastian/astian-ui/forms.css'

import { AButton } from '@goastian/astian-ui/button'
import { ACheckbox } from '@goastian/astian-ui/checkbox'
import { AInput } from '@goastian/astian-ui/input'
import { ATextarea } from '@goastian/astian-ui/textarea'
```

No se debe importar `base.css`, `style.css`, `quasar/src/css/index.sass` ni
`fonts.css` para esta ruta. `AButton` usa `nativeType="submit"` para el tipo
HTML; su prop `type` sigue representando la variante visual. Los slots
`icon-start`, `icon-end`, `prepend` y `end-icon` permiten usar SVG del producto
sin descargar una fuente de iconos. Si Vue Router ya está instalado, `AButton`
mantiene navegación SPA para `to`; sin Router registrado usa un enlace nativo.
Los props de icono por nombre quedan para la integración convencional que sí
opta por `fonts.css`; en la ruta modular se recomiendan los slots SVG.

### SSR e Inertia sin Vue Router

Las entradas nuevas pueden evaluarse y renderizarse en Node sin `window`,
`document` ni `navigator`. Este ejemplo usa Vue SSR directamente:

```ts
import { renderToString } from 'vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { AInput } from '@goastian/astian-ui/input'

const app = createSSRApp({
  render: () => h(AInput, {
    label: 'Título',
    name: 'title',
    modelValue: 'Borrador'
  })
})

const html = await renderToString(app)
```

En Inertia se inyecta `Link` como renderer. Astian UI siempre entrega `href` y
no importa ni configura Vue Router:

```vue
<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import {
  ALocaleSwitch,
  type ALocaleOption
} from '@goastian/astian-ui/locale-switch'
import { AMarketingAction } from '@goastian/astian-ui/marketing-action'
import {
  AMarketingNavigation,
  type AMarketingNavEntry
} from '@goastian/astian-ui/marketing-navigation'

import '@goastian/astian-ui/tokens.css'
import '@goastian/astian-ui/marketing.css'

const entries: AMarketingNavEntry[] = [
  { kind: 'link', id: 'inicio', label: 'Inicio', href: '/' },
  {
    kind: 'menu',
    id: 'productos',
    label: 'Productos',
    columns: [
      {
        id: 'privacidad',
        label: 'Privacidad',
        items: [
          { id: 'midori', label: 'Midori', href: '/midori', description: 'Navegación privada' }
        ]
      },
      {
        id: 'servicios',
        label: 'Servicios',
        items: [
          { id: 'cloud', label: 'Astian Cloud', href: '/cloud', description: 'Archivos protegidos' }
        ]
      }
    ],
    cta: { id: 'todos', label: 'Ver productos', href: '/productos' }
  }
]

const locales: ALocaleOption[] = [
  { locale: 'es', label: 'Español', shortLabel: 'ES', href: '/es/cms' },
  { locale: 'en', label: 'English', shortLabel: 'EN', href: '/en/cms' }
]
</script>

<template>
  <AMarketingNavigation :entries="entries" :link-component="Link">
    <template #brand><Link href="/">Astian</Link></template>
  </AMarketingNavigation>
  <ALocaleSwitch
    :locales="locales"
    current-locale="es"
    :link-component="Link"
  />
  <AMarketingAction href="/registro" :link-component="Link">
    Crear cuenta
  </AMarketingAction>
</template>
```

Las URLs de locale deben llegar del servidor con la ruta equivalente, query y
fragmento ya resueltos. Si un enlace es externo, descarga un archivo o abre
`target="_blank"`, el componente usa un `<a>` nativo. En pestaña nueva fusiona
`noopener noreferrer` con el `rel` proporcionado.

El alias interno `@` apunta a `src` durante el desarrollo del repositorio. No es
un alias público: los consumidores deben usar las entradas del paquete.

### Aliases públicos

Los aliases conservan el mismo componente y contrato; no son implementaciones
duplicadas.

| Alias | Implementación |
| --- | --- |
| `ASidebar` | `ANavigationRail` |
| `ASidePanel` | `ADrawer` |
| `ASearchAutocomplete` | `ACombobox` |
| `AColorPicker` | `ASwatchPicker` desde `./cloud` |
| `AMetricCard` | `AStatCard` desde `./cloud` |

## Inventario P0: núcleo reutilizable

| Familia | Responsabilidad y contrato controlado |
| --- | --- |
| `AAppShell` | Regiones `header`, `navigation`, contenido principal y `aside`; skip link y foco opcional al cambiar `routeKey`. No contiene lógica de sesión ni de producto. |
| `ANavigationRail`, `ANavItem`, `ABreadcrumbs` | Navegación por `to` o `href`, nunca ambos. El rail controla `v-model:collapsed` y `v-model:mobile-open`; emite `select`. Los elementos emiten `activate`/`navigate` sin ejecutar lógica de negocio. |
| `ADrawer`, `APopover`, `AContextMenu` | Overlays controlados con `v-model`; emiten apertura, cierre o selección. `ADrawer` puede ser modal o no modal y reporta el motivo de cierre. |
| `ACheckbox`, `ACheckboxGroup` | `v-model` booleano o colección tipada; soportan indeterminado, hint, error y disabled. |
| `ARadio`, `ARadioGroup` | Selección excluyente por `v-model` tipado; opciones con descripción, orientación, `readonly`, validación y navegación por flechas, `Home`, `End` y espacio. |
| `AInput`, `ATextarea`, `AButton` | Controles HTML nativos, aislados de Quasar y seguros en SSR. `AInput` conserva `date` y `datetime-local` como strings locales; `AButton` separa variante visual de `nativeType`. |
| `AStepper` | Colección de pasos y `v-model:activeStep`; emite `next`, `back`, `cancel`, `complete` y `step-request`. La aplicación valida y navega. No se publica `AWizard` hasta validar una composición adicional real. |
| `ALinearProgress`, `AQuotaMeter` | Progreso determinado o indeterminado, rango y estado semántico. La cuota recibe `used`/`limit` y permite formateo externo. |
| `AEmptyState`, `AErrorState` | Presentación de estados sin copy de producto obligatorio. `AErrorState` emite `retry`; ambos exponen slots para acciones controladas por el consumidor. |
| `ACombobox` | Selección por `v-model`, opciones locales o loader asíncrono cancelable con `AbortSignal`; emite `select` y `clear`. |
| `ADataTable` | Columnas y filas tipadas, sorting, selección, acciones y estados `loading`/`empty`/`error`. La fuente de verdad entra por `selected` y `sort`; los cambios salen por `update:selected`, `update:sort`, `row-activate` y `retry`. |
| `APagination` | `v-model` discriminado para página o cursor; emite `change` y puede sincronizar página/tamaño con el query string. |
| `ADropzone`, `AFileUpload` | Selección, drag and drop, URL opcional y validadores cancelables. Controlan archivos/URL con `v-model` y emiten `accepted`, `rejected`, `validated`, `remove` o `submit`; no suben archivos. |
| `AUploadQueue` | Renderiza progreso global y por archivo; recibe los items y emite `pause`, `resume`, `cancel` y `retry`. No conoce el transporte. |

## Inventario P1: marketing

Estos componentes viven también en la entrada raíz por compatibilidad, pero el
camino recomendado para una web pública son sus subpaths y `marketing.css`.

| Familia | Responsabilidad y contrato controlado |
| --- | --- |
| `AMarketingNavigation` | Recibe enlaces directos o menús con columnas; controla `v-model:open-menu` y `v-model:mobile-open`. Abre por click, hover intencional o teclado; cierra por `Escape`, click exterior, salida de foco o navegación. El panel desktop usa dos columnas y el drawer móvil contiene y restaura foco. Expone slots `brand`, `item-icon`, `item-name`, `item-description`, `cta`, `header-actions` y `mobile-header`. |
| `ALocaleSwitch` | Recibe URLs equivalentes generadas por servidor y publica enlaces con `href`, `hreflang`, `lang` y `aria-current="page"`. Usa lista inline hasta tres locales y disclosure compacto para cuatro o más. |
| `AMarketingAction` | Enlace semántico primario o secundario con texto en una línea y slots `icon-start`/`icon-end`. Acepta `<a>` nativo o un `linkComponent` como `Link` de Inertia, sin asumir Vue Router. |

## Inventario P1: Astian Cloud

Estos patrones se importan exclusivamente desde `@goastian/astian-ui/cloud`.

| Familia | Responsabilidad y contrato controlado |
| --- | --- |
| `ACloudPageHeader`, `ACloudToolbar` | Título, contexto y composición de búsqueda, creación, filtros, orden y vista. La toolbar controla `v-model:search`, `v-model:view` y `v-model:sort`; emite intenciones de crear, filtrar o buscar. |
| `AFileItem`, `AFileCard`, `AFolderItem` | Presentan archivo/carpeta y aceptan el mismo contrato DnD controlado. La acción visible “Mover…” ofrece alternativa operable por teclado. |
| `AFileGrid`, `AFileTable` | Vistas grid/list controladas mediante `selectedIds`, `activeId` y, en tabla, `sort`. El grid puede activar `selectionInteraction="marquee"` sin crear otro modelo de selección. |
| `AFolderTree`, `AFolderPicker` | Jerarquía controlada y destino DnD. `Alt+M` emite `move-request`; el consumidor puede abrir `AFolderPicker` como alternativa al puntero. |
| `AMediaGrid`, `APhotoTile` | Galería responsive y selección múltiple controlada; `AMediaGrid` comparte el contrato marquee del grid de archivos. |
| `AMediaViewer`, `AFilePreview` | Imagen, PDF, audio, video o fallback. Controlan apertura/zoom y emiten navegación, descarga, carga, error o reintento. La URL y sus permisos pertenecen al consumidor. |
| `AFileDetailsPanel` | Panel controlado mediante `v-model` y `v-model:active-section`. Monta progresivamente slots `details`, `tags`, `permissions`, `comments`, `versions` y `activity`; emite `sectionChange`, `retry` y `close`. |
| `ANotificationCenter` | Recibe notificaciones y estado de conexión; emite lectura, acción, reintento y carga adicional. No abre sockets ni hace polling. |
| `AStatCard` (`AMetricCard`) | Presenta cuota, actividad o métricas con números tabulares, tendencia y progreso. |
| `ASwatchPicker` (`AColorPicker`) | Selección por `v-model` de swatches tokenizados con nombre accesible; el color nunca es el único indicador. |

Los tipos `ACloudItem`, `ACloudFile`, `ACloudFolder`, `AFolderTreeNode`,
`ACloudMedia`, `AFilePreviewSource`, `ACloudNotification` y `ACloudMetric`
también salen de `./cloud`.

### Drag and drop interno

`ACloudDragPayload`, `ACloudDropTarget`, `ACloudDropPosition`,
`ACloudDropEffect` y `ACloudDropState` forman el contrato público. Los
componentes emiten `drag-start`, `drag-end`, `drop-target-change` y
`drop-request`; nunca cambian la colección por su cuenta. El consumidor valida
permisos, cifrado, conflictos y API y mantiene `dropState="pending"` hasta la
confirmación. `invalid` comunica rechazo sin simular una operación completada.

### Selección marquee

`AFileGrid` y `AMediaGrid` aceptan `selectionInteraction="marquee"`. El
resultado sigue en `v-model:selectedIds`; `selection-start`,
`selection-change` y `selection-end` sirven para telemetría o barras de acción.
Shift añade, Ctrl/Cmd alterna, Escape cancela y Ctrl/Cmd+A selecciona los
elementos habilitados. La interacción ignora controles internos y punteros
táctiles.

## Contratos controlados y eventos

Astian UI presenta estado y emite intenciones. El consumidor conserva la fuente
de verdad y aplica el cambio cuando su dominio lo permite:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  AFolderPicker,
  type AFolderTreeNode
} from '@goastian/astian-ui/cloud'

const selectedId = ref<string | number | null>(null)
const expandedIds = ref<Array<string | number>>([])
const activeId = ref<string | number | null>(null)
const folders = ref<AFolderTreeNode[]>([])

function requestChildren(node: AFolderTreeNode) {
  // El dominio carga los hijos y actualiza `folders`.
}

function confirmDestination(node: AFolderTreeNode) {
  // El dominio valida permisos y ejecuta mover/copiar.
}
</script>

<template>
  <AFolderPicker
    v-model:selected-id="selectedId"
    v-model:expanded-ids="expandedIds"
    v-model:active-id="activeId"
    :nodes="folders"
    @load-children="requestChildren"
    @confirm="confirmDestination"
  />
</template>
```

Los eventos no garantizan que una operación haya terminado. Por ejemplo,
`submit`, `download`, `pause` o `confirm` expresan intención; el padre debe
actualizar `loading`, `error`, progreso, permisos o la colección resultante.

## Límites de responsabilidad

Astian UI no contiene:

- Axios, `fetch` ni otro cliente de red.
- Stores de Pinia ni estado global de Astian Cloud.
- Cifrado, sincronización, resolución de permisos o reglas de negocio.
- Transporte de subida, polling, WebSocket o persistencia.
- Copy obligatorio de producto dentro de las primitivas del núcleo.

Los componentes de upload reciben `File`, validadores y estado; los visores
reciben fuentes ya autorizadas; los componentes de archivo reciben modelos
presentacionales y emiten acciones. El producto decide si una acción es válida,
ejecuta la API y devuelve el nuevo estado.

## Tokens, temas y Quasar

Los tokens viven en `src/css/tokens.css`, los estilos globales en
`src/css/astian.scss` y las variables de integración con Quasar en
`src/css/quasar.variables.scss`.

- Todo color, espacio, radio, sombra, tamaño de control y movimiento debe usar
  un token `--a-*`.
- Los componentes admiten `light`, `dark` y `system` mediante
  `useThemeMode`, que sincroniza la preferencia con Quasar Dark.
- No se debe sobrescribir el DOM interno de Quasar ni usar clases `q-*` como
  contrato desde una aplicación consumidora.
- `AIcon` usa Material Icons Round. Los SVG legacy se activan con
  `<AIcon name="shield-encrypt" legacy />` y deben copiarse desde
  `dist-lib/icons` a `/icons` cuando todavía sean necesarios.

## Teclado y accesibilidad

Los componentes interactivos reservan targets de al menos `--a-target-min`
(44 × 44 px), foco visible y nombres accesibles. La integración consumidora debe
conservar labels, estados y orden de foco.

- `AAppShell` ofrece skip link y puede enfocar el contenido al cambiar de ruta.
- Árboles: flechas arriba/abajo recorren nodos visibles; derecha
  expande/entra, izquierda contrae/vuelve al padre; `Home`, `End`, `Enter`,
  espacio, `*` y búsqueda por escritura conservan el patrón ARIA tree.
- Comboboxes y menús usan navegación por flechas, `Home`/`End`,
  `Enter`/espacio y `Escape` según el patrón correspondiente.
- Los grupos de radio recorren sólo opciones habilitadas con flechas,
  `Home`/`End` y seleccionan con espacio.
- Los steppers anuncian el paso activo en una live region; una solicitud de
  cambio no mueve el foco ni modifica la navegación del producto.
- `AContextMenu` se puede abrir con click derecho, `Shift+F10` o la tecla de
  menú contextual y devuelve el foco al disparador.
- Drawers y visores modales contienen el foco; los no modales no lo atrapan.
  Los overlays cierran con `Escape` cuando está habilitado y restauran foco.
- La navegación marketing usa listas y disclosures nativos, panel de dos
  columnas desde 768 px y drawer hasta 767 px. `Tab` conserva el orden web;
  flechas, `Home`, `End` y `Escape` administran el contexto abierto.
- Los selectores de idioma conservan enlaces reales aunque se mejore su
  presentación como disclosure.
- Reduced motion, loading, empty, error y disabled son estados del contrato.

Cada integración debe seguir verificando reflow a 320 px, zoom al 200 %,
contraste WCAG 2.2 AA y navegación completa sin mouse dentro del producto real.

## Calidad y versión

```bash
npm run check         # contratos TypeScript/Vue
npm test              # pruebas unitarias y funcionales
npm run build         # aplicación y biblioteca
npm run test:package  # exports, fontless y presupuestos gzip
npm run test:consumer # tarball, SSR Node y perfiles Vite aislados
npm run test:marketing # 320, 375, 414 y 768 px, foco y reduced motion
npm run test:e2e      # comprobación visual dirigida de rutas/temas/viewports
npm pack --dry-run    # contenido exacto del tarball
```

La puerta principal del paquete es la integración: build ESM/CJS, declaraciones
sin fugas de Quasar, tarball instalable, importación Node sin DOM, consumidor
Quasar convencional y perfiles Vite modulares comparados contra un baseline
Vue. Las pruebas de componente cubren contratos críticos; Playwright valida los
breakpoints e interacciones que necesitan un navegador real.

Medición del candidato `0.4.0` en un consumidor Vite limpio, como delta gzip
sobre el mismo baseline Vue y `tokens.css`:

| Perfil | JavaScript | CSS |
| --- | ---: | ---: |
| `input` | +3.618 B | +1.894 B |
| `forms` | +5.191 B | +1.894 B |
| `marketing` | +6.440 B | +2.058 B |

Los tres grafos se verifican sin Quasar, `cloud` ni la entrada monolítica.

El proyecto usa SemVer. Mientras la API está en `0.x`, una incompatibilidad
incrementa la versión minor; una adición compatible también corresponde a una
minor. Ninguna entrada o componente se considera publicado solo por existir en
el repositorio. Consulta [RELEASE.md](./RELEASE.md) y
[CHANGELOG.md](./CHANGELOG.md).
