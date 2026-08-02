<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch
} from 'vue'
import type { ComponentPublicInstance } from 'vue'

import type {
  AMarketingLink,
  AMarketingLinkComponent,
  AMarketingLinkPropsResolver,
  AMarketingNavEntry,
  AMarketingNavMenu,
  AMarketingNavigationReason
} from '../types/marketing'
import AResolvedMarketingLink from './internal/AResolvedMarketingLink.vue'

const openMenu = defineModel<string | null>('openMenu', { default: null })
const mobileOpen = defineModel<boolean>('mobileOpen', { default: false })

const props = withDefaults(defineProps<{
  entries: readonly AMarketingNavEntry[]
  ariaLabel?: string
  mobileTitle?: string
  mobileOpenLabel?: string
  mobileCloseLabel?: string
  linkComponent?: AMarketingLinkComponent
  linkProps?: AMarketingLinkPropsResolver
  hoverOpenDelay?: number
  hoverCloseDelay?: number
}>(), {
  ariaLabel: 'Navegación principal',
  mobileTitle: 'Navegación',
  mobileOpenLabel: 'Abrir navegación',
  mobileCloseLabel: 'Cerrar navegación',
  hoverOpenDelay: 160,
  hoverCloseDelay: 240
})

const emit = defineEmits<{
  navigate: [link: AMarketingLink, event: MouseEvent]
  'menu-open': [id: string, reason: AMarketingNavigationReason]
  'menu-close': [id: string, reason: AMarketingNavigationReason]
  'mobile-close': [reason: AMarketingNavigationReason]
}>()

const root = ref<HTMLElement | null>(null)
const mobileTrigger = ref<HTMLButtonElement | null>(null)
const mobileDialog = ref<HTMLElement | null>(null)
const instanceId = useId()
const topControls = new Map<string, HTMLElement>()

let hoverOpenTimer: ReturnType<typeof setTimeout> | undefined
let hoverCloseTimer: ReturnType<typeof setTimeout> | undefined
let pointerPinnedMenu: string | null = null
let previousBodyOverflow = ''
let bodyLocked = false
let desktopMedia: MediaQueryList | undefined

function menuIndex(id: string) {
  return Math.max(0, props.entries.findIndex((entry) => entry.id === id))
}

function triggerId(id: string) {
  return `a-marketing-${instanceId}-trigger-${menuIndex(id)}`
}

function panelId(id: string) {
  return `a-marketing-${instanceId}-panel-${menuIndex(id)}`
}

function mobileSectionId(id: string) {
  return `a-marketing-${instanceId}-mobile-${menuIndex(id)}`
}

function resolveElement(value: Element | ComponentPublicInstance | null): HTMLElement | null {
  if (value instanceof Element) return value instanceof HTMLElement ? value : null
  const element = value?.$el
  return element instanceof HTMLElement ? element : null
}

function setTopControl(id: string, value: Element | ComponentPublicInstance | null) {
  const element = resolveElement(value)
  if (element) topControls.set(id, element)
  else topControls.delete(id)
}

function clearHoverTimers() {
  if (hoverOpenTimer) clearTimeout(hoverOpenTimer)
  if (hoverCloseTimer) clearTimeout(hoverCloseTimer)
  hoverOpenTimer = undefined
  hoverCloseTimer = undefined
}

function openDesktopMenu(id: string, reason: AMarketingNavigationReason) {
  if (desktopMedia && !desktopMedia.matches) return
  clearHoverTimers()
  if (openMenu.value === id) return
  if (openMenu.value) emit('menu-close', openMenu.value, reason)
  openMenu.value = id
  emit('menu-open', id, reason)
}

function closeDesktopMenu(reason: AMarketingNavigationReason, restoreFocus = false) {
  clearHoverTimers()
  const closingId = openMenu.value
  if (!closingId) return
  openMenu.value = null
  pointerPinnedMenu = null
  emit('menu-close', closingId, reason)
  if (restoreFocus) topControls.get(closingId)?.focus()
}

function toggleDesktopMenu(id: string) {
  if (openMenu.value === id) {
    closeDesktopMenu('toggle')
    return
  }
  pointerPinnedMenu = id
  openDesktopMenu(id, 'toggle')
}

