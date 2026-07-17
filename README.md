# Astian UI

Design system for AstianGO, Astian Cloud, Calendar, Midori, and future Astian products. It is built with Vue 3, Quasar, and TypeScript.

## Run

```bash
cd astian-ui
npm install
npm run dev
```

Production Validation:

```bash
npm run build
```

The command generates two outputs: `dist` for the reference applications and `dist-lib` for the reusable package (ESM, UMD, CSS, and TypeScript declarations).

## Paths

- `/ui` — interactive catalog of the design system.

- `/astiango` — base search application.

- `/cloud` — base file application.

- `/calendar` — base calendar application.

- `/midori` — base browser application.

## Consuming Components

The index exports individual components and a plugin for global registration:

```ts
import { AstianUI } from '@astian/astian-ui'
import '@astian/astian-ui/style.css'

app.use(AstianUI)
```

Specific components can also be imported:

```vue
<script setup lang="ts">
import { AButton, AInput, ASurface } from '@astian/astian-ui'
</script>
```

Product components use the `A` prefix to separate the stable Astian API from the internal Quasar API.

The consuming application must install and configure Quasar once in its ingress. Vue and Quasar are peer dependencies of the library package.

## Theme

Tokens reside in `src/css/astian.scss`; variables consumed by Quasar are in `src/css/quasar.variables.scss`. Use `--a-*` tokens by intent and avoid direct color values ​​in applications.

The composable `useThemeMode` saves the `light`, `dark`, or `system` preference and synchronizes `Quasar Dark`.

## Icons

`AIcon` uses Material Icons Round by default. The 302 SVGs from the previous system reside in `public/icons` and can be displayed during migration with:

```vue
<AIcon name="shield-encrypt" legacy />
```

The package publishes them in `dist-lib/icons`. The consuming application must copy this folder to its public `/icons` directory if it is still using `legacy` mode.


` ... ## Quality and Release

```bash
npm test # unit and functional contracts
npm run test:e2e # 5 routes, light/dark and desktop/mobile
npm run build # application and library
npm pack --dry-run # exact content a consumer will receive
```

The version follows SemVer. While the API is at `0.x`, an incompatible change increments the minor version; after `1.0.0`, it increments the major version. See [RELEASE.md](./RELEASE.md) and [CHANGELOG.md](./CHANGELOG.md).
