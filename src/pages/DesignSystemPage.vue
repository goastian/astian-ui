<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'

import {
  catalogCategories,
  componentCatalog,
  filterComponentCatalog,
  uiVersion,
  type UiCatalogCategory,
  type UiCatalogEntry
} from './ui/catalog'

const UiFoundationsPanel = defineAsyncComponent(() => import('./ui/UiFoundationsPanel.vue'))
const UiComponentsPanel = defineAsyncComponent(() => import('./ui/UiComponentsPanel.vue'))
const UiPatternsPanel = defineAsyncComponent(() => import('./ui/UiPatternsPanel.vue'))

const panels = {
  foundations: UiFoundationsPanel,
  components: UiComponentsPanel,
  patterns: UiPatternsPanel
} as const

const tabs = catalogCategories.map((tab) => ({
  ...tab,
  count: componentCatalog.filter(({ category }) => category === tab.id).length
}))

const activeTab = ref<UiCatalogCategory>('foundations')
const activePanel = computed(() => panels[activeTab.value])
const commandDialog = ref<HTMLDialogElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const searchTrigger = ref<HTMLButtonElement | null>(null)
const tabButtons = ref<HTMLButtonElement[]>([])
const searchQuery = ref('')
const activeResultIndex = ref(0)
const copiedTarget = ref<'install' | 'import' | null>(null)
const lastFocused = ref<HTMLElement | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined

const installCommand = 'npm install @goastian/astian-ui quasar vue'
const importExample = "import { AButton } from '@goastian/astian-ui/button'"
const searchResults = computed(() => filterComponentCatalog(searchQuery.value).slice(0, 10))
const activeResultId = computed(() => searchResults.value[activeResultIndex.value]
  ? `ui-command-result-${activeResultIndex.value}`
  : undefined)

watch(searchResults, (results) => {
  activeResultIndex.value = Math.min(activeResultIndex.value, Math.max(0, results.length - 1))
})

const copySnippet = async (target: 'install' | 'import', value: string) => {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return

  try {
    await navigator.clipboard.writeText(value)
    copiedTarget.value = target
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => { copiedTarget.value = null }, 1600)
  } catch {
    copiedTarget.value = null
  }
}

const openCommand = () => {
  if (typeof document === 'undefined') return

  lastFocused.value = document.activeElement as HTMLElement | null
  if (!commandDialog.value?.open) commandDialog.value?.showModal()
  void nextTick(() => searchInput.value?.focus())
}

const closeCommand = () => commandDialog.value?.close()

const restoreCommandFocus = () => {
  searchQuery.value = ''
  activeResultIndex.value = 0
  void nextTick(() => {
    ;(lastFocused.value ?? searchTrigger.value)?.focus()
    lastFocused.value = null
  })
}

const handleDialogPointer = (event: MouseEvent) => {
  if (event.target === event.currentTarget) closeCommand()
}

const moveResult = (direction: 1 | -1) => {
  const total = searchResults.value.length
  if (total === 0) return
  activeResultIndex.value = (activeResultIndex.value + direction + total) % total
}