function scheduleHoverOpen(id: string, event: PointerEvent) {
  if (event.pointerType && event.pointerType !== 'mouse') return
  clearHoverTimers()
  hoverOpenTimer = setTimeout(() => {
    if (!pointerPinnedMenu || pointerPinnedMenu === id) openDesktopMenu(id, 'hover')
  }, props.hoverOpenDelay)
}

function keepDesktopMenuOpen() {
  if (hoverCloseTimer) clearTimeout(hoverCloseTimer)
  hoverCloseTimer = undefined
}

function scheduleHoverClose(id: string) {
  if (pointerPinnedMenu === id) return
  if (hoverOpenTimer) clearTimeout(hoverOpenTimer)
  hoverCloseTimer = setTimeout(() => {
    if (openMenu.value === id) closeDesktopMenu('pointer-leave')
  }, props.hoverCloseDelay)
}

function desktopFocusableControls() {
  return props.entries
    .map((entry) => topControls.get(entry.id))
    .filter((element): element is HTMLElement => Boolean(element))
}

function moveTopFocus(current: HTMLElement, direction: 'next' | 'previous' | 'first' | 'last') {
  const controls = desktopFocusableControls()
  if (!controls.length) return
  const currentIndex = Math.max(0, controls.indexOf(current))
  const targetIndex = direction === 'first'
    ? 0
    : direction === 'last'
      ? controls.length - 1
      : direction === 'next'
        ? (currentIndex + 1) % controls.length
        : (currentIndex - 1 + controls.length) % controls.length
  controls[targetIndex]?.focus()
}

function panelFocusable(id: string) {
  const candidate = document.getElementById(panelId(id))
  const panel = candidate && root.value?.contains(candidate) ? candidate : null
  return panel
    ? [...panel.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])')]
    : []
}

async function focusPanelEdge(id: string, edge: 'first' | 'last') {
  await nextTick()
  const controls = panelFocusable(id)
  controls[edge === 'first' ? 0 : controls.length - 1]?.focus()
}

function handleTopKeydown(entry: AMarketingNavEntry, event: KeyboardEvent) {
  const control = event.currentTarget as HTMLElement
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    moveTopFocus(control, 'next')
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    moveTopFocus(control, 'previous')
  } else if (event.key === 'Home') {
    event.preventDefault()
    moveTopFocus(control, 'first')
  } else if (event.key === 'End') {
    event.preventDefault()
    moveTopFocus(control, 'last')
  } else if (entry.kind === 'menu' && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault()
    pointerPinnedMenu = entry.id
    openDesktopMenu(entry.id, 'toggle')
    void focusPanelEdge(entry.id, event.key === 'ArrowDown' ? 'first' : 'last')
  } else if (event.key === 'Escape' && openMenu.value) {
    event.preventDefault()
    closeDesktopMenu('escape', true)
  }
}

function handlePanelKeydown(menu: AMarketingNavMenu, event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDesktopMenu('escape', true)
    return
  }

  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  const controls = panelFocusable(menu.id)
  if (!controls.length) return
  event.preventDefault()
  const currentIndex = Math.max(0, controls.indexOf(document.activeElement as HTMLElement))
  const targetIndex = event.key === 'Home'
    ? 0
    : event.key === 'End'
      ? controls.length - 1
      : event.key === 'ArrowDown'
        ? (currentIndex + 1) % controls.length
        : (currentIndex - 1 + controls.length) % controls.length
  controls[targetIndex]?.focus()
}

function handleDesktopFocusOut() {
  void nextTick(() => {
    if (!openMenu.value) return
    const active = document.activeElement
    const panel = document.getElementById(panelId(openMenu.value))
    const trigger = topControls.get(openMenu.value)
    if (panel?.contains(active) || trigger?.contains(active)) return
    closeDesktopMenu('focus-leave')
  })
}

function propsFor(link: AMarketingLink) {
  return props.linkProps?.(link)
}

function handleNavigate(link: AMarketingLink, event: MouseEvent) {
  emit('navigate', link, event)
  closeDesktopMenu('navigate')
  if (mobileOpen.value) closeMobile('navigate', false)
}

