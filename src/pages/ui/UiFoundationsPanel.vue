<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import AKeyCodeSequence from '@/components/AKeyCodeSequence.vue'
import ASurface from '@/components/ASurface.vue'
import ATypography from '@/components/ATypography.vue'

const typographySnippet = `import { ATypography } from '@goastian/astian-ui'

<ATypography size="h3" weight="bold">Una interfaz que explica su estado.</ATypography>`

const surfaceSnippet = `import { ASurface } from '@goastian/astian-ui'

<ASurface level="l2">Contenido elevado sólo cuando aporta jerarquía.</ASurface>`

const swatches = [
  { name: 'Acción', token: '--a-primary', value: 'var(--a-primary)' },
  { name: 'Acento', token: '--a-accent', value: 'var(--a-accent)' },
  { name: 'Éxito', token: '--a-positive', value: 'var(--a-positive)' },
  { name: 'Aviso', token: '--a-warning', value: 'var(--a-warning)' },
  { name: 'Error', token: '--a-negative', value: 'var(--a-negative)' },
  { name: 'Información', token: '--a-info', value: 'var(--a-info)' }
] as const

const spaces = [1, 2, 3, 4, 6, 8] as const
const copiedSnippet = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined

const copy = async (id: string, value: string) => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return

  try {
    await navigator.clipboard.writeText(value)
    copiedSnippet.value = id
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copiedSnippet.value = null }, 1600)
  } catch {
    copiedSnippet.value = null
  }
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <section id="ui-foundations" class="ui-foundations" data-ui-panel="foundations" aria-labelledby="ui-foundations-title">
    <header class="ui-foundations__header">
      <div>
        <h2 id="ui-foundations-title">Fundamentos</h2>
        <p>Una base neutral de Skiff, ajustada a la semántica y los productos de Astian.</p>
      </div>
      <code>tokens.css</code>
    </header>

    <article id="component-typography" class="ui-foundations__row" data-component-name="ATypography">
      <div class="ui-foundations__label">
        <h3>Tipo</h3>
        <p>Escala compacta, contraste legible y datos monoespaciados cuando importa comparar.</p>
      </div>
      <div class="ui-foundations__preview ui-foundations__type-preview">
        <ATypography size="h3" weight="bold">Privacidad sin fricción.</ATypography>
        <ATypography size="large">El producto comunica decisiones antes de pedir una acción.</ATypography>
        <ATypography size="small" tone="secondary">Ayuda contextual · 15 px / ritmo 24 px</ATypography>
        <div class="ui-foundations__shortcut">
          <span>Acción rápida</span>
          <AKeyCodeSequence shortcut="Ctrl + K" />
        </div>
      </div>
      <div class="ui-foundations__code">
        <code>{{ typographySnippet }}</code>
        <button type="button" @click="copy('type', typographySnippet)">
          {{ copiedSnippet === 'type' ? 'Copiado' : 'Copiar' }}
        </button>
      </div>
    </article>

    <article id="component-surface" class="ui-foundations__row" data-component-name="ASurface">
      <div class="ui-foundations__label">
        <h3>Superficies</h3>
        <p>Los bordes organizan. La sombra se reserva para elevación real.</p>
      </div>
      <div class="ui-foundations__preview ui-foundations__surface-preview">
        <ASurface level="l0"><strong>L0</strong><span>Base transparente</span></ASurface>
        <ASurface level="l1"><strong>L1</strong><span>Región delimitada</span></ASurface>
        <ASurface level="l2"><strong>L2</strong><span>Contenido elevado</span></ASurface>
      </div>
      <div class="ui-foundations__code">
        <code>{{ surfaceSnippet }}</code>
        <button type="button" @click="copy('surface', surfaceSnippet)">
          {{ copiedSnippet === 'surface' ? 'Copiado' : 'Copiar' }}
        </button>
      </div>
    </article>

    <article class="ui-foundations__row" aria-labelledby="foundation-color-title">
      <div class="ui-foundations__label">
        <h3 id="foundation-color-title">Color semántico</h3>
        <p>El nombre describe la intención; el tema decide el valor final.</p>
      </div>
      <div class="ui-foundations__preview ui-foundations__swatches">
        <div v-for="swatch in swatches" :key="swatch.token" class="ui-foundations__swatch">
          <span :style="`--foundation-color: ${swatch.value}`" aria-hidden="true"></span>
          <strong>{{ swatch.name }}</strong>
          <code>{{ swatch.token }}</code>
        </div>
      </div>
    </article>

    <article class="ui-foundations__row" aria-labelledby="foundation-space-title">
      <div class="ui-foundations__label">
        <h3 id="foundation-space-title">Ritmo de 4 px</h3>
        <p>Una escala corta reduce decisiones y mantiene densidad de herramienta.</p>
      </div>
      <div class="ui-foundations__preview ui-foundations__spacing">
        <div v-for="space in spaces" :key="space">
          <code>space-{{ space }}</code>
          <span :style="`--foundation-space: var(--a-space-${space})`" aria-hidden="true"></span>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.ui-foundations {
  display: grid;
}