const scrollToCatalogEntry = (entry: UiCatalogEntry, attempt = 0) => {
  if (typeof document === 'undefined') return

  const target = document.getElementById(entry.anchor)
    ?? document.querySelector<HTMLElement>(`[data-ui-panel="${entry.category}"]`)

  if (!target && attempt < 12) {
    setTimeout(() => scrollToCatalogEntry(entry, attempt + 1), 32)
    return
  }

  if (!target) return
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

const selectCatalogEntry = (entry: UiCatalogEntry) => {
  activeTab.value = entry.category
  closeCommand()
  void nextTick(() => scrollToCatalogEntry(entry))
}

const selectActiveResult = () => {
  const result = searchResults.value[activeResultIndex.value]
  if (result) selectCatalogEntry(result)
}

const selectTab = (category: UiCatalogCategory) => {
  activeTab.value = category
}

const moveTab = (currentIndex: number, event: KeyboardEvent) => {
  let nextIndex = currentIndex
  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length
  else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = tabs.length - 1
  else return

  event.preventDefault()
  activeTab.value = tabs[nextIndex].id
  void nextTick(() => tabButtons.value[nextIndex]?.focus())
}

const handleGlobalShortcut = (event: KeyboardEvent) => {
  if (event.isComposing || event.key.toLocaleLowerCase('es') !== 'k') return
  if (!event.metaKey && !event.ctrlKey) return
  event.preventDefault()
  openCommand()
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', handleGlobalShortcut)
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <main class="ui-catalog" aria-labelledby="ui-catalog-title">
    <header class="ui-catalog__intro">
      <div class="ui-catalog__version">
        <code>v{{ uiVersion }}</code>
        <span>{{ componentCatalog.length }} exports públicos</span>
      </div>
      <div class="ui-catalog__intro-copy">
        <div>
          <h1 id="ui-catalog-title">Astian UI</h1>
          <p>Componentes ligeros para producto y marketing, con el rigor visual de Skiff y contratos Vue seguros para SSR.</p>
        </div>
        <button
          ref="searchTrigger"
          type="button"
          class="ui-catalog__search-trigger"
          aria-haspopup="dialog"
          aria-controls="ui-command-dialog"
          @click="openCommand"
        >
          <span>Buscar componente</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>
    </header>

    <section class="ui-catalog__quickstart" aria-labelledby="ui-quickstart-title">
      <div>
        <h2 id="ui-quickstart-title">Empieza por el export más pequeño.</h2>
        <p>Los subpaths evitan cargar el entrypoint completo y mantienen el CSS aislado.</p>
      </div>
      <div class="ui-catalog__snippets">
        <button type="button" aria-label="Copiar comando de instalación" @click="copySnippet('install', installCommand)">
          <code>{{ installCommand }}</code>
          <span>{{ copiedTarget === 'install' ? 'Copiado' : 'Copiar' }}</span>
        </button>
        <button type="button" aria-label="Copiar ejemplo de importación" @click="copySnippet('import', importExample)">
          <code>{{ importExample }}</code>
          <span>{{ copiedTarget === 'import' ? 'Copiado' : 'Copiar' }}</span>
        </button>
      </div>
    </section>

    <div class="ui-catalog__tabs" role="tablist" aria-label="Catálogo de Astian UI">
      <button
        v-for="(tab, index) in tabs"
        :id="`ui-tab-${tab.id}`"
        :key="tab.id"
        ref="tabButtons"
        type="button"
        role="tab"
        :data-ui-tab="tab.id"
        :tabindex="activeTab === tab.id ? 0 : -1"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`ui-panel-${tab.id}`"
        @click="selectTab(tab.id)"
        @keydown="moveTab(index, $event)"
      >
        <span>{{ tab.label }}</span>
        <small>{{ tab.count }}</small>
      </button>
    </div>

    <section
      :id="`ui-panel-${activeTab}`"
      class="ui-catalog__panel"
      role="tabpanel"
      :data-ui-panel="activeTab"
      :aria-labelledby="`ui-tab-${activeTab}`"
      tabindex="0"
    >
      <component :is="activePanel" :key="activeTab" />
    </section>

    <footer class="ui-catalog__footer">
      <span>Astian UI v{{ uiVersion }}</span>
      <span>Vue 3 · Quasar opcional · MIT</span>
    </footer>
  </main>

  <dialog
    id="ui-command-dialog"
    ref="commandDialog"
    class="ui-catalog__command-dialog"
    aria-labelledby="ui-command-title"
    @close="restoreCommandFocus"
    @click="handleDialogPointer"
  >
    <header class="ui-catalog__command-header">
      <div>
        <h2 id="ui-command-title">Ir a un componente</h2>
        <p>Busca por nombre, función o subpath.</p>
      </div>
      <button type="button" aria-label="Cerrar búsqueda" @click="closeCommand">Cerrar</button>
    </header>

    <label class="ui-catalog__command-search">
      <span class="ui-catalog__sr-only">Buscar en el catálogo</span>
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="search"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        aria-controls="ui-command-results"
        :aria-activedescendant="activeResultId"
        :aria-expanded="true"
        placeholder="Ej. input, marketing o navegación"
        @keydown.down.prevent="moveResult(1)"
        @keydown.up.prevent="moveResult(-1)"
        @keydown.enter.prevent="selectActiveResult"
      >
      <kbd>Esc</kbd>
    </label>

    <div id="ui-command-results" class="ui-catalog__command-results" role="listbox" aria-label="Componentes">
      <button
        v-for="(result, index) in searchResults"
        :id="`ui-command-result-${index}`"
        :key="result.name"
        type="button"
        role="option"
        :aria-selected="activeResultIndex === index"
        :tabindex="-1"
        @mousemove="activeResultIndex = index"
        @click="selectCatalogEntry(result)"
      >
        <code>{{ result.name }}</code>
        <span>{{ result.summary }}</span>
        <small>{{ result.importPath }}</small>
      </button>
      <p v-if="searchResults.length === 0" class="ui-catalog__command-empty">No hay coincidencias. Prueba con otra función.</p>
    </div>
  </dialog>
</template>

<style scoped>
/* Hallmark · genre: modern-minimal · macrostructure: Component Playground · design-system: design.md · designed-as-app */
.ui-catalog {
  width: min(100%, 78rem);
  margin-inline: auto;
  padding: var(--a-space-8) clamp(var(--a-space-4), 4vw, var(--a-space-10)) var(--a-space-6);
  color: var(--a-text-primary);
}

.ui-catalog__intro {
  display: grid;
  gap: var(--a-space-5);
  padding-block-end: var(--a-space-8);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.ui-catalog__version,
.ui-catalog__intro-copy,
.ui-catalog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-3);
}

.ui-catalog__version {
  justify-content: flex-start;
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
}

.ui-catalog__version code {
  padding: var(--a-space-1) var(--a-space-2);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-xs);
  font-family: var(--a-font-mono);
}

