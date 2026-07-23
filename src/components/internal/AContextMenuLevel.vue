<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import type { AContextMenuItem } from '../../types/core'

defineOptions({ name: 'AContextMenuLevel' })

const props = withDefaults(defineProps<{
  items: AContextMenuItem[]
  label: string
  nested?: boolean
}>(), {
  nested: false
})

const emit = defineEmits<{
  select: [item: AContextMenuItem]
  close: [restoreFocus?: boolean]
  back: []
}>()

const activeIndex = ref(-1)
const openSubmenuIndex = ref(-1)
const itemButtons = ref<Array<HTMLButtonElement | null>>([])
const submenu = ref<{ focusFirst: () => void } | null>(null)

const enabledIndexes = () =>
  props.items.reduce<number[]>((indexes, item, index) => {
    if (!item.separator && !item.disabled) indexes.push(index)
    return indexes
  }, [])

const setButton = (element: unknown, index: number) => {
  itemButtons.value[index] = element instanceof HTMLButtonElement ? element : null
}

const setSubmenu = (instance: unknown) => {
  if (
    instance &&
    typeof instance === 'object' &&
    'focusFirst' in instance &&
    typeof instance.focusFirst === 'function'
  ) {
    submenu.value = instance as { focusFirst: () => void }
  } else {
    submenu.value = null
  }
}

const focusIndex = (index: number) => {
  if (index < 0) return
  activeIndex.value = index
  nextTick(() => itemButtons.value[index]?.focus())
}

const focusFirst = () => focusIndex(enabledIndexes()[0] ?? -1)

const focusLast = () => focusIndex(enabledIndexes().at(-1) ?? -1)

const move = (direction: 1 | -1) => {
  const indexes = enabledIndexes()
  if (!indexes.length) return
  const current = indexes.indexOf(activeIndex.value)
  const next = current < 0
    ? (direction > 0 ? 0 : indexes.length - 1)
    : (current + direction + indexes.length) % indexes.length
  focusIndex(indexes[next] ?? -1)
}

const openSubmenu = (index: number, focusChild = false) => {
  const item = props.items[index]
  if (!item?.children?.length || item.disabled) return
  activeIndex.value = index
  openSubmenuIndex.value = index
  if (focusChild) nextTick(() => submenu.value?.focusFirst())
}

const closeSubmenu = (restoreFocus = true) => {
  const index = openSubmenuIndex.value
  openSubmenuIndex.value = -1
  if (restoreFocus) nextTick(() => itemButtons.value[index]?.focus())
}

const activate = (item: AContextMenuItem, index: number) => {
  if (item.disabled || item.separator) return
  if (item.children?.length) {
    if (openSubmenuIndex.value === index) closeSubmenu(false)
    else openSubmenu(index, true)
    return
  }
  emit('select', item)
}

const onKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Home':
      event.preventDefault()
      focusFirst()
      break
    case 'End':
      event.preventDefault()
      focusLast()
      break
    case 'ArrowRight':
      event.preventDefault()
      openSubmenu(activeIndex.value, true)
      break
    case 'ArrowLeft':
      if (!props.nested) return
      event.preventDefault()
      emit('back')
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (activeIndex.value >= 0) {
        const item = props.items[activeIndex.value]
        if (item) activate(item, activeIndex.value)
      }
      break
    case 'Escape':
      event.preventDefault()
      emit('close', true)
      break
    case 'Tab':
      emit('close', false)
      break
  }
}

watch(
  () => props.items,
  () => {
    const indexes = enabledIndexes()
    if (!indexes.includes(activeIndex.value)) activeIndex.value = indexes[0] ?? -1
    if (!props.items[openSubmenuIndex.value]?.children?.length) openSubmenuIndex.value = -1
  },
  { deep: true, immediate: true }
)

defineExpose({ focusFirst })
</script>

<template>
  <ul
    class="a-context-menu-level"
    :class="{ 'a-context-menu-level--nested': nested }"
    role="menu"
    :aria-label="label"
    @keydown.stop="onKeydown"
  >
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="a-context-menu-level__entry"
      :class="{ 'a-context-menu-level__entry--submenu': item.children?.length }"
      :role="item.separator ? 'separator' : 'none'"
    >
      <span v-if="item.separator" class="a-context-menu-level__separator" aria-hidden="true" />
      <button
        v-else
        :ref="(element) => setButton(element, index)"
        type="button"
        role="menuitem"
        class="a-context-menu-level__item"
        :class="{
          'a-context-menu-level__item--active': index === activeIndex,
          'a-context-menu-level__item--destructive': item.destructive
        }"
        :tabindex="index === activeIndex ? 0 : -1"
        :disabled="item.disabled"
        :aria-disabled="item.disabled || undefined"
        :aria-haspopup="item.children?.length ? 'menu' : undefined"
        :aria-expanded="item.children?.length ? openSubmenuIndex === index : undefined"
        @focus="activeIndex = index"
        @mouseenter="item.children?.length ? openSubmenu(index) : (openSubmenuIndex = -1)"
        @click="activate(item, index)"
      >
        <q-icon v-if="item.icon" :name="item.icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
        <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
        <q-icon v-if="item.children?.length" name="chevron_right" aria-hidden="true" />
      </button>

      <AContextMenuLevel
        v-if="item.children?.length && openSubmenuIndex === index"
        :ref="setSubmenu"
        :items="item.children"
        :label="item.label || label"
        nested
        @select="$emit('select', $event)"
        @close="$emit('close', $event)"
        @back="closeSubmenu()"
      />
    </li>
  </ul>
</template>

<style scoped>
.a-context-menu-level {
  display: grid;
  min-width: var(--a-layout-popover);
  max-width: var(--a-layout-popover);
  max-height: calc(100dvh - var(--a-space-4));
  overflow-y: auto;
  margin: var(--a-space-0);
  padding: var(--a-space-1);
  border: var(--a-border-width) solid var(--a-border-strong);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
  box-shadow: var(--a-shadow-2);
  list-style: none;
}

.a-context-menu-level--nested {
  position: absolute;
  z-index: var(--a-z-dropdown);
  top: 0;
  left: 100%;
}

.a-context-menu-level__entry {
  position: relative;
}

.a-context-menu-level__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: var(--a-space-2);
  align-items: center;
  width: 100%;
  min-height: var(--a-target-min);
  padding: var(--a-space-2) var(--a-space-3);
  border: 0;
  border-radius: var(--a-radius-xs);
  background: transparent;
  color: var(--a-text-primary);
  text-align: start;
  cursor: pointer;
}

.a-context-menu-level__item--active,
.a-context-menu-level__item:hover {
  background: var(--a-bg-hover);
}

.a-context-menu-level__item--destructive {
  color: var(--a-negative);
}

.a-context-menu-level__item:disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}

.a-context-menu-level__item kbd {
  color: var(--a-text-secondary);
  font-family: var(--a-font-mono);
  font-size: var(--a-font-size-xs);
}

.a-context-menu-level__separator {
  display: block;
  height: var(--a-border-width);
  margin: var(--a-space-1) var(--a-space-2);
  background: var(--a-border);
}
</style>
