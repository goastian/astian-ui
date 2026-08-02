<script setup lang="ts">
import { computed, ref } from 'vue'

import AAvatar from '@/components/AAvatar.vue'
import AButton from '@/components/AButton.vue'
import AChip from '@/components/AChip.vue'
import AInput from '@/components/AInput.vue'
import AMonoTag from '@/components/AMonoTag.vue'
import AToggle from '@/components/AToggle.vue'

const address = ref('')
const protectionsEnabled = ref(true)
const protectionLabel = computed(() => protectionsEnabled.value ? 'Activo' : 'Pausado')

const stats = [
  { value: '1.284', label: 'rastreadores bloqueados', icon: 'visibility_off' },
  { value: '6,3 MB', label: 'datos evitados', icon: 'data_saver_on' },
  { value: '14 min', label: 'tiempo recuperado', icon: 'timer' }
]

const shortcuts = [
  { label: 'AstianGO', icon: 'travel_explore', tone: 'primary' },
  { label: 'Cloud', icon: 'cloud', tone: 'info' },
  { label: 'Calendar', icon: 'calendar_month', tone: 'accent' },
  { label: 'MidoriVPN', icon: 'vpn_lock', tone: 'secondary' },
  { label: 'Privacidad', icon: 'shield', tone: 'warning' }
]
</script>

<template>
  <main class="a-page midori-page" aria-label="Midori">
    <div class="midori-page__workbench">
      <header class="midori-page__header">
        <div class="midori-page__brand">
          <span class="midori-page__leaf" aria-hidden="true">
            <span class="material-icons-round">eco</span>
          </span>
          <span>
            <strong>Midori</strong>
            <small>privacy browser</small>
          </span>
        </div>

        <div class="midori-page__session">
          <AMonoTag label="NUEVA PESTAÑA" />
          <AToggle v-model="protectionsEnabled" label="Protecciones" size="small" />
          <AAvatar label="Lucía Rivera" size="large" color="orange" rounded show-badge />
        </div>
      </header>

      <section class="midori-page__start" aria-labelledby="midori-welcome-title">
        <header class="midori-page__welcome">
          <span class="a-eyebrow">VIERNES · 17 JUL</span>
          <h1 id="midori-welcome-title">Buenas tardes, Lucía.</h1>
          <p>Tu navegación sigue siendo tuya.</p>
        </header>

        <form class="midori-page__search" role="search" @submit.prevent>
          <AInput
            v-model="address"
            aria-label="Buscar o escribir una dirección"
            placeholder="Busca con AstianGO o escribe una dirección"
            icon="search"
            size="large"
            autocomplete="off"
          />
          <AButton label="Ir" icon-right="arrow_forward" size="large" native-type="submit" />
        </form>
      </section>

      <nav class="midori-page__shortcuts" aria-label="Accesos rápidos">
        <button v-for="shortcut in shortcuts" :key="shortcut.label" type="button">
          <span class="midori-page__shortcut-icon" :data-tone="shortcut.tone" aria-hidden="true">
            <span class="material-icons-round">{{ shortcut.icon }}</span>
          </span>
          <strong>{{ shortcut.label }}</strong>
        </button>
        <button type="button">
          <span class="midori-page__shortcut-icon" aria-hidden="true">
            <span class="material-icons-round">add</span>
          </span>
          <strong>Añadir</strong>
        </button>
      </nav>

      <div class="midori-page__dashboard">
        <section class="midori-page__protection" aria-labelledby="midori-protection-title">
          <header class="midori-page__section-heading">
            <div>
              <span class="a-eyebrow">PROTECCIÓN DE HOY</span>
              <h2 id="midori-protection-title">El ruido se queda fuera.</h2>
            </div>
            <AChip :label="protectionLabel" icon="verified" :selected="protectionsEnabled" />
          </header>

          <div class="midori-page__stats">
            <div v-for="stat in stats" :key="stat.label">
              <span class="material-icons-round" aria-hidden="true">{{ stat.icon }}</span>
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </div>
          </div>
        </section>

        <section class="midori-page__continue" aria-labelledby="midori-continue-title">
          <header class="midori-page__section-heading">
            <div>
              <span class="a-eyebrow">CONTINUAR</span>
              <h2 id="midori-continue-title">Desde tus otros dispositivos</h2>
            </div>
            <AButton label="Gestionar dispositivos" icon="devices" type="tertiary" size="small" />
          </header>

          <div class="midori-page__sessions">
            <article>
              <span class="midori-page__site-icon" aria-hidden="true">
                <span class="material-icons-round">article</span>
              </span>
              <div>
                <strong>Designing privacy-respecting products</strong>
                <p>uxdesign.cc · hace 18 min</p>
              </div>
              <AMonoTag label="PORTÁTIL" color="blue" />
            </article>
            <article>
              <span class="midori-page__site-icon" aria-hidden="true">
                <span class="material-icons-round">code</span>
              </span>
              <div>
                <strong>Vue 3 Composition API</strong>
                <p>vuejs.org · ayer</p>
              </div>
              <AMonoTag label="MÓVIL" color="orange" />
            </article>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
