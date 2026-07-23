<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, useId, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import type { ADrawerPosition } from '../types/core'

type CloseReason = 'escape' | 'outside' | 'close-button'

const open = defineModel<boolean>({ required: true })

const props = withDefaults(defineProps<{
  position?: ADrawerPosition
  modal?: boolean
  title?: string
  description?: string
  label?: string
  showClose?: boolean
  closeLabel?: string
  closeOnEscape?: boolean
  closeOnOutside?: boolean
  initialFocus?: string
}>(), {
  position: 'right',
  modal: true,
  label: 'Panel',
  showClose: true,
  closeLabel: 'Cerrar panel',
  closeOnEscape: true,
  closeOnOutside: true
})

const emit = defineEmits<{
  close: [reason: CloseReason]
  open: []
}>()

const instanceId = useId()
const titleId = `a-drawer-title-${instanceId}`
const descriptionId = `a-drawer-description-${instanceId}`

let panel: HTMLElement | null = null
let previouslyFocused: HTMLElement | null = null
let pendingFocusRestore: HTMLElement | null = null
let bodyScrollLocked = false

const lockBodyScroll = () => {
  if (!props.modal || bodyScrollLocked || typeof document === 'undefined') return
  const body = document.body
  const lockCount = Number(body.dataset.aDrawerLockCount ?? 0)
  if (lockCount === 0) body.dataset.aDrawerPreviousOverflow = body.style.overflow
  body.dataset.aDrawerLockCount = String(lockCount + 1)
  body.style.overflow = 'hidden'
  bodyScrollLocked = true
}

const unlockBodyScroll = () => {
  if (!bodyScrollLocked || typeof document === 'undefined') return
  const body = document.body
  const nextCount = Math.max(0, Number(body.dataset.aDrawerLockCount ?? 1) - 1)
  if (nextCount === 0) {
    body.style.overflow = body.dataset.aDrawerPreviousOverflow ?? ''
    delete body.dataset.aDrawerLockCount
    delete body.dataset.aDrawerPreviousOverflow
  } else {
    body.dataset.aDrawerLockCount = String(nextCount)
  }
  bodyScrollLocked = false
}

const setPanel = (element: Element | ComponentPublicInstance | null) => {
  const resolved = element instanceof Element ? element : element?.$el
  panel = resolved instanceof HTMLElement ? resolved : null
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

const currentFocusReturnTarget = () => {
  const active = document.activeElement
  if (!(active instanceof HTMLElement)) return null
  return active.closest<HTMLElement>(focusableSelector) ?? active
}

const focusableElements = () => {
  if (!panel) return []
  return Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => {
      if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false
      const closedDetails = element.closest('details:not([open])')
      if (closedDetails && !element.closest('summary')) return false

      let ancestor: HTMLElement | null = element
      while (ancestor && ancestor !== panel) {
        const styles = window.getComputedStyle(ancestor)
        if (styles.display === 'none' || styles.visibility === 'hidden') return false
        ancestor = ancestor.parentElement
      }
      return true
    })
}

const isTopmostModal = () => {
  if (!props.modal || !panel) return true
  const modals = Array.from(document.querySelectorAll<HTMLElement>('[data-a-modal-drawer="true"]'))
  return modals.at(-1) === panel
}

const focusInitialElement = () => {
  if (!panel) return
  let requested: HTMLElement | null = null
  if (props.initialFocus) {
    try {
      requested = panel.querySelector<HTMLElement>(props.initialFocus)
    } catch {
      requested = null
    }
  }
  ;(requested ?? focusableElements()[0] ?? panel).focus({ preventScroll: true })
}

const restorePendingFocus = () => {
  const focusTarget = pendingFocusRestore
  pendingFocusRestore = null
  if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true })
}

