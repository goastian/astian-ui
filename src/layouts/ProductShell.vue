<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useThemeMode, type ThemePreference } from '@/composables/useThemeMode'

const route = useRoute()
const drawerOpen = ref(false)
const isOverlay = ref(false)
const mainContent = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)
const drawer = ref<HTMLElement | null>(null)
const { preference } = useThemeMode()

let drawerMedia: MediaQueryList | null = null

const products = [
  { label: 'Design system', caption: 'Tokens y componentes', to: '/ui', key: 'ui', index: '01' },
  { label: 'AstianGO', caption: 'Búsqueda privada', to: '/astiango', key: 'astiango', index: '02' },
  { label: 'Astian Cloud', caption: 'Archivos protegidos', to: '/cloud', key: 'cloud', index: '03' },
  { label: 'Calendar', caption: 'Tiempo bajo control', to: '/calendar', key: 'calendar', index: '04' },
  { label: 'Midori', caption: 'Navegación privada', to: '/midori', key: 'midori', index: '05' }
]

const currentProduct = computed(() => products.find((item) => item.key === route.name) ?? products[0])
const themeOptions: Array<{ label: string, value: ThemePreference }> = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' }
]

const syncDrawerMode = (event?: MediaQueryListEvent) => {
  isOverlay.value = event?.matches ?? drawerMedia?.matches ?? false
  if (!isOverlay.value) drawerOpen.value = false
}

const focusFirstDrawerLink = (attempt = 0) => {
  if (!drawerOpen.value) return

  const target = drawer.value?.querySelector<HTMLElement>('a[href]')
  target?.focus({ preventScroll: true })
  if (target && document.activeElement !== target && attempt < 4) {
    requestAnimationFrame(() => focusFirstDrawerLink(attempt + 1))
  }
}

const openDrawer = () => {
  drawerOpen.value = true
  void nextTick(() => {
    requestAnimationFrame(() => focusFirstDrawerLink())
  })
}

const closeDrawer = async (restoreFocus = true) => {
  if (!drawerOpen.value) return
  drawerOpen.value = false
  if (restoreFocus) {
    await nextTick()
    menuButton.value?.focus()
  }
}

const toggleDrawer = () => drawerOpen.value ? closeDrawer() : openDrawer()

const handleProductSelected = () => {
  if (isOverlay.value) void closeDrawer(false)
}

const handleShellKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOverlay.value && drawerOpen.value) {
    event.preventDefault()
    void closeDrawer()
  }
}

const trapDrawerFocus = (event: KeyboardEvent) => {
  if (!isOverlay.value || !drawerOpen.value || event.key !== 'Tab') return

  const focusable = Array.from(drawer.value?.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ) ?? []).filter((element) => !element.hasAttribute('inert'))
  const first = focusable.at(0)
  const last = focusable.at(-1)
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  drawerMedia = window.matchMedia('(max-width: 61.249rem)')
  syncDrawerMode()
  drawerMedia.addEventListener('change', syncDrawerMode)
})

onBeforeUnmount(() => drawerMedia?.removeEventListener('change', syncDrawerMode))

watch(() => route.fullPath, async () => {
  drawerOpen.value = false
  await nextTick()
  mainContent.value?.focus({ preventScroll: true })
})
</script>