.ui-catalog__intro-copy {
  align-items: end;
}

.ui-catalog__intro-copy > div {
  min-width: 0;
}

.ui-catalog__intro h1,
.ui-catalog__intro p,
.ui-catalog__quickstart h2,
.ui-catalog__quickstart p,
.ui-catalog__command-header h2,
.ui-catalog__command-header p {
  margin: var(--a-space-0);
}

.ui-catalog__intro h1 {
  font-size: clamp(2.25rem, 6vw, 3.75rem);
  line-height: var(--a-line-height-tight);
  letter-spacing: var(--a-letter-spacing-display);
}

.ui-catalog__intro p {
  max-width: var(--a-layout-copy);
  margin-block-start: var(--a-space-3);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-md);
  line-height: var(--a-line-height-body);
}

.ui-catalog__search-trigger,
.ui-catalog__snippets button,
.ui-catalog__tabs button,
.ui-catalog__command-header button,
.ui-catalog__command-results button {
  min-height: var(--a-target-min);
  border: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
}

.ui-catalog__search-trigger {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: var(--a-space-4);
  justify-content: space-between;
  min-width: min(100%, 15rem);
  padding-inline: var(--a-space-4);
  border-color: var(--a-border-strong);
  border-radius: var(--a-radius-round);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
}

.ui-catalog__search-trigger kbd,
.ui-catalog__command-search kbd {
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.ui-catalog__search-trigger:hover,
.ui-catalog__snippets button:hover,
.ui-catalog__tabs button:hover,
.ui-catalog__command-header button:hover,
.ui-catalog__command-results button:hover {
  background: var(--a-bg-hover);
}

.ui-catalog__search-trigger:focus-visible,
.ui-catalog__snippets button:focus-visible,
.ui-catalog__tabs button:focus-visible,
.ui-catalog__panel:focus-visible,
.ui-catalog__command-header button:focus-visible,
.ui-catalog__command-search input:focus-visible,
.ui-catalog__command-results button:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-space-1);
}

.ui-catalog__quickstart {
  display: grid;
  grid-template-columns: minmax(12rem, 0.72fr) minmax(0, 1.28fr);
  gap: var(--a-space-6);
  align-items: start;
  padding-block: var(--a-space-6);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.ui-catalog__quickstart h2 {
  font-size: var(--a-font-size-md);
}

.ui-catalog__quickstart p {
  max-width: 34rem;
  margin-block-start: var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
}

.ui-catalog__snippets {
  display: grid;
  gap: var(--a-space-2);
  min-width: 0;
}

.ui-catalog__snippets button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--a-space-3);
  width: 100%;
  padding: var(--a-space-2) var(--a-space-3);
  border-radius: var(--a-radius-xs);
  text-align: start;
}