const requestClose = (reason: CloseReason) => {
  open.value = false
  emit('close', reason)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!open.value || !panel || !isTopmostModal()) return

  const focusIsInside = panel.contains(document.activeElement)
  if (event.key === 'Escape' && props.closeOnEscape && (props.modal || focusIsInside)) {
    event.preventDefault()
    requestClose('escape')
    return
  }

  if (!props.modal || event.key !== 'Tab') return

  const elements = focusableElements()
  if (elements.length === 0) {
    event.preventDefault()
    panel.focus({ preventScroll: true })
    return
  }

  const first = elements[0]
  const last = elements[elements.length - 1]
  if (event.shiftKey && (document.activeElement === first || !focusIsInside)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (document.activeElement === last || !focusIsInside)) {
    event.preventDefault()
    first.focus()
  }
}

const handleFocusIn = (event: FocusEvent) => {
  if (!open.value || !props.modal || !panel || !isTopmostModal()) return
  if (event.target instanceof Node && !panel.contains(event.target)) focusInitialElement()
}

const handleOutsideClick = (event: MouseEvent) => {
  if (
    props.modal &&
    props.closeOnOutside &&
    event.target === event.currentTarget &&
    isTopmostModal()
  ) {
    requestClose('outside')
  }
}

watch(open, async (isOpen) => {
  if (isOpen) {
    pendingFocusRestore = null
    lockBodyScroll()
    previouslyFocused = currentFocusReturnTarget()
    await nextTick()
    focusInitialElement()
    emit('open')
    return
  }

  unlockBodyScroll()
  pendingFocusRestore = previouslyFocused
  previouslyFocused = null
  await nextTick()
  if (pendingFocusRestore?.isConnected) pendingFocusRestore.focus({ preventScroll: true })
}, { flush: 'sync' })

onMounted(async () => {
  document.addEventListener('keydown', handleKeydown, true)
  document.addEventListener('focusin', handleFocusIn, true)

  if (open.value && props.modal) {
    lockBodyScroll()
    previouslyFocused = currentFocusReturnTarget()
    await nextTick()
    focusInitialElement()
    emit('open')
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown, true)
  document.removeEventListener('focusin', handleFocusIn, true)
  unlockBodyScroll()
  pendingFocusRestore = pendingFocusRestore ?? previouslyFocused
  restorePendingFocus()
})

defineExpose({
  close: () => requestClose('close-button'),
  focus: focusInitialElement
})
</script>

<template>
  <Teleport to="body" :disabled="!modal">
    <Transition name="a-drawer" @after-leave="restorePendingFocus">
      <div
        v-if="open"
        class="a-drawer"
        :class="[
          `a-drawer--${position}`,
          { 'a-drawer--modal': modal, 'a-drawer--non-modal': !modal }
        ]"
        @mousedown="handleOutsideClick"
      >
        <section
          :ref="setPanel"
          class="a-drawer__panel"
          :class="`a-drawer__panel--${position}`"
          :role="modal ? 'dialog' : 'region'"
          :aria-modal="modal ? 'true' : undefined"
          :aria-labelledby="title && !$slots.header ? titleId : undefined"
          :aria-describedby="description && !$slots.header ? descriptionId : undefined"
          :aria-label="title && !$slots.header ? undefined : (title || label)"
          :data-a-modal-drawer="modal ? 'true' : undefined"
          tabindex="-1"
          @mousedown.stop
        >
          <header v-if="title || description || showClose || $slots.header" class="a-drawer__header">
            <slot name="header" :title-id="titleId" :description-id="descriptionId">
              <div class="a-drawer__heading">
                <h2 v-if="title" :id="titleId">{{ title }}</h2>
                <p v-if="description" :id="descriptionId">{{ description }}</p>
              </div>
            </slot>
            <button
              v-if="showClose"
              type="button"
              class="a-drawer__close"
              :aria-label="closeLabel"
              @click="requestClose('close-button')"
            >
              <q-icon name="close" aria-hidden="true" />
            </button>
          </header>

          <div class="a-drawer__content">
            <slot />
          </div>

          <footer v-if="$slots.actions" class="a-drawer__actions">
            <slot name="actions" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.a-drawer {
  display: flex;
  min-width: 0;
  min-height: 0;
  color: var(--a-text-primary);
}

