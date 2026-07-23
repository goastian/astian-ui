<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import type { APopoverPlacement } from '../types/core'

const props = withDefaults(defineProps<{
  triggerLabel: string
  label?: string
  placement?: APopoverPlacement
  disabled?: boolean
  dismissible?: boolean
  openOnFocus?: boolean
  focusOnOpen?: boolean
}>(), {
  label: '',
  placement: 'bottom-start',
  dismissible: true,
  openOnFocus: false,
  focusOnOpen: false
})

const emit = defineEmits<{
  open: []
  close: []
}>()

const visible = defineModel<boolean>({ default: false })
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const panelId = `a-popover-${useId()}`
const top = ref(0)
const left = ref(0)
let lastOpenSource: 'pointer' | 'keyboard' | 'focus' | 'external' = 'external'
let emittedClose = false

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(value, maximum))

const tokenPixels = (name: string) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name)
  return Number.parseFloat(value) || 0
}

const positionPanel = async () => {
  await nextTick()
  const triggerElement = trigger.value
  const panelElement = panel.value
  if (!triggerElement || !panelElement) return

  const anchor = triggerElement.getBoundingClientRect()
  const floating = panelElement.getBoundingClientRect()
  const gap = tokenPixels('--a-space-2')
  let nextTop = anchor.bottom + gap
  let nextLeft = anchor.left

  switch (props.placement) {
    case 'top-start':
      nextTop = anchor.top - floating.height - gap
      nextLeft = anchor.left
      break
    case 'top':
      nextTop = anchor.top - floating.height - gap
      nextLeft = anchor.left + (anchor.width - floating.width) / 2
      break
    case 'top-end':
      nextTop = anchor.top - floating.height - gap
      nextLeft = anchor.right - floating.width
      break
    case 'bottom':
      nextTop = anchor.bottom + gap
      nextLeft = anchor.left + (anchor.width - floating.width) / 2
      break
    case 'bottom-end':
      nextTop = anchor.bottom + gap
      nextLeft = anchor.right - floating.width
      break
    case 'left':
      nextTop = anchor.top + (anchor.height - floating.height) / 2
      nextLeft = anchor.left - floating.width - gap
      break
    case 'right':
      nextTop = anchor.top + (anchor.height - floating.height) / 2
      nextLeft = anchor.right + gap
      break
    case 'bottom-start':
    default:
      break
  }

  top.value = clamp(nextTop, gap, window.innerHeight - floating.height - gap)
  left.value = clamp(nextLeft, gap, window.innerWidth - floating.width - gap)
}

const firstFocusable = () => panel.value?.querySelector<HTMLElement>(
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
)

const show = (source: typeof lastOpenSource = 'external') => {
  if (props.disabled || visible.value) return
  lastOpenSource = source
  emittedClose = false
  visible.value = true
  emit('open')
  void positionPanel().then(() => {
    if (props.focusOnOpen || source === 'keyboard') {
      ;(firstFocusable() ?? panel.value)?.focus()
    }
  })
}

const close = (restoreFocus = false) => {
  if (!visible.value) return
  visible.value = false
  if (!emittedClose) {
    emittedClose = true
    emit('close')
  }
  if (restoreFocus) nextTick(() => trigger.value?.focus())
}

const toggle = (event: MouseEvent) => {
  if (visible.value && lastOpenSource === 'focus' && event.detail > 0) {
    lastOpenSource = 'pointer'
  } else if (visible.value) close()
  else show(event.detail === 0 ? 'keyboard' : 'pointer')
}

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!visible.value) show('keyboard')
    else nextTick(() => (firstFocusable() ?? panel.value)?.focus())
  } else if (event.key === 'Escape' && visible.value && props.dismissible) {
    event.preventDefault()
    close(true)
  }
}

const onPanelKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.dismissible) {
    event.preventDefault()
    close(true)
  }
}

const onDocumentPointerDown = (event: PointerEvent) => {
  if (!visible.value || !props.dismissible) return
  const target = event.target as Node
  if (!panel.value?.contains(target) && !trigger.value?.contains(target)) close()
}

const onViewportChange = () => {
  if (visible.value) void positionPanel()
}

watch(visible, (isVisible, wasVisible) => {
  if (isVisible && !wasVisible) {
    emittedClose = false
    void positionPanel().then(() => {
      if (props.focusOnOpen) {
        ;(firstFocusable() ?? panel.value)?.focus()
      }
    })
  } else if (!isVisible && wasVisible && !emittedClose) {
    emittedClose = true
    emit('close')
  }
})

watch(() => props.placement, () => {
  if (visible.value) void positionPanel()
})

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
  if (visible.value) {
    emittedClose = false
    void positionPanel().then(() => {
      if (props.focusOnOpen) {
        ;(firstFocusable() ?? panel.value)?.focus()
      }
    })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})

defineExpose({ open: show, close, toggle })
</script>

<template>
  <span class="a-popover">
    <button
      ref="trigger"
      type="button"
      class="a-popover__trigger"
      :disabled="disabled"
      :aria-label="triggerLabel"
      aria-haspopup="dialog"
      :aria-controls="panelId"
      :aria-expanded="visible"
      @click="toggle"
      @focus="openOnFocus && show('focus')"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger">{{ triggerLabel }}</slot>
    </button>
  </span>

  <Teleport to="body">
    <Transition name="a-popover">
      <section
        v-if="visible"
        :id="panelId"
        ref="panel"
        class="a-popover__panel"
        role="dialog"
        aria-modal="false"
        :aria-label="label || triggerLabel"
        tabindex="-1"
        :style="{ '--a-popover-top': `${top}px`, '--a-popover-left': `${left}px` }"
        @keydown="onPanelKeydown"
      >
        <slot :close="close" />
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.a-popover {
  display: inline-flex;
}

.a-popover__trigger {
  display: inline-flex;
  gap: var(--a-space-2);
  align-items: center;
  justify-content: center;
  min-width: var(--a-target-min);
  min-height: var(--a-target-min);
  padding: var(--a-space-2) var(--a-space-3);
  border: var(--a-border-width) solid transparent;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.a-popover__trigger:hover,
.a-popover__trigger[aria-expanded='true'] {
  background: var(--a-bg-hover);
}

.a-popover__trigger:disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}

.a-popover__panel {
  position: fixed;
  z-index: var(--a-z-dropdown);
  top: var(--a-popover-top);
  left: var(--a-popover-left);
  width: var(--a-layout-popover);
  max-height: calc(100dvh - var(--a-space-8));
  overflow: auto;
  padding: var(--a-space-4);
  border: var(--a-border-width) solid var(--a-border-strong);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
  box-shadow: var(--a-shadow-2);
}

.a-popover-enter-active,
.a-popover-leave-active {
  transition: opacity var(--a-motion-fast), transform var(--a-motion-fast);
}

.a-popover-enter-from,
.a-popover-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--a-space-1) * -1));
}
</style>