.midori-page {
  min-width: 0;
}

.midori-page__workbench {
  width: min(100%, var(--a-layout-viewer-max));
  margin-inline: auto;
}

.midori-page__header,
.midori-page__section-heading,
.midori-page__session {
  display: flex;
  gap: var(--a-space-4);
  align-items: center;
  justify-content: space-between;
}

.midori-page__header {
  min-height: var(--a-layout-header);
  padding-block: var(--a-space-3);
  border-block-end: var(--a-border-width) solid var(--a-border);
}

.midori-page__brand {
  display: inline-flex;
  gap: var(--a-space-3);
  align-items: center;
  min-width: 0;
}

.midori-page__brand > span:last-child {
  display: grid;
}

.midori-page__brand strong {
  color: var(--a-text-primary);
  font-size: var(--a-font-size-lg);
  letter-spacing: var(--a-letter-spacing-heading);
}

.midori-page__brand small {
  color: var(--a-text-tertiary);
  font-family: var(--a-font-mono);
  font-size: var(--a-font-size-xs);
  letter-spacing: var(--a-letter-spacing-eyebrow);
  text-transform: uppercase;
}

.midori-page__leaf {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border-radius: var(--a-radius-md) var(--a-radius-xs);
  background: var(--a-text-primary);
  color: var(--a-bg-raised);
}

.midori-page__leaf .material-icons-round {
  font-size: var(--a-icon-lg);
}

.midori-page__session {
  flex: none;
  flex-wrap: wrap;
}

.midori-page__start {
  display: grid;
  gap: var(--a-space-6);
  padding-block: clamp(var(--a-space-8), 8vw, var(--a-space-16));
}

.midori-page__welcome h1,
.midori-page__welcome p {
  margin: 0;
}

.midori-page__welcome h1 {
  max-width: var(--a-layout-title);
  margin-block: var(--a-space-2) var(--a-space-1);
  font-size: clamp(var(--a-font-size-xl), 4vw, var(--a-font-size-metric));
  font-weight: var(--a-font-weight-medium);
  line-height: var(--a-line-height-tight);
  letter-spacing: var(--a-letter-spacing-heading);
  text-wrap: balance;
}

.midori-page__welcome p {
  color: var(--a-text-secondary);
}

.midori-page__search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--a-space-2);
  align-items: end;
  width: 100%;
  max-width: var(--a-layout-viewer-max);
}

.midori-page__shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(calc(var(--a-space-16) + var(--a-space-8)), 1fr));
  gap: var(--a-space-2);
  padding-block: var(--a-space-5) var(--a-space-8);
  border-block-start: var(--a-border-width) solid var(--a-border);
}

.midori-page__shortcuts button {
  display: grid;
  gap: var(--a-space-2);
  justify-items: center;
  min-height: calc(var(--a-target-min) + var(--a-space-8));
  padding: var(--a-space-3) var(--a-space-2);
  border: 0;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-secondary);
  font: inherit;
  font-size: var(--a-font-size-xs);
  cursor: pointer;
}

.midori-page__shortcuts button:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.midori-page__shortcut-icon,
.midori-page__site-icon {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  color: var(--a-text-secondary);
}