<template>
  <div class="product-shell" @keydown="handleShellKeydown">
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>

    <header class="product-shell__header">
      <button
        ref="menuButton"
        class="product-shell__menu product-shell__icon-button"
        type="button"
        aria-controls="product-navigation"
        :aria-expanded="drawerOpen"
        aria-label="Abrir navegación"
        @click="toggleDrawer"
      >
        <span class="product-shell__menu-mark" aria-hidden="true" />
      </button>

      <router-link to="/ui" class="product-shell__brand" aria-label="Astian UI, inicio">
        <span class="product-shell__mark" aria-hidden="true"><span /><span /></span>
        <span class="product-shell__wordmark"><strong>astian</strong><small>design language</small></span>
      </router-link>

      <p class="product-shell__product" aria-live="polite">
        <span aria-hidden="true">{{ currentProduct.index }}</span>
        {{ currentProduct.label }}
      </p>

      <label class="product-shell__theme">
        <span class="a-visually-hidden">Tema</span>
        <select v-model="preference" aria-label="Tema">
          <option v-for="option in themeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </header>

    <div class="product-shell__body">
      <button
        class="product-shell__scrim"
        :class="{ 'product-shell__scrim--open': drawerOpen }"
        type="button"
        tabindex="-1"
        aria-label="Cerrar navegación"
        @click="closeDrawer()"
      />

      <aside
        id="product-navigation"
        ref="drawer"
        class="product-shell__drawer"
        :class="{ 'product-shell__drawer--open': drawerOpen }"
        :aria-hidden="isOverlay && !drawerOpen ? 'true' : undefined"
        :inert="isOverlay && !drawerOpen"
        @keydown="trapDrawerFocus"
      >
        <nav aria-label="Productos Astian" class="product-shell__nav">
          <p class="product-shell__nav-label">Productos Astian</p>
          <router-link
            v-for="product in products"
            :key="product.key"
            :to="product.to"
            class="product-shell__nav-item"
            active-class="product-shell__nav-item--active"
            @click="handleProductSelected"
          >
            <span class="product-shell__nav-index" aria-hidden="true">{{ product.index }}</span>
            <span class="product-shell__nav-copy">
              <strong>{{ product.label }}</strong>
              <small>{{ product.caption }}</small>
            </span>
          </router-link>

          <p class="product-shell__nav-note">
            <strong>Astian UI</strong>
            Componentes pequeños, accesibles y seguros para SSR.
          </p>
        </nav>
      </aside>

      <div id="main-content" ref="mainContent" class="product-shell__main" tabindex="-1">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-shell {
  min-height: 100dvh;
  background: var(--a-bg-canvas);
  color: var(--a-text-primary);
}

.product-shell__header {
  position: sticky;
  z-index: var(--a-z-sticky-nav);
  top: 0;
  display: flex;
  gap: var(--a-space-3);
  align-items: center;
  min-height: var(--a-layout-header);
  padding-inline: clamp(var(--a-space-3), 2vw, var(--a-space-6));
  border-bottom: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-canvas);
}

.product-shell__menu {
  display: none;
}

.product-shell__icon-button {
  flex: none;
  width: var(--a-target-min);
  height: var(--a-target-min);
  padding: 0;
  border: 0;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-primary);
  cursor: pointer;
}

.product-shell__icon-button:hover {
  background: var(--a-bg-hover);
}

.product-shell__menu-mark {
  display: block;
  width: 1.125rem;
  height: var(--a-border-width-strong);
  border-radius: var(--a-radius-round);
  background: currentColor;
  box-shadow: 0 -0.375rem currentColor, 0 0.375rem currentColor;
}

.product-shell__brand {
  display: inline-flex;
  flex: none;
  gap: var(--a-space-2);
  align-items: center;
  min-height: var(--a-target-min);
  color: inherit;
  text-decoration: none;
}

.product-shell__wordmark {
  display: grid;
  line-height: 1;
}

.product-shell__brand strong {
  font-size: var(--a-font-size-md);
  letter-spacing: -0.03em;
}

.product-shell__brand small {
  margin-top: var(--a-space-1);
  color: var(--a-text-tertiary);
  font: 0.5625rem/1.2 var(--a-font-mono);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.product-shell__mark {
  position: relative;
  display: block;
  width: 1.5rem;
  height: 1.5rem;
  transform: rotate(45deg);
}

.product-shell__mark span {
  position: absolute;
  display: block;
  border-radius: var(--a-radius-xs);
  background: var(--a-text-primary);
}

.product-shell__mark span:first-child {
  inset: 0.125rem 0.625rem 0.125rem 0.125rem;
}

.product-shell__mark span:last-child {
  inset: 0.625rem 0.125rem 0.125rem 0.625rem;
  background: var(--a-accent);
}

.product-shell__product {
  display: inline-flex;
  gap: var(--a-space-2);
  align-items: center;
  min-width: 0;
  margin: 0;
  padding-inline-start: var(--a-space-4);
  border-inline-start: var(--a-border-width) solid var(--a-border);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
  white-space: nowrap;
}

.product-shell__product span {
  color: var(--a-accent);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.product-shell__theme {
  display: block;
  flex: none;
  margin-inline-start: auto;
}

.product-shell__theme select {
  min-width: 7rem;
  min-height: var(--a-target-min);
  padding: 0 var(--a-space-8) 0 var(--a-space-3);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-canvas);
  color: var(--a-text-primary);
  cursor: pointer;
}

.product-shell__body {
  display: grid;
  grid-template-columns: var(--a-layout-nav) minmax(0, 1fr);
  min-height: calc(100dvh - var(--a-layout-header));
}

.product-shell__drawer {
  position: sticky;
  top: var(--a-layout-header);
  align-self: start;
  height: calc(100dvh - var(--a-layout-header));
  border-inline-end: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-canvas);
}

