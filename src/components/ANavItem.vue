<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import type { ANavItemSpec } from '../types/core'

const props = withDefaults(defineProps<ANavItemSpec & {
  collapsed?: boolean
  tabIndex?: number
}>(), {
  collapsed: false,
  tabIndex: 0
})

const emit = defineEmits<{
  activate: [item: ANavItemSpec, event: MouseEvent]
  focus: [item: ANavItemSpec, event: FocusEvent]
}>()

const root = ref<HTMLElement | null>(null)

const setRoot = (element: Element | ComponentPublicInstance | null) => {
  const resolved = element instanceof Element ? element : element?.$el
  root.value = resolved instanceof HTMLElement ? resolved : null
}

const item = computed<ANavItemSpec>(() => ({
  id: props.id,
  label: props.label,
  description: props.description,
  icon: props.icon,
  badge: props.badge,
  active: props.active,
  disabled: props.disabled,
  ...(props.to !== undefined ? { to: props.to } : {}),
  ...(props.href !== undefined ? { href: props.href, target: props.target } : {})
} as ANavItemSpec))

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('activate', item.value, event)
}

const handleFocus = (event: FocusEvent) => emit('focus', item.value, event)

defineExpose({
  focus: () => root.value?.focus({ preventScroll: true })
})
</script>

<template>
  <router-link
    v-if="to !== undefined && !disabled"
    :ref="setRoot"
    :to="to"
    class="a-nav-item"
    :class="{ 'a-nav-item--active': active, 'a-nav-item--collapsed': collapsed }"
    :aria-current="active ? 'page' : undefined"
    :tabindex="tabIndex"
    :title="collapsed ? label : undefined"
    :data-nav-id="String(id)"
    data-a-nav-item
    @click="handleClick"
    @focus="handleFocus"
  >
    <span v-if="icon" class="a-nav-item__icon" aria-hidden="true"><q-icon :name="icon" /></span>
    <span v-else-if="collapsed" class="a-nav-item__monogram" aria-hidden="true">{{ label.slice(0, 1) }}</span>
    <span class="a-nav-item__copy">
      <span class="a-nav-item__label">{{ label }}</span>
      <span v-if="description" class="a-nav-item__description">{{ description }}</span>
    </span>
    <span v-if="badge !== undefined" class="a-nav-item__badge">{{ badge }}</span>
  </router-link>

  <a
    v-else-if="href !== undefined && !disabled"
    :ref="setRoot"
    :href="href"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    class="a-nav-item"
    :class="{ 'a-nav-item--active': active, 'a-nav-item--collapsed': collapsed }"
    :aria-current="active ? 'page' : undefined"
    :tabindex="tabIndex"
    :title="collapsed ? label : undefined"
    :data-nav-id="String(id)"
    data-a-nav-item
    @click="handleClick"
    @focus="handleFocus"
  >
    <span v-if="icon" class="a-nav-item__icon" aria-hidden="true"><q-icon :name="icon" /></span>
    <span v-else-if="collapsed" class="a-nav-item__monogram" aria-hidden="true">{{ label.slice(0, 1) }}</span>
    <span class="a-nav-item__copy">
      <span class="a-nav-item__label">{{ label }}</span>
      <span v-if="description" class="a-nav-item__description">{{ description }}</span>
    </span>
    <span v-if="badge !== undefined" class="a-nav-item__badge">{{ badge }}</span>
  </a>

  <button
    v-else
    :ref="setRoot"
    type="button"
    class="a-nav-item"
    :class="{
      'a-nav-item--active': active,
      'a-nav-item--collapsed': collapsed,
      'a-nav-item--disabled': disabled
    }"
    :disabled="disabled"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-current="active ? 'page' : undefined"
    :tabindex="disabled ? -1 : tabIndex"
    :title="collapsed ? label : undefined"
    :data-nav-id="String(id)"
    data-a-nav-item
    @click="handleClick"
    @focus="handleFocus"
  >
    <span v-if="icon" class="a-nav-item__icon" aria-hidden="true"><q-icon :name="icon" /></span>
    <span v-else-if="collapsed" class="a-nav-item__monogram" aria-hidden="true">{{ label.slice(0, 1) }}</span>
    <span class="a-nav-item__copy">
      <span class="a-nav-item__label">{{ label }}</span>
      <span v-if="description" class="a-nav-item__description">{{ description }}</span>
    </span>
    <span v-if="badge !== undefined" class="a-nav-item__badge">{{ badge }}</span>
  </button>
</template>

<style scoped>
.a-nav-item {
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: var(--a-target-min);
  grid-template-columns: var(--a-target-min) minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--a-space-2);
  padding: var(--a-space-1) var(--a-space-2);
  border: var(--a-border-width) solid transparent;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-secondary);
  font: inherit;
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  transition:
    background var(--a-motion-fast),
    border-color var(--a-motion-fast),
    color var(--a-motion-fast);
}

.a-nav-item:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-nav-item:focus-visible {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
  outline: none;
}

.a-nav-item--active {
  background: var(--a-bg-selected);
  color: var(--a-primary);
  font-weight: var(--a-font-weight-semibold);
}

.a-nav-item--disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}

.a-nav-item__icon,
.a-nav-item__monogram {
  display: inline-grid;
  width: var(--a-target-min);
  height: var(--a-target-min);
  place-items: center;
  border-radius: var(--a-radius-xs);
  color: currentColor;
}

.a-nav-item__icon :deep(.q-icon) {
  font-size: var(--a-icon-md);
}

.a-nav-item__monogram {
  background: var(--a-bg-muted);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-bold);
}

.a-nav-item__copy {
  display: grid;
  min-width: 0;
  gap: var(--a-space-1);
}

.a-nav-item__label,
.a-nav-item__description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a-nav-item__label {
  color: currentColor;
  font-size: var(--a-font-size-sm);
}

.a-nav-item__description {
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
  font-weight: var(--a-font-weight-medium);
}

.a-nav-item__badge {
  min-width: var(--a-space-5);
  padding: var(--a-space-1) var(--a-space-2);
  border-radius: var(--a-radius-round);
  background: var(--a-bg-muted);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.a-nav-item--collapsed {
  grid-template-columns: var(--a-target-min);
  justify-content: center;
  padding-inline: var(--a-space-1);
}

.a-nav-item--collapsed .a-nav-item__copy {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.a-nav-item--collapsed .a-nav-item__badge {
  position: absolute;
  align-self: start;
  justify-self: end;
  min-width: var(--a-space-4);
  padding: var(--a-space-0) var(--a-space-1);
}
</style>
