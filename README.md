# Astian UI

The design system for AstianGO, Astian Cloud, Calendar, Midori, and future Astian
products. The `@goastian/astian-ui` package is built with Vue 3, Quasar, and
TypeScript.

This documentation describes the surface available in this repository. It does
not imply that a new version has already been published to npm.

## Requirements

- Vue `^3.5.0`.
- Quasar `^2.16.0` for the conventional entrypoint and Cloud patterns. It is an
  optional peer for the native forms and marketing subpaths.
- Node `^20.19.0` or `>=22.12.0` to develop and build the package.
- A single Quasar installation at the entrypoint when the product consumes
  `@goastian/astian-ui` or `@goastian/astian-ui/cloud`.

Quasar is a peer dependency: Astian UI may use it internally, but no `Q*`
component, internal ref, or DOM implementation detail is part of the public
contract.

## Local development

```bash
cd astian-ui
npm install
npm run dev
```

Production validation:

```bash
npm run build
```

The build generates `dist` for the reference applications and `dist-lib` for the
reusable ESM, CommonJS, CSS, and TypeScript declaration package.

Reference routes:

- `/ui`: interactive design-system catalog.
- `/astiango`: search reference application.
- `/cloud`: file-management reference application.
- `/calendar`: calendar reference application.
- `/midori`: browser reference application.
- `/marketing-preview`: responsive navigation, locale, and action reference.

## Public entrypoints

| Import | Contents |
| --- | --- |
| `@goastian/astian-ui` | Reusable P0 core primitives and patterns, types, composables, and the `AstianUI` plugin. |
| `@goastian/astian-ui/cloud` | P1 Astian Cloud patterns and types. They are not registered globally by `AstianUI`. |
| `@goastian/astian-ui/input` | Native, SSR-safe `AInput` with no Quasar dependency. |
| `@goastian/astian-ui/textarea` | Native, SSR-safe `ATextarea` with no Quasar dependency. |
| `@goastian/astian-ui/checkbox` | Native, SSR-safe `ACheckbox` with no Quasar dependency. |
| `@goastian/astian-ui/button` | Native, SSR-safe form `AButton` with no Quasar dependency. |
| `@goastian/astian-ui/marketing-navigation` | `AMarketingNavigation` and its types, without Vue Router or Quasar. |
| `@goastian/astian-ui/locale-switch` | `ALocaleSwitch` with server-generated URLs, `hreflang`, and `aria-current`. |
| `@goastian/astian-ui/marketing-action` | `AMarketingAction` for native anchors or Inertia `Link`. |
| `@goastian/astian-ui/base.css` | Tokens and minimal global styles. It includes neither components nor fonts. |
| `@goastian/astian-ui/core.css` | Core primitive styles. |
| `@goastian/astian-ui/cloud.css` | Cloud-pattern-only styles; use with `base.css` and `core.css`. |
| `@goastian/astian-ui/forms.css` | Isolated styles for the four native controls. Use with `tokens.css`, without a global reset. |
| `@goastian/astian-ui/marketing.css` | Isolated navigation, locale, and action styles. Use with `tokens.css`, without a global reset. |
| `@goastian/astian-ui/fonts.css` | Material Icons Round and its external WOFF2 file. Opt-in only. |
| `@goastian/astian-ui/style.css` | Fontless compatibility entrypoint containing base, core, and Cloud styles. Prefer segmented entrypoints for new code. |
| `@goastian/astian-ui/tokens.css` | `--a-*` tokens without the rest of the package styles. |
| `@goastian/astian-ui/icons/*` | Legacy assets that a consumer may still need to copy into its public directory. |

The `./cloud` entrypoint prevents products that need only the core from pulling
in storage JavaScript or CSS. Native subpaths make forms and marketing usable
without loading the monolithic entrypoint, Quasar, Roboto, Material Icons, or
their reset. Every style entrypoint except `fonts.css` is fontless and contains
no base64-encoded WOFF assets.

## Consumer setup

In a conventional integration, Quasar must be registered before `AstianUI`.
The plugin registers core components and configures the Material Icons Round
mapping:

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

