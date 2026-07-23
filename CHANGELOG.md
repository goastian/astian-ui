# Changelog

Relevant changes to Astian UI are documented here following Keep a Changelog and semantic versioning.

## [0.3.0] - 2026-07-23

### Added

- `ARadio` and `ARadioGroup` with typed controlled values, rich options,
  horizontal/vertical layout, validation, readonly, native semantics and full
  arrow/Home/End/space keyboard operation.
- Native `date` and `datetime-local` support in `AInput`, including `min`,
  `max`, `step`, `name` and `required`, without timezone conversion.
- Presentational `AStepper` with controlled active step, five states,
  responsive orientation, intent events and polite announcements. `AWizard`
  remains intentionally absent until a real composition requires it.
- Cloud-internal DnD types, `useCloudItemDnd`, consistent intent events and
  controlled `pending`/`invalid` feedback across cards, items, grids, tables
  and folder trees.
- Optional marquee selection in `AFileGrid` and `AMediaGrid`, preserving
  `selectedIds`, modifier modes, Escape cancellation, bounded autoscroll and
  keyboard selection.
- Package verification with gzip budgets and a clean external consumer that
  exercises the new public contracts.

### Changed

- CSS is published as fontless `base.css`, `core.css` and `cloud.css` entries.
  `style.css` remains a full compatibility entry without embedded fonts.
- Material Icons Round moved to opt-in `fonts.css` plus an external WOFF2.
- Release validation prioritizes package/consumer integration, compression and
  bundle budgets; browser snapshots remain targeted.

## [0.2.0] - 2026-07-22

### Added

- Public and tree-shakeable `@goastian/astian-ui/cloud` with its TypeScript types, separated from the core to avoid coupling other products to storage patterns.

- P0 foundations for migration: `AAppShell`, `ANavigationRail`, `ANavItem`,

`ABreadcrumbs`, `ADrawer`, `ACheckbox`, `ACheckboxGroup`,

`ALinearProgress`, `AQuotaMeter`, `AEmptyState`, `AErrorState`,

`AContextMenu`, `ACombobox`, `APopover`, `ADataTable`, `APagination`,

`ADropzone`, `AFileUpload`, and `AUploadQueue`.

- Astian Cloud P1 patterns: `ACloudPageHeader`, `ACloudToolbar`,

`AFileItem`, `AFileCard`, `AFolderItem`, `AFileGrid`, `AFileTable`,

`AFolderTree`, `AFolderPicker`, `AMediaGrid`, `APhotoTile`,

`AMediaViewer`, `AFilePreview`, `AFileDetailsPanel`,

`ANotificationCenter`, `AStatCard`, and `ASwatchPicker`.

- Supported aliases: `ASidebar`, `ASidePanel`, `ASearchAutocomplete`,

`AMetricCard`, and `AColorPicker`, without duplicate implementations.

- Controlled contracts for selection, focus, expansion, sorting,
pagination, overlays, upload, and zoom; states: `loading`, `empty`, `error`, and

`disabled`; Intent events for product state preservation and transport.

- Keyboard navigation for shells, rails, breadcrumbs, comboboxes, trees, tables, menus, and overlays, including skip links, roving focus, and restoring focus.

### Changed

- Cloud patterns accept presentational models and emit actions without relying on Axios, `fetch`, Pinia, encryption, synchronization, or upload transport.

- The navigation API uses mutually exclusive TypeScript targets for `to` and `href`; Quasar components remain an internal detail.

- The package explicitly declares the inputs `.`, `./cloud`,
`./style.css`, `./tokens.css`, and `./icons/*`.

### Fixed

- Public icon mapping types using `AstianIconMapFn` and

`AstianIconMapResult`, preventing incompatible casts when configuring Quasar
from the application or plugin.

- Typed normalization of progress, quota, selection, sorting, and
pagination ranges to avoid exposing invalid states in ARIA or events.

- Cancellation using `AbortSignal` in asynchronous searches and validators
to prevent outdated results from replacing the current state.

### Security

- External links opened with `target="_blank"` add

`rel="noopener noreferrer"`.

- Remote previews avoid sending the referrer; the PDF viewer uses a sandboxed `iframe`.

Authorization and validation of each URL remain with
Astian Cloud.

### SemVer

- This set is additive: it does not delete or rename documented public exports and does not introduce an intentional breaking change.

- If released, it corresponds to a minor version `0.3.0` by the new public surface. This entry does not claim that `0.3.0` has been built or released.

## [0.1.0] - 2026-07-17

### Added

- 30 public Vue 3 components on Quasar covering the 28 original React families.
- 302 legacy SVG icons and Material Icons Round as the default system.
- Base applications for AstianGO, Astian Cloud, Calendar, and Midori, plus the `/ui` catalog.
- Light, dark, and system themes; semantic tokens; installable plugin and TypeScript declarations.
- Unit, functional, and visual regression tests for desktop/mobile and light/dark.

### Fixed

- Global icon resolution to prevent ligatures from being displayed as text.

- Product selector persistence on desktop and contextual close on mobile.
