<script setup lang="ts">
import { computed, ref } from 'vue'

import AFacepile from '../../components/AFacepile.vue'
import AIcon from '../../components/AIcon.vue'
import AIconButton from '../../components/AIconButton.vue'
import type { AId } from '../../types/core'
import { cloudDropPosition, useCloudItemDnd } from '../composables/useCloudItemDnd'
import type {
  ACloudDragPayload,
  ACloudDropEffect,
  ACloudDropState,
  ACloudDropTarget,
  ACloudItem,
  ACloudVisibility
} from '../types'

const props = withDefaults(defineProps<{
  item: ACloudItem
  selected?: boolean
  disabled?: boolean
  selectable?: boolean
  showMenu?: boolean
  draggable?: boolean
  dragIds?: readonly AId[]
  sourceContainerId?: AId | null
  dropTarget?: ACloudDropTarget | null
  dropState?: ACloudDropState
  dropEffect?: ACloudDropEffect
  dragging?: boolean
  showMoveAction?: boolean
}>(), {
  disabled: false,
  selectable: true,
  showMenu: true,
  draggable: false,
  dragIds: () => [],
  sourceContainerId: null,
  dropTarget: null,
  dropState: 'idle',
  dropEffect: 'move',
  dragging: false,
  showMoveAction: true
})

const emit = defineEmits<{
  open: [item: ACloudItem]
  select: [item: ACloudItem, selected: boolean, event: MouseEvent]
  menu: [item: ACloudItem, event: MouseEvent]
  focus: [item: ACloudItem]
  'drag-start': [payload: ACloudDragPayload, event: DragEvent]
  'drag-end': [payload: ACloudDragPayload | null, event: DragEvent]
  'drop-request': [payload: ACloudDragPayload, event: DragEvent]
  'drop-target-change': [target: ACloudDropTarget | null, event: DragEvent]
  'move-request': [item: ACloudItem, event: Event]
}>()

const hoverTarget = ref<ACloudDropTarget | null>(null)
const isSelected = computed(() => props.selected ?? props.item.selected ?? false)
const itemDisabled = computed(() => props.disabled || props.item.disabled)
const dnd = useCloudItemDnd({
  sourceIds: () => props.dragIds,
  sourceContainerId: () => props.sourceContainerId,
  effect: () => props.dropEffect
})
const visualDropTarget = computed(() => props.dropTarget ?? hoverTarget.value)
const dropPosition = computed(() =>
  visualDropTarget.value?.id === props.item.id ? visualDropTarget.value.position : null
)
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

const targetFrom = (event: DragEvent) => {
  const element = event.currentTarget as HTMLElement
  const position = cloudDropPosition(event, element, props.item.kind === 'folder')
  return {
    id: props.item.id,
    containerId: position === 'inside' ? props.item.id : props.sourceContainerId,
    position,
    kind: 'item'
  } satisfies ACloudDropTarget
}

function handleDragStart(event: DragEvent) {
  if (!props.draggable || itemDisabled.value) {
    event.preventDefault()
    return
  }
  emit('drag-start', dnd.beginDrag(event, props.item.id), event)
}

function handleDragEnd(event: DragEvent) {
  hoverTarget.value = null
  emit('drag-end', dnd.endDrag(event), event)
}

function handleDragOver(event: DragEvent) {
  if (itemDisabled.value) return
  const target = targetFrom(event)
  if (!dnd.allowDrop(event, target, props.dropState)) return
  if (hoverTarget.value?.position !== target.position || hoverTarget.value.id !== target.id) {
    hoverTarget.value = target
    emit('drop-target-change', target, event)
  }
}

function handleDragLeave(event: DragEvent) {
  const current = event.currentTarget as HTMLElement
  if (event.relatedTarget instanceof Node && current.contains(event.relatedTarget)) return
  hoverTarget.value = null
  emit('drop-target-change', null, event)
}

function handleDrop(event: DragEvent) {
  if (itemDisabled.value) return
  const target = targetFrom(event)
  const payload = dnd.allowDrop(event, target, props.dropState)
  hoverTarget.value = null
  emit('drop-target-change', null, event)
  if (payload) emit('drop-request', payload, event)
}
</script>

<template>
  <article
    class="a-file-item"
    :class="{
      'a-file-item--selected': isSelected,
      'a-file-item--disabled': itemDisabled,
      'a-file-item--dragging': dragging,
      'a-file-item--drop-pending': dropState === 'pending' && dropPosition,
      'a-file-item--drop-invalid': dropState === 'invalid' && dropPosition
    }"
    :data-drop-position="dropPosition || undefined"
    :aria-invalid="dropState === 'invalid' && Boolean(dropPosition) || undefined"
    :draggable="draggable && !itemDisabled"
    @contextmenu="handleMenu"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <label v-if="selectable" class="a-file-item__select">
      <input
        type="checkbox"
        :checked="isSelected"
        :disabled="itemDisabled"
        :aria-label="`Seleccionar ${item.name}`"
        @click="emit('select', item, ($event.target as HTMLInputElement).checked, $event)"
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
    <AIconButton
      v-if="draggable && showMoveAction"
      icon="drive_file_move"
      :label="`Mover ${item.name}…`"
      size="small"
      :disabled="itemDisabled"
      @click="emit('move-request', item, $event)"
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
  position: relative;
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
.a-file-item[data-drop-position='before']::before,
.a-file-item[data-drop-position='after']::after {
  position: absolute;
  z-index: var(--a-z-sticky);
  inset-inline: var(--a-space-2);
  height: var(--a-border-width-strong);
  border-radius: var(--a-radius-round);
  background: var(--a-primary);
  content: '';
  pointer-events: none;
}
.a-file-item[data-drop-position='before']::before { inset-block-start: calc(var(--a-space-1) * -1); }
.a-file-item[data-drop-position='after']::after { inset-block-end: calc(var(--a-space-1) * -1); }
.a-file-item[data-drop-position='inside'] {
  border-color: var(--a-primary);
  box-shadow: var(--a-shadow-focus);
}
.a-file-item--dragging { opacity: .58; }
.a-file-item--drop-pending { cursor: progress; }
.a-file-item--drop-invalid {
  border-color: var(--a-negative);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-negative) 22%, transparent);
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
  .a-file-item { grid-template-columns: auto auto minmax(0, 1fr) auto auto; }
  .a-file-item__visibility,
  .a-file-item :deep(.a-facepile) { display: none; }
}
</style>