A product that uses Cloud also imports:

```ts
import '@goastian/astian-ui/cloud.css'
```

Material Icons Round is no longer downloaded by default. If the application
keeps the ligature-based icon set, it must opt into the font:

```ts
import '@goastian/astian-ui/fonts.css'
```

`fonts.css` uses `font-display: swap`; the reference shell loads only the modern
WOFF2 file and does not emit the legacy WOFF from `@quasar/extras`. An
application with SVG icons can omit this font entirely.

Individual components can also be imported without relying on global
registration:

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

### Native forms without Quasar

The four lightweight P0 controls use semantic HTML. A public form needs only the
tokens, isolated CSS, and subpaths it actually renders:

```ts
import '@goastian/astian-ui/tokens.css'
import '@goastian/astian-ui/forms.css'

import { AButton } from '@goastian/astian-ui/button'
import { ACheckbox } from '@goastian/astian-ui/checkbox'
import { AInput } from '@goastian/astian-ui/input'
import { ATextarea } from '@goastian/astian-ui/textarea'
```

Do not import `base.css`, `style.css`, `quasar/src/css/index.sass`, or
`fonts.css` for this path. `AButton` uses `nativeType="submit"` for the HTML
type; its `type` prop still represents the visual variant. The `icon-start`,
`icon-end`, `prepend`, and `end-icon` slots let a product use SVG without
downloading an icon font. If Vue Router is already installed, `AButton`
preserves SPA navigation for `to`; without a registered router it renders a
native anchor. Name-based icon props remain available to conventional
integrations that opt into `fonts.css`; SVG slots are recommended for the
modular path.

### SSR and Inertia without Vue Router

The new entrypoints can be evaluated and rendered in Node without `window`,
`document`, or `navigator`. This example uses Vue SSR directly:

```ts
import { renderToString } from 'vue/server-renderer'
import { createSSRApp, h } from 'vue'
import { AInput } from '@goastian/astian-ui/input'

const app = createSSRApp({
  render: () => h(AInput, {
    label: 'Title',
    name: 'title',
    modelValue: 'Draft'
  })
})

const html = await renderToString(app)
```

In Inertia, inject `Link` as the renderer. Astian UI always provides `href` and
neither imports nor configures Vue Router:

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
  { kind: 'link', id: 'home', label: 'Home', href: '/' },
  {
    kind: 'menu',
    id: 'products',
    label: 'Products',
    columns: [
      {
        id: 'privacy',
        label: 'Privacy',
        items: [
          { id: 'midori', label: 'Midori', href: '/midori', description: 'Private browsing' }
        ]
      },
      {
        id: 'services',
        label: 'Services',
        items: [
          { id: 'cloud', label: 'Astian Cloud', href: '/cloud', description: 'Protected files' }
        ]
      }
    ],
    cta: { id: 'all', label: 'View products', href: '/productos' }
  }
]

