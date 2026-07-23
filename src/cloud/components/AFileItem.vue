<script setup lang="ts">
import { computed } from 'vue'

import AFacepile from '../../components/AFacepile.vue'
import AIcon from '../../components/AIcon.vue'
import AIconButton from '../../components/AIconButton.vue'
import type { ACloudItem, ACloudVisibility } from '../types'

const props = withDefaults(defineProps<{
  item: ACloudItem
  selected?: boolean
  disabled?: boolean
  selectable?: boolean
  showMenu?: boolean
}>(), {
  disabled: false,
  selectable: true,
  showMenu: true
})

const emit = defineEmits<{
  open: [item: ACloudItem]
  select: [item: ACloudItem, selected: boolean]
  menu: [item: ACloudItem, event: MouseEvent]
  focus: [item: ACloudItem]
}>()

const isSelected = computed(() => props.selected ?? props.item.selected ?? false)
const itemDisabled = computed(() => props.disabled || props.item.disabled)
const visibilityCopy: Record<ACloudVisibility, string> = {
  private: 'Privado',
  shared: 'Compartido',
  link: 'Con enlace'
}
const resolvedIcon = computed(() => props.item.icon || (props.item.kind === 'folder' ? 'folder' : 'description'))

const handleMenu = (event: Event) => {
  event.preventDefault()
  if (!itemDisabled.value) emit('menu', props.item, event as MouseEvent)
}
</script>

<template>
  <article
    class="a-file-item"
    :class="{ 'a-file-item--selected': isSelected, 'a-file-item--disabled': itemDisabled }"
    @contextmenu="handleMenu"
  >
    <label v-if="selectable" class="a-file-item__select">
      <input
        type="checkbox"
        :checked="isSelected"
        :disabled="itemDisabled"
        :aria-label="`Seleccionar ${item.name}`"
        @change="emit('select', item, ($event.target as HTMLInputElement).checked)"
      >
      <span aria-hidden="true"><AIcon name="check" /></span>
    </label>
    <span class="a-file-item__icon" aria-hidden="true"><AIcon :name="resolvedIcon" /></span>
    <button
      type="button"
      class="a-file-item__open"
      :disabled="itemDisabled"
      @click="emit('open', item)"
      @focus="emit('focus', item)"
    >
      <strong>{{ item.name }}</strong>
      <span>{{ item.activityLabel || (item.kind === 'folder' ? `${item.itemCount ?? 0} elementos` : item.sizeLabel) }}</span>
    </button>
    <span v-if="item.visibility" class="a-file-item__visibility">
      <AIcon :name="item.visibility === 'private' ? 'lock' : item.visibility === 'link' ? 'link' : 'group'" size="small" />
      {{ visibilityCopy[item.visibility] }}
    </span>
    <AFacepile
      v-if="item.collaborators?.length"
      :people="item.collaborators"
      :max-displayed="3"
      size="medium"
    />
    <slot name="menu" :item="item">
      <AIconButton
        v-if="showMenu"
        icon="more_horiz"
        :label="`Acciones para ${item.name}`"
        size="small"
        :disabled="itemDisabled"
        @click="handleMenu"
      />
    </slot>
  </article>
</template>

<style scoped>
.a-file-item {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto auto auto;
  gap: var(--a-space-3);
  align-items: center;
  min-height: var(--a-control-lg);
  padding: var(--a-space-2);
  border: var(--a-border-width) solid transparent;
  border-radius: var(--a-radius-sm);
  color: var(--a-text-primary);
}
.a-file-item:hover { background: var(--a-bg-hover); }
.a-file-item--selected {
  border-color: var(--a-border-strong);
  background: var(--a-bg-selected);
}
.a-file-item--disabled { opacity: var(--a-opacity-disabled); }
.a-file-item__select {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  cursor: pointer;
}
.a-file-item__select input {
  position: absolute;
  inset: var(--a-space-0);
  width: 100%;
  height: 100%;
  margin: var(--a-space-0);
  opacity: 0;
  cursor: inherit;
}
.a-file-item__select > span {
  display: grid;
  place-items: center;
  width: var(--a-icon-lg);
  height: var(--a-icon-lg);
  border: var(--a-border-width-strong) solid var(--a-border-strong);
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-raised);
  color: transparent;
}
.a-file-item__select input:checked + span {
  border-color: var(--a-primary);
  background: var(--a-primary);
  color: var(--a-text-inverse);
}
.a-file-item__select:has(input:focus-visible) {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
  border-radius: var(--a-radius-xs);
  box-shadow: var(--a-shadow-focus);
}
.a-file-item__icon {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-muted);
  color: var(--a-primary);
}
.a-file-item__open {
  display: grid;
  gap: var(--a-space-1);
  min-width: 0;
  min-height: var(--a-target-min);
  padding: var(--a-space-1);
  border: 0;
  background: transparent;
  color: inherit;
  text-align: start;
  cursor: pointer;
}
.a-file-item__open strong,
.a-file-item__open span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.a-file-item__open strong { font-size: var(--a-font-size-sm); }
.a-file-item__open span,
.a-file-item__visibility {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}
.a-file-item__visibility {
  display: inline-flex;
  gap: var(--a-space-1);
  align-items: center;
}
@media (max-width: 42rem) {
  .a-file-item { grid-template-columns: auto auto minmax(0, 1fr) auto; }
  .a-file-item__visibility,
  .a-file-item :deep(.a-facepile) { display: none; }
}
</style>
