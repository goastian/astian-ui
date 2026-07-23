<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { AContextMenuItem } from '../types/core'
import AContextMenuLevel from './internal/AContextMenuLevel.vue'

const props = withDefaults(defineProps<{
  items: AContextMenuItem[]
  label?: string
  disabled?: boolean
  closeOnSelect?: boolean
}>(), {
  label: 'Acciones contextuales',
  closeOnSelect: true
})

const emit = defineEmits<{
  select: [item: AContextMenuItem]
  open: []
  close: []
}>()

const visible = defineModel<boolean>({ default: false })

const trigger = ref<HTMLElement | null>(null)
const menuContainer = ref<HTMLElement | null>(null)
const menu = ref<{ focusFirst: () => void } | null>(null)
const x = ref(0)
const y = ref(0)
let returnFocusTo: HTMLElement | null = null
let emittedClose = false

const alignSubmenusLeft = computed(() =>
  typeof window !== 'undefined' && x.value > window.innerWidth / 2
)

const positionMenu = async () => {
  await nextTick()
  const element = menuContainer.value
  if (!element) return
  const bounds = element.getBoundingClientRect()
  x.value = Math.max(0, Math.min(x.value, window.innerWidth - bounds.width))
  y.value = Math.max(0, Math.min(y.value, window.innerHeight - bounds.height))
}

const showAt = (clientX: number, clientY: number, focusTarget?: HTMLElement | null) => {
  if (props.disabled || !props.items.length) return
  returnFocusTo = focusTarget ?? (document.activeElement instanceof HTMLElement
    ? document.activeElement
    : trigger.value)
  x.value = clientX
  y.value = clientY
  emittedClose = false
  visible.value = true
  emit('open')
  void positionMenu().then(() => menu.value?.focusFirst())
}

const showFromTrigger = () => {
  const bounds = trigger.value?.getBoundingClientRect()
  if (!bounds) return
  showAt(bounds.left, bounds.bottom)
}

const close = (restoreFocus = true) => {
  if (!visible.value) return
  visible.value = false
  if (!emittedClose) {
    emittedClose = true
    emit('close')
  }
  if (restoreFocus) {
    nextTick(() => {
      const target = returnFocusTo?.isConnected ? returnFocusTo : trigger.value
      target?.focus()
    })
  }
}

const onContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  const eventTarget = event.target instanceof HTMLElement
    ? event.target.closest<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    : null
  showAt(event.clientX, event.clientY, eventTarget ?? trigger.value)
}

const onTriggerKeydown = (event: KeyboardEvent) => {
  if ((event.shiftKey && event.key === 'F10') || event.key === 'ContextMenu') {
    event.preventDefault()
    showFromTrigger()
  }
}

const onSelect = (item: AContextMenuItem) => {
  emit('select', item)
  if (props.closeOnSelect) close()
}

const onDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target as Node
  if (
    visible.value &&
    !menuContainer.value?.contains(target) &&
    !trigger.value?.contains(target)
  ) close(false)
}

const onViewportChange = () => {
  if (visible.value) void positionMenu()
}

watch(visible, (isVisible, wasVisible) => {
  if (isVisible && !wasVisible) {
    if (!returnFocusTo) returnFocusTo = trigger.value
    if (x.value === 0 && y.value === 0) showFromTrigger()
    else void positionMenu().then(() => menu.value?.focusFirst())
  } else if (!isVisible && wasVisible && !emittedClose) {
    emittedClose = true
    emit('close')
    nextTick(() => {
      const target = returnFocusTo?.isConnected ? returnFocusTo : trigger.value
      target?.focus()
    })
  }
})

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})

defineExpose({ open: showFromTrigger, close })
</script>

<template>
  <span
    ref="trigger"
    class="a-context-menu-trigger"
    :class="{ 'a-context-menu-trigger--disabled': disabled }"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    aria-haspopup="menu"
    :aria-expanded="visible"
    @contextmenu="onContextMenu"
    @keydown="onTriggerKeydown"
  >
    <slot :open="showFromTrigger" :close="close" />
  </span>

  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuContainer"
      class="a-context-menu"
      :class="{ 'a-context-menu--align-left': alignSubmenusLeft }"
      :style="{ '--a-context-menu-x': `${x}px`, '--a-context-menu-y': `${y}px` }"
    >
      <AContextMenuLevel
        ref="menu"
        :items="items"
        :label="label"
        @select="onSelect"
        @close="close"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.a-context-menu-trigger {
  display: block;
  min-height: var(--a-target-min);
}

.a-context-menu-trigger--disabled {
  pointer-events: none;
}

.a-context-menu {
  position: fixed;
  z-index: var(--a-z-dropdown);
  top: var(--a-context-menu-y);
  left: var(--a-context-menu-x);
}

.a-context-menu--align-left :deep(.a-context-menu-level--nested) {
  right: 100%;
  left: auto;
}
</style>
