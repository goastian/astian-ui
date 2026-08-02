# Design — Astian UI

A locked design system for the Astian UI package and its reference applications.
Every page redesign reads this file before emitting code. Do not regenerate the
system per page; amend this file when the shared language needs to grow.

## Genre

Modern-minimal. The visual DNA is Skiff's quiet, neutral, information-first
interface, adapted to Astian's privacy, control, and open-product semantics.
Function carries the composition. Ornament does not.

## Macrostructure family

- Marketing pages: Workbench, using a real product surface followed by short,
  concrete annotations. No invented customer logos, claims, or metrics.
- App pages: Workbench. AstianGO uses a search cockpit, Cloud an explorer,
  Calendar a schedule canvas, and Midori a privacy-first start surface.
- Content pages: Long Document, with a narrow reading measure, hairline rules,
  and code examples adjacent to the text they support.
- Component documentation: Component Playground, with lazy preview panels and
  copyable imports as the primary content.

## Theme

Light values:

- `--color-paper`: `oklch(97.5% 0.006 145)`
- `--color-paper-2`: `oklch(94.5% 0.009 145)`
- `--color-paper-3`: `oklch(91.5% 0.012 145)`
- `--color-ink`: `oklch(18% 0.012 150)`
- `--color-ink-2`: `oklch(35% 0.012 150)`
- `--color-muted`: `oklch(46% 0.010 150)`
- `--color-rule`: `oklch(78% 0.010 145)`
- `--color-accent`: `oklch(56% 0.150 42)`
- `--color-focus`: `oklch(48% 0.155 155)`

Dark values:

- `--color-paper`: `oklch(14% 0.010 150)`
- `--color-paper-2`: `oklch(18% 0.012 150)`
- `--color-paper-3`: `oklch(22% 0.014 150)`
- `--color-ink`: `oklch(95% 0.008 145)`
- `--color-ink-2`: `oklch(76% 0.010 145)`
- `--color-muted`: `oklch(66% 0.010 145)`
- `--color-rule`: `oklch(38% 0.012 150)`
- `--color-accent`: `oklch(72% 0.120 42)`
- `--color-focus`: `oklch(76% 0.135 155)`

Terracotta is an orientation accent, not a page fill. It occupies no more than
five percent of a viewport. Green, red, amber, and blue are reserved for
semantic states.

## Typography

- Display: `Avenir Next`, weight 500, normal.
- Body: `Avenir Next`, weight 400.
- Mono: `SFMono-Regular`, weight 400, for versions, shortcuts, times, sizes,
  and code only.
- Display tracking: `-0.045em` at large sizes and `-0.025em` for headings.
- Type scale anchor: `--text-display: clamp(2.25rem, 5vw, 4.5rem)`.
- Product headings stay functional and compact; no oversized marketing copy
  inside application references.

## Spacing

Use the named 4-point scale from `tokens.css`. Components and pages use
`var(--space-*)` or the compatibility `var(--a-space-*)` aliases. Raw spacing
values are allowed only for one-pixel optical corrections.

## Motion

- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`.
- `--ease-in: cubic-bezier(0.7, 0, 0.84, 0)`.
- `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`.
- Application surfaces load instantly. Only drawers, menus, focus transitions,
  and direct manipulation receive motion.
- Reduced motion removes transforms and caps feedback at 120 ms.

## Microinteractions stance

- Success is silent and local; no celebratory effects.
- Focus feedback is immediate. Hover feedback has no artificial delay.
- Escape closes transient surfaces and focus returns to the trigger.
- Loading never replaces an actionable label without an accessible status.
- Destructive intent is signalled before activation, never after it.

## CTA voice

- Primary actions: compact solid ink, sentence case, concrete verb, optional
  trailing icon. Radius uses `--radius-md`, never a pill.
- Secondary actions: transparent or paper fill with a one-pixel rule.
- Link actions remain real anchors; external links expose their destination and
  use safe `rel` attributes.

## Per-page allowances

- Reference app pages must not use decorative enrichment. The working UI is the
  proof.
- Product-specific colour may appear only as a semantic state or a small brand
  marker.
- Cloud may use denser rows; Calendar may use spatial time blocks; AstianGO may
  use a wider reading column; Midori may use a calm start-page grid.
- The Midori reference is a product surface, not simulated browser chrome.

## What pages MUST share

- Astian wordmark, product rail, and theme control.
- The light and dark token pairs and their semantic aliases.
- Avenir/system and mono font stacks.
- Focus ring, 44 px minimum touch targets, rules, radii, and button voice.
- Compact eyebrow → functional heading → supporting line rhythm.
- SSR-safe module evaluation and browser APIs restricted to lifecycle hooks or
  user events.

## What pages MAY differ on

- Operational composition within Workbench.
- Information density and responsive collapse order.
- Product-specific component combinations already exported by the package.
- Empty, loading, and selected states required by the demonstrated workflow.

## Exports

### `tokens.css`

```css
:root {
  --color-paper: oklch(97.5% 0.006 145);
  --color-paper-2: oklch(94.5% 0.009 145);
  --color-ink: oklch(18% 0.012 150);
  --color-ink-2: oklch(35% 0.012 150);
  --color-rule: oklch(78% 0.010 145);
  --color-accent: oklch(56% 0.150 42);
  --color-accent-ink: oklch(98% 0.006 145);
  --color-focus: oklch(48% 0.155 155);
  --font-display: 'Avenir Next', 'Segoe UI Variable Display', sans-serif;
  --font-body: 'Avenir Next', 'Segoe UI Variable Text', sans-serif;
  --font-mono: 'SFMono-Regular', 'Cascadia Code', ui-monospace, monospace;
  --space-3xs: 0.125rem;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1.125rem;
  --text-lg: 1.375rem;
  --text-xl: 1.75rem;
  --text-2xl: 2.25rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 180ms;
  --radius-card: 0.75rem;
  --radius-pill: 999px;
  --radius-input: 0.625rem;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(97.5% 0.006 145);
  --color-ink: oklch(18% 0.012 150);
  --color-accent: oklch(56% 0.150 42);
  --font-display: 'Avenir Next', sans-serif;
  --font-body: 'Avenir Next', sans-serif;
  --spacing-md: 1rem;
  --text-md: 1.125rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper": { "$value": "oklch(97.5% 0.006 145)", "$type": "color" },
    "ink": { "$value": "oklch(18% 0.012 150)", "$type": "color" },
    "accent": { "$value": "oklch(56% 0.150 42)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Avenir Next", "$type": "fontFamily" },
    "body": { "$value": "Avenir Next", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 97.5% 0.006 145;
  --foreground: 18% 0.012 150;
  --primary: 56% 0.150 42;
  --primary-foreground: 98% 0.006 145;
  --muted: 94.5% 0.009 145;
  --muted-foreground: 46% 0.010 150;
  --border: 78% 0.010 145;
  --input: 78% 0.010 145;
  --ring: 48% 0.155 155;
  --radius: 0.625rem;
}
```
