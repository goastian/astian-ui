<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import type { ABreadcrumbItem } from '../types/core'

type BreadcrumbEntry =
  | { type: 'item'; item: ABreadcrumbItem; index: number }
  | { type: 'collapsed'; items: ABreadcrumbItem[]; index: number }

const props = withDefaults(defineProps<{
  items: ABreadcrumbItem[]
  label?: string
  maxVisible?: number
  mobileMaxVisible?: number
  collapsedLabel?: string
}>(), {
  label: 'Ruta de navegación',
  maxVisible: 4,
  mobileMaxVisible: 2,
  collapsedLabel: 'Mostrar rutas intermedias'
})

const emit = defineEmits<{
  navigate: [item: ABreadcrumbItem, event: MouseEvent]
}>()

const isMobile = ref(false)
let mediaQuery: MediaQueryList | undefined

const updateMobile = (event?: MediaQueryListEvent) => {
  isMobile.value = event?.matches ?? mediaQuery?.matches ?? false
}

onMounted(() => {
  if (typeof window.matchMedia !== 'function') return
  mediaQuery = window.matchMedia('(max-width: 40rem)')
  updateMobile()
  mediaQuery.addEventListener('change', updateMobile)
})

onBeforeUnmount(() => mediaQuery?.removeEventListener('change', updateMobile))

const effectiveLimit = computed(() => Math.max(
  2,
  isMobile.value ? props.mobileMaxVisible : props.maxVisible
))

const entries = computed<BreadcrumbEntry[]>(() => {
  if (props.items.length <= effectiveLimit.value) {
    return props.items.map((item, index) => ({ type: 'item', item, index }))
  }

  const currentIndex = props.items.findIndex((item) => item.current)
  const visible = new Set<number>([0, props.items.length - 1])
  if (currentIndex >= 0) visible.add(currentIndex)

  for (let index = props.items.length - 2; index > 0 && visible.size < effectiveLimit.value; index -= 1) {
    visible.add(index)
  }

  const result: BreadcrumbEntry[] = []
  let hidden: ABreadcrumbItem[] = []
  let hiddenStart = 0

  const flushHidden = () => {
    if (hidden.length === 0) return
    result.push({ type: 'collapsed', items: hidden, index: hiddenStart })
    hidden = []
  }

  props.items.forEach((item, index) => {
    if (visible.has(index)) {
      flushHidden()
      result.push({ type: 'item', item, index })
      return
    }
    if (hidden.length === 0) hiddenStart = index
    hidden.push(item)
  })
  flushHidden()

  return result
})

const componentFor = (item: ABreadcrumbItem) => {
  if (item.current || item.disabled) return 'span'
  if (item.to !== undefined) return 'router-link'
  if (item.href !== undefined) return 'a'
  return 'button'
}

const bindingsFor = (item: ABreadcrumbItem) => {
  if (item.to !== undefined) return { to: item.to }
  if (item.href !== undefined) {
    return {
      href: item.href,
      target: item.target,
      rel: item.target === '_blank' ? 'noopener noreferrer' : undefined
    }
  }
  if (!item.current && !item.disabled) return { type: 'button' }
  return {}
}

const handleNavigate = (item: ABreadcrumbItem, event: MouseEvent) => {
  if (item.current || item.disabled) {
    event.preventDefault()
    return
  }
  emit('navigate', item, event)
}
</script>

