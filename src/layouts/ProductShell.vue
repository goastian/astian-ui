<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

import AAvatar from '@/components/AAvatar.vue'
import AIconButton from '@/components/AIconButton.vue'
import ASelect from '@/components/ASelect.vue'
import { useThemeMode, type ThemePreference } from '@/composables/useThemeMode'
import { shouldCloseProductDrawer } from '@/utils/navigation'

const route = useRoute()
const $q = useQuasar()
const drawerOpen = ref(false)
const mainContent = ref<HTMLElement | null>(null)
const { preference } = useThemeMode()

const products = [
  { label: 'Design system', caption: 'Tokens y componentes', icon: 'widgets', to: '/ui', key: 'ui' },
  { label: 'AstianGO', caption: 'Búsqueda privada', icon: 'travel_explore', to: '/astiango', key: 'astiango' },
  { label: 'Astian Cloud', caption: 'Archivos protegidos', icon: 'cloud', to: '/cloud', key: 'cloud' },
  { label: 'Calendar', caption: 'Tiempo bajo control', icon: 'calendar_month', to: '/calendar', key: 'calendar' },
  { label: 'Midori', caption: 'Navegación privada', icon: 'language', to: '/midori', key: 'midori' }
]

const currentProduct = computed(() => products.find((item) => item.key === route.name) ?? products[0])
const themeOptions = [
  { label: 'Sistema', value: 'system', icon: 'computer' },
  { label: 'Claro', value: 'light', icon: 'light_mode' },
  { label: 'Oscuro', value: 'dark', icon: 'dark_mode' }
]

const handleProductSelected = () => {
  if (shouldCloseProductDrawer($q.screen.width < 980)) drawerOpen.value = false
}

watch(() => route.fullPath, async () => {
  await nextTick()
  mainContent.value?.focus({ preventScroll: true })
})
</script>

<template>
  <q-layout view="hHh Lpr lFf" class="product-shell">
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
    <q-header class="product-shell__header">
      <q-toolbar class="product-shell__toolbar">
        <AIconButton class="product-shell__menu" icon="menu" label="Abrir navegación" @click="drawerOpen = !drawerOpen" />
        <router-link to="/ui" class="product-shell__brand" aria-label="Astian UI, inicio">
          <span class="product-shell__mark" aria-hidden="true"><span></span><span></span></span>
          <span><strong>astian</strong><small>design language</small></span>
        </router-link>
        <div class="product-shell__product"><q-icon :name="currentProduct.icon" /><span>{{ currentProduct.label }}</span></div>
        <q-space />
        <ASelect v-model="preference" class="product-shell__theme" :options="themeOptions" aria-label="Tema" size="small" />
        <AIconButton icon="notifications" label="Notificaciones" />
        <AAvatar label="Lucía Rivera" color="orange" size="xmedium" rounded show-badge />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above :width="250" :breakpoint="980" class="product-shell__drawer">
      <nav aria-label="Productos Astian" class="product-shell__nav">
        <p class="product-shell__nav-label">Productos</p>
        <router-link v-for="product in products" :key="product.key" :to="product.to" class="product-shell__nav-item" active-class="product-shell__nav-item--active" @click="handleProductSelected">
          <span class="product-shell__nav-icon"><q-icon :name="product.icon" /></span>
          <span><strong>{{ product.label }}</strong><small>{{ product.caption }}</small></span>
          <q-icon name="chevron_right" />
        </router-link>
        <div class="product-shell__nav-note">
          <span class="a-eyebrow">MIGRACIÓN 01</span>
          <p>Una base común para que cada producto conserve su carácter sin duplicar decisiones.</p>
        </div>
      </nav>
    </q-drawer>

    <q-page-container>
      <main id="main-content" ref="mainContent" class="product-shell__main" tabindex="-1">
        <router-view />
      </main>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.product-shell { background: var(--a-bg-canvas); color: var(--a-text-primary); }
.product-shell__main { min-width: 0; outline: none; }
.product-shell__header { border-bottom: 1px solid var(--a-border); background: color-mix(in srgb, var(--a-bg-canvas) 88%, transparent); color: var(--a-text-primary); backdrop-filter: blur(18px); }
.product-shell__toolbar { min-height: 66px; padding-inline: clamp(12px, 2vw, 28px); gap: 10px; }
.product-shell__menu { display: none; }.product-shell__brand { display: inline-flex; align-items: center; gap: 10px; min-width: 220px; color: inherit; text-decoration: none; }.product-shell__brand > span:last-child { display: grid; line-height: 1.05; }.product-shell__brand strong { font-size: 1rem; letter-spacing: -.03em; }.product-shell__brand small { color: var(--a-text-tertiary); font: .57rem/1.3 var(--a-font-mono); letter-spacing: .05em; text-transform: uppercase; }
.product-shell__mark { position: relative; display: block; width: 28px; height: 28px; transform: rotate(45deg); }.product-shell__mark span { position: absolute; display: block; border-radius: 4px; background: var(--a-primary); }.product-shell__mark span:first-child { inset: 2px 12px 2px 2px; }.product-shell__mark span:last-child { inset: 12px 2px 2px 12px; background: var(--a-accent); }
.product-shell__product { display: flex; gap: 8px; align-items: center; border-left: 1px solid var(--a-border); padding-left: 18px; color: var(--a-text-secondary); font-size: .82rem; font-weight: 600; }.product-shell__theme { width: 125px; }
.product-shell__drawer { border-right: 1px solid var(--a-border); background: var(--a-bg-canvas); color: var(--a-text-primary); }.product-shell__nav { display: flex; flex-direction: column; height: 100%; padding: 20px 12px; }.product-shell__nav-label { margin: 0 10px 8px; color: var(--a-text-tertiary); font: 700 .65rem var(--a-font-mono); letter-spacing: .08em; text-transform: uppercase; }.product-shell__nav-item { display: grid; grid-template-columns: 34px 1fr auto; gap: 10px; align-items: center; margin-bottom: 3px; padding: 10px; border-radius: 12px; color: var(--a-text-secondary); text-decoration: none; transition: background var(--a-motion-fast), color var(--a-motion-fast), transform var(--a-motion-fast); }.product-shell__nav-item:hover { background: var(--a-bg-muted); color: var(--a-text-primary); transform: translateX(2px); }.product-shell__nav-item--active { background: var(--a-primary-soft); color: var(--a-primary); }.product-shell__nav-item > span:nth-child(2) { display: grid; }.product-shell__nav-item strong { color: inherit; font-size: .82rem; }.product-shell__nav-item small { margin-top: 2px; color: var(--a-text-tertiary); font-size: .68rem; }.product-shell__nav-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; background: var(--a-bg-raised); box-shadow: inset 0 0 0 1px var(--a-border); }.product-shell__nav-note { margin: auto 4px 0; padding: 16px; border-top: 1px solid var(--a-border); }.product-shell__nav-note p { margin: 10px 0 0; color: var(--a-text-secondary); font-size: .72rem; line-height: 1.55; }
@media (max-width: 980px) { .product-shell__menu { display: inline-flex; }.product-shell__brand { min-width: 0; }.product-shell__brand small,.product-shell__product { display: none; } }
@media (max-width: 600px) { .product-shell__theme { display: none; }.product-shell__toolbar { padding-inline: 8px; }.product-shell__brand { margin-right: 2px; } }
</style>