.product-shell__nav {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--a-space-6) var(--a-space-3) var(--a-space-4);
}

.product-shell__nav-label {
  margin: 0 var(--a-space-3) var(--a-space-3);
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.product-shell__nav-item {
  display: grid;
  grid-template-columns: 1.75rem minmax(0, 1fr);
  gap: var(--a-space-2);
  align-items: center;
  min-height: var(--a-target-min);
  margin-block-end: var(--a-space-1);
  padding: var(--a-space-2) var(--a-space-3);
  border-radius: var(--a-radius-sm);
  color: var(--a-text-secondary);
  text-decoration: none;
  transition: background var(--a-motion-fast), color var(--a-motion-fast);
}

.product-shell__nav-item:hover {
  background: var(--a-bg-muted);
  color: var(--a-text-primary);
}

.product-shell__nav-item--active {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.product-shell__nav-index {
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.product-shell__nav-item--active .product-shell__nav-index {
  color: var(--a-accent);
}

.product-shell__nav-copy {
  display: grid;
  min-width: 0;
}

.product-shell__nav-copy strong {
  font-size: var(--a-font-size-sm);
}

.product-shell__nav-copy small {
  margin-top: var(--a-space-1);
  overflow: hidden;
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-shell__nav-note {
  display: grid;
  gap: var(--a-space-1);
  margin: auto var(--a-space-3) 0;
  padding-block-start: var(--a-space-4);
  border-block-start: var(--a-border-width) solid var(--a-border);
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
  line-height: 1.5;
}

.product-shell__nav-note strong {
  color: var(--a-text-secondary);
}

.product-shell__main {
  min-width: 0;
  outline: none;
}

.product-shell__scrim {
  display: none;
}

@media (max-width: 61.249rem) {
  .product-shell__menu {
    display: grid;
    place-items: center;
  }

  .product-shell__product {
    display: none;
  }

  .product-shell__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .product-shell__drawer {
    position: fixed;
    z-index: var(--a-z-modal);
    top: var(--a-layout-header);
    bottom: 0;
    left: 0;
    width: var(--a-layout-drawer);
    height: auto;
    visibility: hidden;
    transform: translateX(-100%);
    transition: transform var(--a-motion-base), visibility 0s linear var(--a-duration-base);
  }

  .product-shell__drawer--open {
    visibility: visible;
    transform: translateX(0);
    transition-delay: 0s;
  }

  .product-shell__scrim {
    position: fixed;
    z-index: var(--a-z-overlay);
    inset: var(--a-layout-header) 0 0;
    display: block;
    width: 100%;
    height: auto;
    padding: 0;
    border: 0;
    background: var(--a-bg-scrim);
    opacity: 0;
    visibility: hidden;
    cursor: default;
    transition: opacity var(--a-motion-base), visibility 0s linear var(--a-duration-base);
  }

  .product-shell__scrim--open {
    opacity: 1;
    visibility: visible;
    transition-delay: 0s;
  }
}

@media (max-width: 30rem) {
  .product-shell__header {
    gap: var(--a-space-2);
    padding-inline: var(--a-space-2);
  }

  .product-shell__brand small {
    display: none;
  }

  .product-shell__theme select {
    min-width: 6.25rem;
    padding-inline: var(--a-space-2) var(--a-space-6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-shell__drawer,
  .product-shell__scrim {
    transition-duration: 1ms;
  }
}
</style>