.ui-catalog__snippets code {
  min-width: 0;
  overflow: hidden;
  color: var(--a-text-secondary);
  font: var(--a-font-size-xs)/var(--a-line-height-body) var(--a-font-mono);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-catalog__snippets span {
  color: var(--a-text-primary);
  font-size: var(--a-font-size-xs);
  font-weight: var(--a-font-weight-semibold);
}

.ui-catalog__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.ui-catalog__tabs button {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  padding-inline: var(--a-space-2);
  border: 0;
  border-bottom: var(--a-border-width-strong) solid transparent;
  background: transparent;
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}

.ui-catalog__tabs button[aria-selected='true'] {
  border-bottom-color: var(--a-text-primary);
  color: var(--a-text-primary);
  font-weight: var(--a-font-weight-semibold);
}

.ui-catalog__tabs small {
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.ui-catalog__panel {
  min-width: 0;
  min-height: 24rem;
  padding-block: var(--a-space-6);
  scroll-margin-block-start: var(--a-layout-header);
}

.ui-catalog__footer {
  flex-wrap: wrap;
  padding-block-start: var(--a-space-5);
  border-top: var(--a-border-width) solid var(--a-border);
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
}

.ui-catalog__command-dialog {
  width: min(42rem, calc(100vw - var(--a-space-8)));
  max-width: none;
  max-height: min(44rem, calc(100dvh - var(--a-space-8)));
  margin: auto;
  padding: var(--a-space-0);
  overflow: hidden;
  border: var(--a-border-width) solid var(--a-border-strong);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
  box-shadow: var(--a-shadow-2);
}

.ui-catalog__command-dialog::backdrop {
  background: var(--a-bg-scrim);
}

.ui-catalog__command-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--a-space-4);
  padding: var(--a-space-4);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.ui-catalog__command-header h2 {
  font-size: var(--a-font-size-lg);
  letter-spacing: var(--a-letter-spacing-heading);
}

.ui-catalog__command-header p {
  margin-block-start: var(--a-space-1);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.ui-catalog__command-header button {
  padding-inline: var(--a-space-3);
  border-radius: var(--a-radius-xs);
  font-size: var(--a-font-size-xs);
}

.ui-catalog__command-search {
  position: relative;
  display: block;
  padding: var(--a-space-3) var(--a-space-4);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.ui-catalog__command-search input {
  width: 100%;
  min-height: var(--a-target-min);
  padding-inline: var(--a-space-3) var(--a-space-10);
  border: var(--a-border-width) solid var(--a-border-strong);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
  color: var(--a-text-primary);
  font: var(--a-font-size-md)/1 var(--a-font-sans);
}

.ui-catalog__command-search input::placeholder {
  color: var(--a-text-tertiary);
}

.ui-catalog__command-search kbd {
  position: absolute;
  inset-inline-end: calc(var(--a-space-4) + var(--a-space-3));
  inset-block-start: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.ui-catalog__command-results {
  max-height: min(27rem, 55dvh);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--a-space-2);
}

.ui-catalog__command-results button {
  display: grid;
  grid-template-columns: minmax(8rem, 0.55fr) minmax(12rem, 1fr);
  gap: var(--a-space-1) var(--a-space-3);
  width: 100%;
  padding: var(--a-space-3);
  border-color: transparent;
  border-radius: var(--a-radius-xs);
  text-align: start;
}

.ui-catalog__command-results button[aria-selected='true'] {
  background: var(--a-bg-selected);
}

.ui-catalog__command-results code {
  grid-row: 1 / span 2;
  align-self: center;
  color: var(--a-text-primary);
  font: var(--a-font-size-sm)/1 var(--a-font-mono);
}

.ui-catalog__command-results span {
  min-width: 0;
  overflow: hidden;
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-catalog__command-results small {
  min-width: 0;
  overflow: hidden;
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ui-catalog__command-empty {
  margin: var(--a-space-0);
  padding: var(--a-space-8) var(--a-space-4);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  text-align: center;
}

.ui-catalog__sr-only {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  margin: calc(var(--a-border-width) * -1);
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 48rem) {
  .ui-catalog {
    padding-block-start: var(--a-space-6);
  }

  .ui-catalog__intro-copy,
  .ui-catalog__quickstart {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
  }

  .ui-catalog__search-trigger {
    width: 100%;
  }
}

@media (max-width: 30rem) {
  .ui-catalog {
    padding-inline: var(--a-space-4);
  }

  .ui-catalog__version {
    flex-wrap: wrap;
  }

  .ui-catalog__tabs button {
    gap: var(--a-space-1);
    font-size: var(--a-font-size-xs);
  }

  .ui-catalog__command-dialog {
    width: calc(100vw - var(--a-space-4));
    max-height: calc(100dvh - var(--a-space-4));
  }

  .ui-catalog__command-results button {
    grid-template-columns: minmax(0, 1fr);
  }

  .ui-catalog__command-results code {
    grid-row: auto;
  }
}
</style>
