<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'

import type { ANavGroup, ANavItemSpec } from '../types/core'
import ADrawer from './ADrawer.vue'
import ANavItem from './ANavItem.vue'

const collapsed = defineModel<boolean>('collapsed', { default: false })
const mobileOpen = defineModel<boolean>('mobileOpen', { default: false })

const props = withDefaults(defineProps<{
  groups: ANavGroup[]
  label?: string
  collapsible?: boolean
  mobile?: boolean
  closeOnSelect?: boolean
  collapseLabel?: string
  expandLabel?: string
  closeLabel?: string
}>(), {
  label: 'Navegación principal',
  collapsible: true,
  mobile: false,
  closeOnSelect: true,
  collapseLabel: 'Contraer navegación',
  expandLabel: 'Expandir navegación',
  closeLabel: 'Cerrar navegación'
})

const emit = defineEmits<{
  select: [item: ANavItemSpec, event: MouseEvent]
}>()

const navigation = ref<HTMLElement | null>(null)
const groupExpanded = ref<Record<string, boolean>>({})
const rovingKey = ref<string>()
const instanceId = useId()

const groupKey = (group: ANavGroup) => `${typeof group.id}:${String(group.id)}`
const itemKey = (item: ANavItemSpec) => `${typeof item.id}:${String(item.id)}`
const groupDomId = (index: number) => `a-nav-group-${instanceId}-${index}`

watch(() => props.groups, (groups) => {
  for (const group of groups) {
    const key = groupKey(group)
    if (!(key in groupExpanded.value)) groupExpanded.value[key] = !group.collapsed
  }
}, { immediate: true, deep: true })

const isGroupExpanded = (group: ANavGroup) => {
  if (!group.collapsible) return true
  return groupExpanded.value[groupKey(group)] !== false
}

const groupShowsItems = (group: ANavGroup) => (
  (collapsed.value && !props.mobile) || isGroupExpanded(group)
)

const visibleItems = computed(() => props.groups.flatMap((group) => (
  groupShowsItems(group) ? group.items : []
)))

const enabledItems = computed(() => visibleItems.value.filter((item) => !item.disabled))

watch(enabledItems, (items) => {
  if (!items.some((item) => itemKey(item) === rovingKey.value)) {
    const initialItem = items.find((item) => item.active) ?? items[0]
    rovingKey.value = initialItem ? itemKey(initialItem) : undefined
  }
}, { immediate: true })

const toggleGroup = (group: ANavGroup) => {
  const key = groupKey(group)
  groupExpanded.value[key] = !isGroupExpanded(group)
}

const handleItemSelected = (item: ANavItemSpec, event: MouseEvent) => {
  rovingKey.value = itemKey(item)
  emit('select', item, event)
  if (props.mobile && props.closeOnSelect) mobileOpen.value = false
}

const handleItemFocus = (item: ANavItemSpec) => {
  rovingKey.value = itemKey(item)
}

const handleRovingKeydown = (event: KeyboardEvent) => {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

  const items = Array.from(
    navigation.value?.querySelectorAll<HTMLElement>('[data-a-nav-item]:not([disabled])') ?? []
  )
  const currentIndex = items.findIndex((item) => item === document.activeElement)
  if (currentIndex < 0 || items.length === 0) return

  event.preventDefault()
  let nextIndex = currentIndex
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = items.length - 1
  if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length
  if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length

  const nextItem = items[nextIndex]
  rovingKey.value = nextItem.dataset.navId
  nextItem.focus({ preventScroll: true })
  nextItem.scrollIntoView?.({ block: 'nearest' })
}

const updateMobileOpen = (value: boolean) => {
  if (props.mobile) mobileOpen.value = value
}
</script>

