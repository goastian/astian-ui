# Astian UI

Sistema de diseño de AstianGO, Astian Cloud, Calendar, Midori y futuros productos
Astian. El paquete `@goastian/astian-ui` está construido con Vue 3, Quasar y
TypeScript.

La documentación describe la superficie disponible en este repositorio. No
implica que una versión nueva ya haya sido publicada en npm.

## Requisitos

- Vue `^3.5.0`.
- Quasar `^2.16.0`.
- Node `^20.19.0` o `>=22.12.0` para desarrollar y construir el paquete.
- Una única instalación de Quasar en el punto de entrada de la aplicación.

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

## Entradas públicas

| Import | Contenido |
| --- | --- |
| `@goastian/astian-ui` | Primitivas y patrones reutilizables del núcleo P0, tipos, composables y plugin `AstianUI`. |
| `@goastian/astian-ui/cloud` | Patrones P1 y tipos propios de Astian Cloud. No se registran globalmente con `AstianUI`. |
| `@goastian/astian-ui/style.css` | Estilos del paquete y consumo de tokens. |
| `@goastian/astian-ui/tokens.css` | Tokens `--a-*` sin el resto de estilos del paquete. |
| `@goastian/astian-ui/icons/*` | Recursos legacy que el consumidor todavía necesite copiar a su directorio público. |

La entrada `./cloud` permite que un producto que solo necesita el núcleo no
incorpore patrones de almacenamiento. Ambas entradas usan exports nombrados y
son compatibles con tree shaking.

## Configuración del consumidor

Quasar debe instalarse antes de `AstianUI`. El plugin registra los componentes
del núcleo y configura el mapeo de Material Icons Round:

```ts
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import 'quasar/src/css/index.sass'

import { AstianUI } from '@goastian/astian-ui'
import '@goastian/astian-ui/style.css'

import App from './App.vue'

const app = createApp(App)

app.use(Quasar)
app.use(AstianUI)
app.mount('#app')
```

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
| `ALinearProgress`, `AQuotaMeter` | Progreso determinado o indeterminado, rango y estado semántico. La cuota recibe `used`/`limit` y permite formateo externo. |
| `AEmptyState`, `AErrorState` | Presentación de estados sin copy de producto obligatorio. `AErrorState` emite `retry`; ambos exponen slots para acciones controladas por el consumidor. |
| `ACombobox` | Selección por `v-model`, opciones locales o loader asíncrono cancelable con `AbortSignal`; emite `select` y `clear`. |
| `ADataTable` | Columnas y filas tipadas, sorting, selección, acciones y estados `loading`/`empty`/`error`. La fuente de verdad entra por `selected` y `sort`; los cambios salen por `update:selected`, `update:sort`, `row-activate` y `retry`. |
| `APagination` | `v-model` discriminado para página o cursor; emite `change` y puede sincronizar página/tamaño con el query string. |
| `ADropzone`, `AFileUpload` | Selección, drag and drop, URL opcional y validadores cancelables. Controlan archivos/URL con `v-model` y emiten `accepted`, `rejected`, `validated`, `remove` o `submit`; no suben archivos. |
| `AUploadQueue` | Renderiza progreso global y por archivo; recibe los items y emite `pause`, `resume`, `cancel` y `retry`. No conoce el transporte. |

## Inventario P1: Astian Cloud

Estos patrones se importan exclusivamente desde `@goastian/astian-ui/cloud`.

| Familia | Responsabilidad y contrato controlado |
| --- | --- |
| `ACloudPageHeader`, `ACloudToolbar` | Título, contexto y composición de búsqueda, creación, filtros, orden y vista. La toolbar controla `v-model:search`, `v-model:view` y `v-model:sort`; emite intenciones de crear, filtrar o buscar. |
| `AFileItem`, `AFileCard`, `AFolderItem` | Presentan archivo/carpeta, selección, favorito, privacidad, actividad, colaboradores y menú. Emiten `open`, `select`, `favorite`, `menu` y `focus` según la variante. |
| `AFileGrid`, `AFileTable` | Vistas grid/list controladas mediante `selectedIds`, `activeId` y, en tabla, `sort`. Conservan selección/foco y exponen `loading`/`empty`/`error`, acciones y reintento. |
| `AFolderTree`, `AFolderPicker` | Jerarquía controlada con `selectedId`, `expandedIds` y `activeId`. Emiten `loadChildren` para que el consumidor haga la carga perezosa, además de `select`, `toggle`, `confirm`, `cancel` y `retry` según la variante. |
| `AMediaGrid`, `APhotoTile` | Galería responsive y selección múltiple controlada; emite apertura, selección, menú y reintento. |
| `AMediaViewer`, `AFilePreview` | Imagen, PDF, audio, video o fallback. Controlan apertura/zoom y emiten navegación, descarga, carga, error o reintento. La URL y sus permisos pertenecen al consumidor. |
| `AFileDetailsPanel` | Panel controlado mediante `v-model` y `v-model:active-section`. Monta progresivamente slots `details`, `tags`, `permissions`, `comments`, `versions` y `activity`; emite `sectionChange`, `retry` y `close`. |
| `ANotificationCenter` | Recibe notificaciones y estado de conexión; emite lectura, acción, reintento y carga adicional. No abre sockets ni hace polling. |
| `AStatCard` (`AMetricCard`) | Presenta cuota, actividad o métricas con números tabulares, tendencia y progreso. |
| `ASwatchPicker` (`AColorPicker`) | Selección por `v-model` de swatches tokenizados con nombre accesible; el color nunca es el único indicador. |

Los tipos `ACloudItem`, `ACloudFile`, `ACloudFolder`, `AFolderTreeNode`,
`ACloudMedia`, `AFilePreviewSource`, `ACloudNotification` y `ACloudMetric`
también salen de `./cloud`.

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
- `AContextMenu` se puede abrir con click derecho, `Shift+F10` o la tecla de
  menú contextual y devuelve el foco al disparador.
- Drawers y visores modales contienen el foco; los no modales no lo atrapan.
  Los overlays cierran con `Escape` cuando está habilitado y restauran foco.
- Reduced motion, loading, empty, error y disabled son estados del contrato.

Cada integración debe seguir verificando reflow a 320 px, zoom al 200 %,
contraste WCAG 2.1 AA y navegación completa sin mouse dentro del producto real.

## Calidad y versión

```bash
npm run check         # contratos TypeScript/Vue
npm test              # pruebas unitarias y funcionales
npm run test:e2e      # rutas, temas y viewports
npm run build         # aplicación y biblioteca
npm run test:consumer # consumo desde una aplicación aislada
npm pack --dry-run    # contenido exacto del tarball
```

El proyecto usa SemVer. Mientras la API está en `0.x`, una incompatibilidad
incrementa la versión minor; una adición compatible también corresponde a una
minor. Ninguna entrada o componente se considera publicado solo por existir en
el repositorio. Consulta [RELEASE.md](./RELEASE.md) y
[CHANGELOG.md](./CHANGELOG.md).