function lockBodyScroll() {
  if (bodyLocked) return
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  bodyLocked = true
}

function unlockBodyScroll() {
  if (!bodyLocked) return
  document.body.style.overflow = previousBodyOverflow
  bodyLocked = false
}

async function openMobile() {
  if (desktopMedia?.matches) return
  mobileOpen.value = true
  await nextTick()
  lockBodyScroll()
  mobileDialog.value?.querySelector<HTMLElement>('[data-a-mobile-close]')?.focus()
}

function closeMobile(reason: AMarketingNavigationReason, restoreFocus = true) {
  if (!mobileOpen.value) return
  mobileOpen.value = false
  unlockBodyScroll()
  emit('mobile-close', reason)
  if (restoreFocus) void nextTick(() => mobileTrigger.value?.focus())
}

function mobileFocusable() {
  if (!mobileDialog.value) return []
  return [...mobileDialog.value.querySelectorAll<HTMLElement>(
    'a[href], summary, button:not(:disabled), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => {
    const closedDisclosure = element.closest('details:not([open])')
    return !closedDisclosure || (element.tagName === 'SUMMARY' && element.parentElement === closedDisclosure)
  })
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (!mobileOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobile('escape')
    return
  }
  if (event.key !== 'Tab') return
  const controls = mobileFocusable()
  if (!controls.length) {
    event.preventDefault()
    return
  }
  const first = controls[0]
  const last = controls[controls.length - 1]
  const active = document.activeElement
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first?.focus()
  }
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (root.value?.contains(event.target as Node)) return
  closeDesktopMenu('outside')
  if (mobileOpen.value) closeMobile('outside', false)
}

function handleDesktopBreakpoint(event: MediaQueryListEvent | MediaQueryList) {
  if (event.matches) {
    if (mobileOpen.value) closeMobile('resize', false)
  } else {
    closeDesktopMenu('resize')
  }
}

watch(mobileOpen, async (value) => {
  if (value) {
    if (desktopMedia?.matches) {
      closeMobile('model', false)
      return
    }
    closeDesktopMenu('model')
    await nextTick()
    lockBodyScroll()
    mobileDialog.value?.querySelector<HTMLElement>('[data-a-mobile-close]')?.focus()
  } else {
    unlockBodyScroll()
  }
})

watch(openMenu, (value) => {
  if (value && desktopMedia && !desktopMedia.matches) {
    closeDesktopMenu('model')
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown, true)
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  if (typeof window.matchMedia === 'function') {
    desktopMedia = window.matchMedia('(min-width: 48rem)')
    desktopMedia.addEventListener('change', handleDesktopBreakpoint)
    handleDesktopBreakpoint(desktopMedia)
  }
  if (mobileOpen.value && !desktopMedia?.matches) {
    lockBodyScroll()
    void nextTick(() => mobileDialog.value?.querySelector<HTMLElement>('[data-a-mobile-close]')?.focus())
  }
})

onBeforeUnmount(() => {
  clearHoverTimers()
  unlockBodyScroll()
  document.removeEventListener('keydown', handleDocumentKeydown, true)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  desktopMedia?.removeEventListener('change', handleDesktopBreakpoint)
})
</script>