.ui-foundations__header,
.ui-foundations__row {
  display: grid;
  grid-template-columns: minmax(10rem, 0.62fr) minmax(0, 1.45fr);
  gap: var(--a-space-6);
  padding-block: var(--a-space-6);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.ui-foundations__header {
  align-items: end;
  padding-block-start: var(--a-space-2);
}

.ui-foundations__header > div,
.ui-foundations__label,
.ui-foundations__type-preview,
.ui-foundations__surface-preview {
  display: grid;
  gap: var(--a-space-2);
}

.ui-foundations__header h2,
.ui-foundations__label h3,
.ui-foundations__header p,
.ui-foundations__label p {
  margin: var(--a-space-0);
}

.ui-foundations__header h2 {
  font-size: var(--a-font-size-xl);
  letter-spacing: var(--a-letter-spacing-heading);
}

.ui-foundations__header p,
.ui-foundations__label p {
  max-width: var(--a-layout-copy-narrow);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
}

.ui-foundations__header > code {
  justify-self: end;
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.ui-foundations__row {
  grid-template-columns: minmax(10rem, 0.62fr) minmax(0, 1.45fr);
}

.ui-foundations__row > :not(.ui-foundations__label) {
  grid-column: 2;
}

.ui-foundations__label {
  grid-row: 1 / span 2;
  align-content: start;
}

.ui-foundations__label h3 {
  font-size: var(--a-font-size-md);
}

.ui-foundations__preview {
  min-width: 0;
  padding: var(--a-space-5);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}

.ui-foundations__type-preview :deep(.a-typography--h3) {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  letter-spacing: var(--a-letter-spacing-heading);
}

.ui-foundations__shortcut {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-3);
  padding-block-start: var(--a-space-3);
  border-top: var(--a-border-width) solid var(--a-border);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}

.ui-foundations__surface-preview {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: var(--a-space-0);
  border: 0;
  background: transparent;
}

.ui-foundations__surface-preview :deep(.a-surface) {
  display: grid;
  min-height: 7rem;
  align-content: end;
  gap: var(--a-space-1);
  padding: var(--a-space-4);
  border-radius: var(--a-radius-sm);
}

.ui-foundations__surface-preview span {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.ui-foundations__code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--a-space-3);
  padding: var(--a-space-3) var(--a-space-4);
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-muted);
}

.ui-foundations__code code {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  color: var(--a-text-secondary);
  font: var(--a-font-size-xs)/var(--a-line-height-body) var(--a-font-mono);
}

.ui-foundations__code button {
  min-height: var(--a-target-min);
  padding-inline: var(--a-space-3);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
  font: var(--a-font-size-xs)/1 var(--a-font-sans);
  font-weight: var(--a-font-weight-semibold);
  white-space: nowrap;
  cursor: pointer;
}

.ui-foundations__code button:hover {
  background: var(--a-bg-hover);
}

.ui-foundations__code button:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-space-1);
}

.ui-foundations__swatches {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--a-space-3);
}

.ui-foundations__swatch {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--a-space-1) var(--a-space-2);
  min-width: 0;
}

.ui-foundations__swatch > span {
  grid-row: 1 / span 2;
  width: var(--a-control-sm);
  height: var(--a-control-sm);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-xs);
  background: var(--foundation-color);
}

.ui-foundations__swatch strong,
.ui-foundations__swatch code,
.ui-foundations__spacing code {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: var(--a-font-size-xs);
}

.ui-foundations__swatch code,
.ui-foundations__spacing code {
  color: var(--a-text-tertiary);
  font-family: var(--a-font-mono);
}

.ui-foundations__spacing {
  display: grid;
  gap: var(--a-space-3);
}

.ui-foundations__spacing > div {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  align-items: center;
  gap: var(--a-space-3);
}

.ui-foundations__spacing span {
  display: block;
  width: var(--foundation-space);
  max-width: 100%;
  height: var(--a-space-2);
  border-radius: var(--a-radius-round);
  background: var(--a-primary);
}

@media (max-width: 48rem) {
  .ui-foundations__header,
  .ui-foundations__row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--a-space-4);
  }

  .ui-foundations__header > code {
    justify-self: start;
  }

  .ui-foundations__row > :not(.ui-foundations__label) {
    grid-column: 1;
  }

  .ui-foundations__label {
    grid-row: auto;
  }
}

@media (max-width: 30rem) {
  .ui-foundations__surface-preview,
  .ui-foundations__swatches {
    grid-template-columns: minmax(0, 1fr);
  }

  .ui-foundations__code {
    grid-template-columns: minmax(0, 1fr);
  }

  .ui-foundations__code button {
    justify-self: start;
  }
}
</style>