<template>
  <nav class="a-breadcrumbs" :aria-label="label">
    <ol class="a-breadcrumbs__list">
      <li
        v-for="(entry, entryIndex) in entries"
        :key="entry.type === 'item' ? entry.item.id : `collapsed-${entry.index}`"
        class="a-breadcrumbs__entry"
      >
        <q-icon
          v-if="entryIndex > 0"
          name="chevron_right"
          class="a-breadcrumbs__separator"
          aria-hidden="true"
        />

        <component
          :is="componentFor(entry.item)"
          v-if="entry.type === 'item'"
          v-bind="bindingsFor(entry.item)"
          class="a-breadcrumbs__link"
          :class="{
            'a-breadcrumbs__link--current': entry.item.current,
            'a-breadcrumbs__link--disabled': entry.item.disabled
          }"
          :aria-current="entry.item.current ? 'page' : undefined"
          :aria-disabled="entry.item.disabled ? 'true' : undefined"
          @click="handleNavigate(entry.item, $event)"
        >
          {{ entry.item.label }}
        </component>

        <details v-else class="a-breadcrumbs__collapsed">
          <summary :aria-label="`${collapsedLabel}: ${entry.items.map((item) => item.label).join(', ')}`">
            <span aria-hidden="true">…</span>
          </summary>
          <ul class="a-breadcrumbs__collapsed-list">
            <li v-for="item in entry.items" :key="item.id">
              <component
                :is="componentFor(item)"
                v-bind="bindingsFor(item)"
                class="a-breadcrumbs__collapsed-link"
                :class="{ 'a-breadcrumbs__collapsed-link--disabled': item.disabled }"
                :aria-current="item.current ? 'page' : undefined"
                :aria-disabled="item.disabled ? 'true' : undefined"
                @click="handleNavigate(item, $event)"
              >
                {{ item.label }}
              </component>
            </li>
          </ul>
        </details>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.a-breadcrumbs {
  min-width: 0;
  color: var(--a-text-secondary);
}

.a-breadcrumbs__list,
.a-breadcrumbs__collapsed-list {
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}

.a-breadcrumbs__list {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--a-space-1);
}

.a-breadcrumbs__entry {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--a-space-1);
}

.a-breadcrumbs__separator {
  flex: none;
  color: var(--a-text-tertiary);
  font-size: var(--a-icon-sm);
}

.a-breadcrumbs__link,
.a-breadcrumbs__collapsed-link {
  display: inline-flex;
  min-width: var(--a-target-min);
  min-height: var(--a-target-min);
  align-items: center;
  padding: var(--a-space-2);
  border: var(--a-border-width) solid transparent;
  border-radius: var(--a-radius-xs);
  background: transparent;
  color: var(--a-text-secondary);
  font: inherit;
  font-size: var(--a-font-size-sm);
  text-decoration: none;
  cursor: pointer;
}

.a-breadcrumbs__link {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a-breadcrumbs__link:hover,
.a-breadcrumbs__collapsed-link:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-breadcrumbs__link:focus-visible,
.a-breadcrumbs__collapsed-link:focus-visible,
.a-breadcrumbs__collapsed summary:focus-visible {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
  outline: none;
}

.a-breadcrumbs__link--current {
  color: var(--a-text-primary);
  font-weight: var(--a-font-weight-semibold);
  cursor: default;
}

.a-breadcrumbs__link--current:hover {
  background: transparent;
}

.a-breadcrumbs__link--disabled,
.a-breadcrumbs__collapsed-link--disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}

.a-breadcrumbs__collapsed {
  position: relative;
}

.a-breadcrumbs__collapsed summary {
  display: inline-grid;
  width: var(--a-target-min);
  height: var(--a-target-min);
  place-items: center;
  border: var(--a-border-width) solid transparent;
  border-radius: var(--a-radius-xs);
  color: var(--a-text-secondary);
  cursor: pointer;
  list-style: none;
}

.a-breadcrumbs__collapsed summary::-webkit-details-marker {
  display: none;
}

.a-breadcrumbs__collapsed summary:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-breadcrumbs__collapsed-list {
  position: absolute;
  z-index: var(--a-z-dropdown);
  top: 100%;
  left: var(--a-space-0);
  display: grid;
  width: var(--a-layout-popover);
  gap: var(--a-space-1);
  padding: var(--a-space-2);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  box-shadow: var(--a-shadow-2);
}

.a-breadcrumbs__collapsed-link {
  width: 100%;
}

@media (max-width: 40rem) {
  .a-breadcrumbs__list {
    overflow: visible;
  }

  .a-breadcrumbs__link {
    max-width: calc(var(--a-layout-popover) / 2);
  }
}
</style>