.a-drawer--modal {
  position: fixed;
  z-index: var(--a-z-modal);
  inset: var(--a-space-0);
  background: var(--a-bg-scrim);
}

.a-drawer--right,
.a-drawer--bottom {
  justify-content: flex-end;
}

.a-drawer--bottom {
  align-items: flex-end;
}

.a-drawer__panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
  box-shadow: var(--a-shadow-2);
  outline: none;
}

.a-drawer__panel:focus-visible {
  box-shadow: var(--a-shadow-focus), var(--a-shadow-2);
}

.a-drawer__panel--left,
.a-drawer__panel--right {
  width: var(--a-layout-drawer);
  height: 100%;
}

.a-drawer__panel--top,
.a-drawer__panel--bottom {
  width: 100%;
  max-height: calc(100dvh - var(--a-space-8));
}

.a-drawer__panel--left {
  border-radius: var(--a-space-0) var(--a-radius-lg) var(--a-radius-lg) var(--a-space-0);
}

.a-drawer__panel--right {
  border-radius: var(--a-radius-lg) var(--a-space-0) var(--a-space-0) var(--a-radius-lg);
}

.a-drawer__panel--top {
  border-radius: var(--a-space-0) var(--a-space-0) var(--a-radius-lg) var(--a-radius-lg);
}

.a-drawer__panel--bottom {
  border-radius: var(--a-radius-lg) var(--a-radius-lg) var(--a-space-0) var(--a-space-0);
}

.a-drawer--non-modal .a-drawer__panel {
  box-shadow: none;
}

.a-drawer__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--a-space-4);
  padding: var(--a-space-5) var(--a-space-5) var(--a-space-3);
}

.a-drawer__heading {
  min-width: 0;
}

.a-drawer__heading h2,
.a-drawer__heading p {
  margin: var(--a-space-0);
}

.a-drawer__heading h2 {
  font-size: var(--a-font-size-xl);
  line-height: var(--a-line-height-tight);
}

.a-drawer__heading p {
  margin-top: var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
}

.a-drawer__close {
  display: inline-grid;
  width: var(--a-target-min);
  min-width: var(--a-target-min);
  height: var(--a-target-min);
  place-items: center;
  border: var(--a-border-width) solid transparent;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-secondary);
  cursor: pointer;
}

.a-drawer__close:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-drawer__close:focus-visible {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
  outline: none;
}

.a-drawer__content {
  min-width: 0;
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: var(--a-space-4) var(--a-space-5) var(--a-space-5);
}

.a-drawer__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--a-space-2);
  padding: var(--a-space-3) var(--a-space-5) var(--a-space-5);
  border-top: var(--a-border-width) solid var(--a-border);
}

.a-drawer-enter-active,
.a-drawer-leave-active {
  transition: opacity var(--a-motion-base);
}

.a-drawer-enter-active .a-drawer__panel,
.a-drawer-leave-active .a-drawer__panel {
  transition: transform var(--a-motion-base);
}

.a-drawer-enter-from,
.a-drawer-leave-to {
  opacity: 0;
}

.a-drawer-enter-from .a-drawer__panel--left,
.a-drawer-leave-to .a-drawer__panel--left {
  transform: translateX(-100%);
}

.a-drawer-enter-from .a-drawer__panel--right,
.a-drawer-leave-to .a-drawer__panel--right {
  transform: translateX(100%);
}

.a-drawer-enter-from .a-drawer__panel--top,
.a-drawer-leave-to .a-drawer__panel--top {
  transform: translateY(-100%);
}

.a-drawer-enter-from .a-drawer__panel--bottom,
.a-drawer-leave-to .a-drawer__panel--bottom {
  transform: translateY(100%);
}
</style>