<template>
  <div ref="root" class="a-marketing-navigation" @focusout="handleDesktopFocusOut">
    <div class="a-marketing-navigation__inner">
      <div v-if="$slots.brand" class="a-marketing-navigation__brand"><slot name="brand" /></div>

      <nav class="a-marketing-navigation__desktop" :aria-label="ariaLabel">
        <ul class="a-marketing-navigation__top-list">
          <li v-for="entry in entries" :key="entry.id" class="a-marketing-navigation__top-item">
            <AResolvedMarketingLink
              v-if="entry.kind === 'link'"
              :ref="(value) => setTopControl(entry.id, value)"
              class="a-marketing-navigation__top-link"
              data-a-marketing-top-control
              :href="entry.href"
              :external="entry.external"
              :target="entry.target"
              :rel="entry.rel"
              :download="entry.download"
              :aria-current="entry.current ? 'page' : undefined"
              :link-component="linkComponent"
              :link-props="propsFor(entry)"
              @keydown="handleTopKeydown(entry, $event)"
              @click="handleNavigate(entry, $event)"
            >
              <slot name="item-name" :item="entry" :mobile="false">{{ entry.label }}</slot>
            </AResolvedMarketingLink>
            <button
              v-else
              :id="triggerId(entry.id)"
              :ref="(value) => setTopControl(entry.id, value)"
              class="a-marketing-navigation__trigger"
              data-a-marketing-top-control
              type="button"
              :aria-expanded="openMenu === entry.id"
              :aria-controls="panelId(entry.id)"
              @click="toggleDesktopMenu(entry.id)"
              @pointerenter="scheduleHoverOpen(entry.id, $event)"
              @pointerleave="scheduleHoverClose(entry.id)"
              @keydown="handleTopKeydown(entry, $event)"
            >
              <span>{{ entry.label }}</span>
              <span class="a-marketing-navigation__chevron" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </nav>

      <div v-if="$slots['header-actions']" class="a-marketing-navigation__actions">
        <slot name="header-actions" />
      </div>

      <button
        ref="mobileTrigger"
        class="a-marketing-navigation__mobile-trigger"
        type="button"
        :aria-label="mobileOpenLabel"
        :aria-expanded="mobileOpen"
        :aria-controls="`a-marketing-${instanceId}-mobile-dialog`"
        @click="openMobile"
      >
        <span class="a-marketing-navigation__menu-icon" aria-hidden="true"><span /><span /><span /></span>
      </button>
    </div>

    <template v-for="entry in entries" :key="`panel:${entry.id}`">
      <section
        v-if="entry.kind === 'menu'"
        v-show="openMenu === entry.id"
        :id="panelId(entry.id)"
        class="a-marketing-navigation__panel"
        role="region"
        :aria-labelledby="triggerId(entry.id)"
        @pointerenter="keepDesktopMenuOpen"
        @pointerleave="scheduleHoverClose(entry.id)"
        @keydown="handlePanelKeydown(entry, $event)"
      >
        <div class="a-marketing-navigation__columns">
          <section v-for="column in entry.columns" :key="column.id" class="a-marketing-navigation__column">
            <h2 v-if="column.label" class="a-marketing-navigation__column-label">{{ column.label }}</h2>
            <ul>
              <li v-for="item in column.items" :key="item.id">
                <AResolvedMarketingLink
                  class="a-marketing-navigation__panel-link"
                  :href="item.href"
                  :external="item.external"
                  :target="item.target"
                  :rel="item.rel"
                  :download="item.download"
                  :aria-current="item.current ? 'page' : undefined"
                  :link-component="linkComponent"
                  :link-props="propsFor(item)"
                  @click="handleNavigate(item, $event)"
                >
                  <span v-if="$slots['item-icon'] || item.icon" class="a-marketing-navigation__item-icon" aria-hidden="true">
                    <slot name="item-icon" :item="item" :mobile="false">
                      <span>{{ item.icon?.slice(0, 1).toLocaleUpperCase() }}</span>
                    </slot>
                  </span>
                  <span class="a-marketing-navigation__item-copy">
                    <strong><slot name="item-name" :item="item" :mobile="false">{{ item.label }}</slot></strong>
                    <small v-if="$slots['item-description'] || item.description">
                      <slot name="item-description" :item="item" :mobile="false">{{ item.description }}</slot>
                    </small>
                  </span>
                </AResolvedMarketingLink>
              </li>
            </ul>
          </section>
        </div>
        <div v-if="entry.cta" class="a-marketing-navigation__cta">
          <slot name="cta" :menu="entry" :cta="entry.cta" :close="() => closeDesktopMenu('navigate')">
            <AResolvedMarketingLink
              class="a-marketing-navigation__cta-link"
              :href="entry.cta.href"
              :external="entry.cta.external"
              :target="entry.cta.target"
              :rel="entry.cta.rel"
              :download="entry.cta.download"
              :link-component="linkComponent"
              :link-props="propsFor(entry.cta)"
              @click="handleNavigate(entry.cta, $event)"
            >
              {{ entry.cta.label }}
            </AResolvedMarketingLink>
          </slot>
        </div>
      </section>
    </template>

    <div
      v-if="mobileOpen"
      class="a-marketing-navigation__scrim"
      @pointerdown.self="closeMobile('outside')"
    >
      <aside
        :id="`a-marketing-${instanceId}-mobile-dialog`"
        ref="mobileDialog"
        class="a-marketing-navigation__drawer"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`a-marketing-${instanceId}-mobile-title`"
      >
        <div class="a-marketing-navigation__drawer-header">
          <strong :id="`a-marketing-${instanceId}-mobile-title`">
            <slot name="mobile-header">{{ mobileTitle }}</slot>
          </strong>
          <button
            class="a-marketing-navigation__close"
            data-a-mobile-close
            type="button"
            :aria-label="mobileCloseLabel"
            @click="closeMobile('toggle')"
          >
            <span aria-hidden="true" />
          </button>
        </div>

        <nav class="a-marketing-navigation__mobile-nav" :aria-label="ariaLabel">
          <ul>
            <li v-for="entry in entries" :key="`mobile:${entry.id}`">
              <AResolvedMarketingLink
                v-if="entry.kind === 'link'"
                class="a-marketing-navigation__mobile-link"
                :href="entry.href"
                :external="entry.external"
                :target="entry.target"
                :rel="entry.rel"
                :download="entry.download"
                :aria-current="entry.current ? 'page' : undefined"
                :link-component="linkComponent"
                :link-props="propsFor(entry)"
                @click="handleNavigate(entry, $event)"
              >
                <slot name="item-name" :item="entry" :mobile="true">{{ entry.label }}</slot>
              </AResolvedMarketingLink>
              <details v-else class="a-marketing-navigation__mobile-section">
                <summary :aria-controls="mobileSectionId(entry.id)">
                  <span>{{ entry.label }}</span>
                  <span class="a-marketing-navigation__chevron" aria-hidden="true" />
                </summary>
                <div :id="mobileSectionId(entry.id)" class="a-marketing-navigation__mobile-section-content">
                  <section v-for="column in entry.columns" :key="column.id">
                    <h2 v-if="column.label">{{ column.label }}</h2>
                    <ul>
                      <li v-for="item in column.items" :key="item.id">
                        <AResolvedMarketingLink
                          class="a-marketing-navigation__mobile-item"
                          :href="item.href"
                          :external="item.external"
                          :target="item.target"
                          :rel="item.rel"
                          :download="item.download"
                          :aria-current="item.current ? 'page' : undefined"
                          :link-component="linkComponent"
                          :link-props="propsFor(item)"
                          @click="handleNavigate(item, $event)"
                        >
                          <span v-if="$slots['item-icon'] || item.icon" class="a-marketing-navigation__item-icon" aria-hidden="true">
                            <slot name="item-icon" :item="item" :mobile="true">
                              <span>{{ item.icon?.slice(0, 1).toLocaleUpperCase() }}</span>
                            </slot>
                          </span>
                          <span class="a-marketing-navigation__item-copy">
                            <strong><slot name="item-name" :item="item" :mobile="true">{{ item.label }}</slot></strong>
                            <small v-if="$slots['item-description'] || item.description">
                              <slot name="item-description" :item="item" :mobile="true">{{ item.description }}</slot>
                            </small>
                          </span>
                        </AResolvedMarketingLink>
                      </li>
                    </ul>
                  </section>
                  <div v-if="entry.cta" class="a-marketing-navigation__mobile-cta">
                    <slot name="cta" :menu="entry" :cta="entry.cta" :close="() => closeMobile('navigate')">
                      <AResolvedMarketingLink
                        class="a-marketing-navigation__cta-link"
                        :href="entry.cta.href"
                        :external="entry.cta.external"
                        :target="entry.cta.target"
                        :rel="entry.cta.rel"
                        :download="entry.cta.download"
                        :link-component="linkComponent"
                        :link-props="propsFor(entry.cta)"
                        @click="handleNavigate(entry.cta, $event)"
                      >
                        {{ entry.cta.label }}
                      </AResolvedMarketingLink>
                    </slot>
                  </div>
                </div>
              </details>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  </div>
</template>
