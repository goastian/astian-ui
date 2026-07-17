# Product Adoption

Adoption is done in reversible cuts. The entire design is not copied at once.

## Common Sequence

1. Install `@astian/astian-ui` and Quasar on a pilot branch.

2. Map existing colors, spacing, typography, and elevation to `--a-*` tokens.

3. Replace icons, buttons, fields, and surfaces first without changing business flows.

4. Migrate overlays and complete patterns when product testing is successful.

5. Compare light/dark, desktop/mobile, keyboard, and screen reader compatibility.

6. Remove the previous visual dependency only after verifying that no imports remain.

## AstianGO

Recommended pilot: search box and privacy preferences. Keep the current backend contract, parameters, and routes; change only the visual layer in the first cut.

## Astian Cloud

Recommended pilot: file cards, toolbar, and grid/list selector. Maintain upload, encryption, permissions, and synchronization beyond the first visual change.

## Calendar

Recommended pilot: event creation/editing in dialogs and view navigation. Maintain recurrence, time zones, and synchronization with custom characterization tests.

## Midori

Recommended pilot: new tab and privacy controls. The shell must respect extension/browser restrictions and not move blocking or telemetry logic to the design system.

## Pilot exit criteria

- No functional regressions in the live product.
- No visible icon names or missing assets.
- Approved screenshots in sizes supported by the product.
- Verified keyboard navigation, focus, loading, error, empty, and disabled functionality.
- Rollback possible by removing the package and restoring the previous component.