<template>
  <div
    class="a-navigation-rail-host"
    :class="{ 'a-navigation-rail-host--collapsed': collapsed && !mobile }"
  >
    <ADrawer
      :model-value="mobile ? mobileOpen : true"
      position="left"
      :modal="mobile"
      :label="label"
      :show-close="mobile"
      :close-label="closeLabel"
      :close-on-escape="mobile"
      :close-on-outside="mobile"
      initial-focus="[data-a-nav-item][tabindex='0']"
      @update:model-value="updateMobileOpen"
    >
      <nav
        ref="navigation"
        class="a-navigation-rail"
        :class="{ 'a-navigation-rail--collapsed': collapsed && !mobile }"
        :aria-label="label"
        @keydown="handleRovingKeydown"
      >
        <slot name="header" :collapsed="collapsed && !mobile" />

        <div class="a-navigation-rail__groups">
          <section
            v-for="(group, groupIndex) in groups"
            :key="group.id"
            class="a-navigation-rail__group"
          >
            <button
              v-if="group.label && group.collapsible && !(collapsed && !mobile)"
              type="button"
              class="a-navigation-rail__group-toggle"
              :aria-expanded="isGroupExpanded(group)"
              :aria-controls="groupDomId(groupIndex)"
              :title="collapsed && !mobile ? group.label : undefined"
              @click="toggleGroup(group)"
            >
              <span class="a-navigation-rail__group-label">{{ group.label }}</span>
              <q-icon
                name="expand_more"
                class="a-navigation-rail__group-chevron"
                :class="{ 'a-navigation-rail__group-chevron--collapsed': !isGroupExpanded(group) }"
                aria-hidden="true"
              />
            </button>
            <h2
              v-else-if="group.label && !(collapsed && !mobile)"
              class="a-navigation-rail__group-heading"
              :title="collapsed && !mobile ? group.label : undefined"
            >
              {{ group.label }}
            </h2>

            <ul
              v-show="groupShowsItems(group)"
              :id="groupDomId(groupIndex)"
              class="a-navigation-rail__list"
            >
              <li v-for="item in group.items" :key="item.id">
                <ANavItem
                  v-bind="item"
                  :collapsed="collapsed && !mobile"
                  :tab-index="itemKey(item) === rovingKey ? 0 : -1"
                  @activate="handleItemSelected"
                  @focus="handleItemFocus"
                />
              </li>
            </ul>
          </section>
        </div>

        <slot name="footer" :collapsed="collapsed && !mobile" />

        <button
          v-if="collapsible && !mobile"
          type="button"
          class="a-navigation-rail__collapse"
          :aria-label="collapsed ? expandLabel : collapseLabel"
          :aria-pressed="collapsed"
          @click="collapsed = !collapsed"
        >
          <q-icon :name="collapsed ? 'keyboard_double_arrow_right' : 'keyboard_double_arrow_left'" aria-hidden="true" />
          <span>{{ collapsed ? expandLabel : collapseLabel }}</span>
        </button>
      </nav>
    </ADrawer>
  </div>
</template>

<style scoped>
.a-navigation-rail-host {
  min-width: 0;
  height: 100%;
}

.a-navigation-rail-host :deep(.a-drawer--non-modal),
.a-navigation-rail-host :deep(.a-drawer--non-modal .a-drawer__panel) {
  width: var(--a-layout-nav);
  height: 100%;
}

.a-navigation-rail-host--collapsed :deep(.a-drawer--non-modal),
.a-navigation-rail-host--collapsed :deep(.a-drawer--non-modal .a-drawer__panel) {
  width: var(--a-layout-nav-collapsed);
}

.a-navigation-rail-host :deep(.a-drawer--non-modal .a-drawer__panel) {
  border-block: 0;
  border-left: 0;
  border-radius: var(--a-space-0);
}

.a-navigation-rail-host :deep(.a-drawer__content) {
  padding: var(--a-space-0);
}

.a-navigation-rail {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
  gap: var(--a-space-4);
  padding: var(--a-space-3);
  background: var(--a-bg-surface);
  color: var(--a-text-primary);
}

.a-navigation-rail__groups,
.a-navigation-rail__group {
  display: grid;
  gap: var(--a-space-2);
}

.a-navigation-rail__group + .a-navigation-rail__group {
  padding-top: var(--a-space-3);
  border-top: var(--a-border-width) solid var(--a-border);
}

.a-navigation-rail__group-toggle,
.a-navigation-rail__group-heading {
  min-width: 0;
  margin: var(--a-space-0);
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
  font-weight: var(--a-font-weight-bold);
}

.a-navigation-rail__group-toggle {
  display: flex;
  min-height: var(--a-target-min);
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-2);
  padding: var(--a-space-2);
  border: var(--a-border-width) solid transparent;
  border-radius: var(--a-radius-sm);
  background: transparent;
  text-align: start;
  cursor: pointer;
}

.a-navigation-rail__group-toggle:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-navigation-rail__group-toggle:focus-visible,
.a-navigation-rail__collapse:focus-visible {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
  outline: none;
}

.a-navigation-rail__group-heading {
  padding: var(--a-space-2);
  line-height: var(--a-target-min);
}

.a-navigation-rail__group-chevron {
  flex: none;
  transition: transform var(--a-motion-fast);
}

.a-navigation-rail__group-chevron--collapsed {
  transform: rotate(-90deg);
}

.a-navigation-rail__list {
  display: grid;
  gap: var(--a-space-1);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}

.a-navigation-rail__collapse {
  display: flex;
  width: 100%;
  min-height: var(--a-target-min);
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  margin-top: auto;
  padding: var(--a-space-2);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  color: var(--a-text-secondary);
  font: inherit;
  cursor: pointer;
}

.a-navigation-rail__collapse:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-navigation-rail--collapsed .a-navigation-rail__group-label,
.a-navigation-rail--collapsed .a-navigation-rail__group-heading,
.a-navigation-rail--collapsed .a-navigation-rail__collapse span {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.a-navigation-rail--collapsed .a-navigation-rail__group-toggle {
  justify-content: center;
}

.a-navigation-rail--collapsed .a-navigation-rail__group-chevron {
  display: none;
}
</style>