const locales: ALocaleOption[] = [
  { locale: 'es', label: 'Spanish', shortLabel: 'ES', href: '/es/cms' },
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
    Create account
  </AMarketingAction>
</template>
```

Locale URLs must come from the server with the equivalent path, query, and
fragment already resolved. When a link is external, downloads a file, or opens
with `target="_blank"`, the component uses a native `<a>`. For a new tab it
merges `noopener noreferrer` with the supplied `rel`.

The internal `@` alias points to `src` during repository development. It is not
a public alias: consumers must use package entrypoints.

### Public aliases

Aliases preserve the same component and contract; they are not duplicate
implementations.

| Alias | Implementation |
| --- | --- |
| `ASidebar` | `ANavigationRail` |
| `ASidePanel` | `ADrawer` |
| `ASearchAutocomplete` | `ACombobox` |
| `AColorPicker` | `ASwatchPicker` from `./cloud` |
| `AMetricCard` | `AStatCard` from `./cloud` |

## P0 inventory: reusable core

| Family | Responsibility and controlled contract |
| --- | --- |
| `AAppShell` | `header`, `navigation`, main-content, and `aside` regions; skip link and optional focus management when `routeKey` changes. It contains no session or product logic. |
| `ANavigationRail`, `ANavItem`, `ABreadcrumbs` | Navigation through either `to` or `href`, never both. The rail controls `v-model:collapsed` and `v-model:mobile-open` and emits `select`. Items emit `activate`/`navigate` without running business logic. |
| `ADrawer`, `APopover`, `AContextMenu` | Controlled overlays using `v-model`; they emit open, close, or selection intent. `ADrawer` may be modal or non-modal and reports the close reason. |
| `ACheckbox`, `ACheckboxGroup` | Boolean or typed-collection `v-model`; supports indeterminate, hint, error, and disabled states. |
| `ARadio`, `ARadioGroup` | Exclusive selection through a typed `v-model`; options support descriptions, orientation, `readonly`, validation, arrow navigation, `Home`, `End`, and Space. |
| `AInput`, `ATextarea`, `AButton` | Native HTML controls, isolated from Quasar and safe for SSR. `AInput` preserves `date` and `datetime-local` as local strings; `AButton` separates its visual variant from `nativeType`. |
| `AStepper` | Step collection and `v-model:activeStep`; emits `next`, `back`, `cancel`, `complete`, and `step-request`. The application validates and navigates. `AWizard` will not be published until another real composition has been validated. |
| `ALinearProgress`, `AQuotaMeter` | Determinate or indeterminate progress, range, and semantic status. Quota receives `used`/`limit` and supports external formatting. |
| `AEmptyState`, `AErrorState` | State presentation without mandatory product copy. `AErrorState` emits `retry`; both expose slots for consumer-controlled actions. |
| `ACombobox` | Selection through `v-model`, local options, or a cancelable asynchronous loader with `AbortSignal`; emits `select` and `clear`. |
| `ADataTable` | Typed columns and rows, sorting, selection, actions, and `loading`/`empty`/`error` states. Source-of-truth values enter through `selected` and `sort`; changes leave through `update:selected`, `update:sort`, `row-activate`, and `retry`. |
| `APagination` | Discriminated `v-model` for pages or cursors; emits `change` and can synchronize page/size with the query string. |
| `ADropzone`, `AFileUpload` | File selection, drag and drop, optional URL, and cancelable validators. They control files/URL through `v-model` and emit `accepted`, `rejected`, `validated`, `remove`, or `submit`; they do not upload files. |
| `AUploadQueue` | Renders global and per-file progress; receives items and emits `pause`, `resume`, `cancel`, and `retry`. It knows nothing about transport. |

## P1 inventory: marketing

These components also remain in the root entrypoint for compatibility, but
their subpaths and `marketing.css` are the recommended path for public sites.

| Family | Responsibility and controlled contract |
| --- | --- |
| `AMarketingNavigation` | Receives direct links or column menus; controls `v-model:open-menu` and `v-model:mobile-open`. Opens on click, intentional hover, or keyboard input; closes on `Escape`, outside click, focus exit, or navigation. The desktop panel uses two columns, and the mobile drawer contains and restores focus. Exposes `brand`, `item-icon`, `item-name`, `item-description`, `cta`, `header-actions`, and `mobile-header` slots. |
| `ALocaleSwitch` | Receives equivalent server-generated URLs and renders links with `href`, `hreflang`, `lang`, and `aria-current="page"`. Uses an inline list for up to three locales and a compact disclosure for four or more. |
| `AMarketingAction` | Semantic primary or secondary link with single-line text and `icon-start`/`icon-end` slots. Accepts a native `<a>` or a `linkComponent` such as Inertia `Link`, without assuming Vue Router. |

## P1 inventory: Astian Cloud

These patterns are imported exclusively from `@goastian/astian-ui/cloud`.

| Family | Responsibility and controlled contract |
| --- | --- |
| `ACloudPageHeader`, `ACloudToolbar` | Title, context, and composition for search, creation, filters, sorting, and view. The toolbar controls `v-model:search`, `v-model:view`, and `v-model:sort`; it emits create, filter, or search intent. |
| `AFileItem`, `AFileCard`, `AFolderItem` | Present a file/folder and accept the same controlled DnD contract. The visible “Move…” action provides a keyboard-operable alternative. |
| `AFileGrid`, `AFileTable` | Grid/list views controlled through `selectedIds`, `activeId`, and, for tables, `sort`. The grid can enable `selectionInteraction="marquee"` without creating another selection model. |
| `AFolderTree`, `AFolderPicker` | Controlled hierarchy and DnD destination. `Alt+M` emits `move-request`; the consumer can open `AFolderPicker` as an alternative to pointer input. |
| `AMediaGrid`, `APhotoTile` | Responsive gallery and controlled multi-selection; `AMediaGrid` shares the file grid marquee contract. |
| `AMediaViewer`, `AFilePreview` | Image, PDF, audio, video, or fallback. They control open/zoom state and emit navigation, download, load, error, or retry intent. The URL and its permissions belong to the consumer. |
| `AFileDetailsPanel` | Panel controlled through `v-model` and `v-model:active-section`. Progressively mounts `details`, `tags`, `permissions`, `comments`, `versions`, and `activity` slots; emits `sectionChange`, `retry`, and `close`. |
| `ANotificationCenter` | Receives notifications and connection state; emits read, action, retry, and load-more intent. It does not open sockets or poll. |
| `AStatCard` (`AMetricCard`) | Presents quota, activity, or metrics using tabular numbers, trend, and progress. |
| `ASwatchPicker` (`AColorPicker`) | `v-model` selection of tokenized swatches with an accessible name; color is never the only indicator. |

The `ACloudItem`, `ACloudFile`, `ACloudFolder`, `AFolderTreeNode`,
`ACloudMedia`, `AFilePreviewSource`, `ACloudNotification`, and `ACloudMetric`
types are also exported from `./cloud`.

### Internal drag and drop

`ACloudDragPayload`, `ACloudDropTarget`, `ACloudDropPosition`,
`ACloudDropEffect`, and `ACloudDropState` form the public contract. Components
emit `drag-start`, `drag-end`, `drop-target-change`, and `drop-request`; they
never mutate the collection themselves. The consumer validates permissions,
encryption, conflicts, and API behavior and keeps `dropState="pending"` until
confirmation. `invalid` communicates rejection without simulating a completed
operation.

### Marquee selection

`AFileGrid` and `AMediaGrid` accept `selectionInteraction="marquee"`. The
result remains in `v-model:selectedIds`; `selection-start`, `selection-change`,
and `selection-end` support telemetry or action bars. Shift adds, Ctrl/Cmd
toggles, Escape cancels, and Ctrl/Cmd+A selects enabled items. The interaction
ignores internal controls and touch pointers.

## Controlled contracts and events

Astian UI presents state and emits intent. The consumer retains the source of
truth and applies a change when its domain allows it:

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
  // The domain loads children and updates `folders`.
}

function confirmDestination(node: AFolderTreeNode) {
  // The domain validates permissions and performs the move/copy.
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

Events do not guarantee that an operation has completed. For example, `submit`,
`download`, `pause`, or `confirm` express intent; the parent must update
`loading`, `error`, progress, permissions, or the resulting collection.

## Responsibility boundaries

Astian UI does not contain:

- Axios, `fetch`, or another network client.
- Pinia stores or global Astian Cloud state.
- Encryption, synchronization, permission resolution, or business rules.
- Upload transport, polling, WebSocket, or persistence.
- Mandatory product copy inside core primitives.

Upload components receive `File`, validators, and state; viewers receive
already-authorized sources; file components receive presentational models and
emit actions. The product decides whether an action is valid, calls the API,
and returns the new state.

## Tokens, themes, and Quasar

Portable design tokens live in the root `tokens.css`; `src/css/tokens.css`
maps them to the backward-compatible `--a-*` API. Global styles live in
`src/css/astian.scss`, and Quasar integration variables live in
`src/css/quasar.variables.scss`. The shared visual and interaction contract for
all reference applications is documented in `design.md`.

- Every color, space, radius, shadow, control size, and motion value must use a
  portable token or its `--a-*` compatibility alias.
- Components support `light`, `dark`, and `system` through `useThemeMode`, which
  synchronizes storage, `prefers-color-scheme`, the root `data-theme`, and
  Quasar Dark.
- Do not override Quasar's internal DOM or use `q-*` classes as a contract from
  a consuming application.
- `AIcon` uses Material Icons Round. Enable legacy SVGs with
  `<AIcon name="shield-encrypt" legacy />` and copy them from `dist-lib/icons`
  to `/icons` when they are still required.

## Keyboard and accessibility

Interactive components reserve targets of at least `--a-target-min` (44 × 44
px), visible focus, and accessible names. The consuming integration must
preserve labels, states, and focus order.

- `AAppShell` provides a skip link and can focus content when the route changes.
- Trees: Up/Down arrows traverse visible nodes; Right expands/enters, Left
  collapses/returns to the parent; `Home`, `End`, `Enter`, Space, `*`, and
  typeahead search preserve the ARIA tree pattern.
- Comboboxes and menus use arrow navigation, `Home`/`End`, `Enter`/Space, and
  `Escape` according to their corresponding pattern.
- Radio groups traverse only enabled options with arrows and `Home`/`End`, and
  select with Space.
- Steppers announce the active step in a live region; a change request neither
  moves focus nor changes product navigation.
- `AContextMenu` opens with right click, `Shift+F10`, or the context-menu key and
  returns focus to its trigger.
- Modal drawers and viewers contain focus; non-modal variants do not trap it.
  Overlays close with `Escape` when enabled and restore focus.
- Marketing navigation uses native lists and disclosures, a two-column panel
  from 768 px, and a drawer through 767 px. `Tab` preserves web order; arrows,
  `Home`, `End`, and `Escape` manage the open context.
- Locale switches preserve real links even when their presentation is enhanced
  as a disclosure.
- Reduced motion, loading, empty, error, and disabled are contract states.

Every integration must continue verifying reflow at 320 px, 200% zoom, WCAG
2.2 AA contrast, and complete mouse-free navigation inside the real product.

## Quality and versioning

```bash
npm run check          # TypeScript/Vue contracts
npm test               # unit and functional tests
npm run build          # application and library
npm run test:package   # exports, fontless checks, and gzip budgets
npm run test:consumer  # tarball, Node SSR, and isolated Vite profiles
npm run test:marketing # 320, 375, 414, and 768 px; focus and reduced motion
npm run test:ui        # /ui catalog, command palette, reflow, targets, and DOM
npm run test:ui-budget # lazy chunks and catalog gzip budgets
npm run test:e2e       # directed visual checks for routes/themes/viewports
npm pack --dry-run     # exact tarball contents
```

Integration is the package's primary gate: ESM/CJS builds, declarations without
Quasar leaks, an installable tarball, DOM-free Node imports, a conventional
Quasar consumer, and modular Vite profiles compared with a Vue baseline.
Component tests cover critical contracts; Playwright validates breakpoints and
interactions that require a real browser.

`/ui` is the package's living visual contract. Every new public export or
state/behavior change must also update `src/pages/ui/catalog.ts` and the
corresponding panel. The catalog test compares that inventory with the
lightweight `publicComponentNames` manifest and verifies the manifest against
the migration matrix and real exports. The build splits Foundations,
Components, and Patterns into on-demand chunks so documenting an API does not
require mounting the whole catalog in the initial DOM.

Candidate `0.4.0` measured in a clean Vite consumer as a gzip delta over the
same Vue baseline plus `tokens.css`:

| Profile | JavaScript | CSS |
| --- | ---: | ---: |
| `input` | +3,618 B | +1,894 B |
| `forms` | +5,191 B | +1,894 B |
| `marketing` | +6,440 B | +2,058 B |

All three graphs are verified without Quasar, `cloud`, or the monolithic
entrypoint.

The project uses SemVer. While the API remains in `0.x`, an incompatible change
increments the minor version; a compatible addition also belongs in a minor
release. No entrypoint or component is considered published merely because it
exists in the repository. See [RELEASE.md](./RELEASE.md) and
[CHANGELOG.md](./CHANGELOG.md).