.midori-page__shortcut-icon[data-tone='primary'] {
  border-color: var(--a-primary);
  background: var(--a-primary-soft);
  color: var(--a-primary);
}

.midori-page__shortcut-icon[data-tone='info'] {
  border-color: var(--a-info);
  background: var(--a-bg-info-soft);
  color: var(--a-info);
}

.midori-page__shortcut-icon[data-tone='accent'] {
  border-color: var(--a-accent);
  background: var(--a-accent-soft);
  color: var(--a-accent);
}

.midori-page__shortcut-icon[data-tone='warning'] {
  border-color: var(--a-warning);
  background: var(--a-bg-warning-soft);
  color: var(--a-warning);
}

.midori-page__shortcut-icon .material-icons-round,
.midori-page__site-icon .material-icons-round {
  font-size: var(--a-icon-md);
}

.midori-page__dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr);
  border-block: var(--a-border-width) solid var(--a-border);
}

.midori-page__protection,
.midori-page__continue {
  min-width: 0;
  padding-block: var(--a-space-8);
}

.midori-page__protection {
  padding-inline-end: var(--a-space-8);
}

.midori-page__continue {
  padding-inline-start: var(--a-space-8);
  border-inline-start: var(--a-border-width) solid var(--a-border);
}

.midori-page__section-heading {
  align-items: start;
}

.midori-page__section-heading h2 {
  margin: var(--a-space-2) 0 0;
  color: var(--a-text-primary);
  font-size: var(--a-font-size-xl);
  line-height: var(--a-line-height-tight);
  letter-spacing: var(--a-letter-spacing-heading);
}

.midori-page__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-block-start: var(--a-space-8);
}

.midori-page__stats > div {
  display: grid;
  gap: var(--a-space-1);
  min-width: 0;
  padding-inline: var(--a-space-4);
  border-inline-start: var(--a-border-width) solid var(--a-border);
}

.midori-page__stats > div:first-child {
  padding-inline-start: 0;
  border-inline-start: 0;
}

.midori-page__stats > div > .material-icons-round {
  margin-block-end: var(--a-space-3);
  color: var(--a-primary);
  font-size: var(--a-icon-md);
}

.midori-page__stats strong {
  color: var(--a-text-primary);
  font-family: var(--a-font-mono);
  font-size: var(--a-font-size-xl);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--a-letter-spacing-heading);
}

.midori-page__stats span:last-child {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.midori-page__sessions {
  margin-block-start: var(--a-space-5);
  border-block-start: var(--a-border-width) solid var(--a-border);
}

.midori-page__sessions article {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--a-space-3);
  align-items: center;
  min-height: calc(var(--a-target-min) + var(--a-space-6));
  padding-block: var(--a-space-3);
  border-block-end: var(--a-border-width) solid var(--a-border);
}

.midori-page__sessions article > div {
  min-width: 0;
}

.midori-page__sessions article strong {
  display: block;
  overflow: hidden;
  color: var(--a-text-primary);
  font-size: var(--a-font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.midori-page__sessions article p {
  margin: var(--a-space-1) 0 0;
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
}

@media (max-width: 63.99rem) {
  .midori-page__dashboard {
    grid-template-columns: minmax(0, 1fr);
  }

  .midori-page__protection {
    padding-inline-end: 0;
  }

  .midori-page__continue {
    padding-inline-start: 0;
    border-block-start: var(--a-border-width) solid var(--a-border);
    border-inline-start: 0;
  }
}

@media (max-width: 47.99rem) {
  .midori-page__header {
    align-items: stretch;
    flex-direction: column;
  }

  .midori-page__session {
    align-self: flex-start;
  }

}

@media (max-width: 35.99rem) {
  .midori-page__search,
  .midori-page__stats {
    grid-template-columns: minmax(0, 1fr);
  }

  .midori-page__search :deep(.a-button) {
    width: 100%;
  }

  .midori-page__stats {
    gap: var(--a-space-4);
  }

  .midori-page__stats > div,
  .midori-page__stats > div:first-child {
    padding-block-start: var(--a-space-4);
    padding-inline: 0;
    border-block-start: var(--a-border-width) solid var(--a-border);
    border-inline-start: 0;
  }

  .midori-page__section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
