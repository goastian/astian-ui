<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import AEmptyState from '../../components/AEmptyState.vue'
import AErrorState from '../../components/AErrorState.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import type { AId, ALoadState } from '../../types/core'
import { useSelectionMarquee } from '../composables/useSelectionMarquee'
import AFileCard from './AFileCard.vue'
import type {
  ACloudDragPayload,
  ACloudDropEffect,
  ACloudDropState,
  ACloudDropTarget,
  ACloudItem,
  ACloudSelectionDetail,
  ACloudSelectionInteraction
} from '../types'

const selectedIds = defineModel<AId[]>('selectedIds', { default: () => [] })
const activeId = defineModel<AId | null>('activeId', { default: null })

const props = withDefaults(defineProps<{
  items: ACloudItem[]
  state?: ALoadState
  loadingCount?: number
  selectable?: boolean
  disabled?: boolean
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string
  selectionInteraction?: ACloudSelectionInteraction
  dnd?: boolean
  sourceContainerId?: AId | null
  dropTarget?: ACloudDropTarget | null
  dropState?: ACloudDropState
  dropEffect?: ACloudDropEffect
  draggingIds?: readonly AId[]
  showMoveAction?: boolean
}>(), {
  state: 'ready',
  loadingCount: 6,
  selectable: true,
  disabled: false,
  emptyTitle: 'No hay elementos',
  emptyDescription: 'Crea uno nuevo o cambia los filtros.',
  errorTitle: 'No se pudieron cargar los elementos',
  errorDescription: 'Reintenta la carga.',
  selectionInteraction: 'individual',
  dnd: false,
  sourceContainerId: null,
  dropTarget: null,
  dropState: 'idle',
  dropEffect: 'move',
  draggingIds: () => [],
  showMoveAction: true
})

const emit = defineEmits<{
  open: [item: ACloudItem]
  favorite: [item: ACloudItem, favorite: boolean]
  menu: [item: ACloudItem, event: MouseEvent]
  retry: []
  'selection-start': [detail: ACloudSelectionDetail]
  'selection-change': [detail: ACloudSelectionDetail]
  'selection-end': [detail: ACloudSelectionDetail]
  'drag-start': [payload: ACloudDragPayload, event: DragEvent]
  'drag-end': [payload: ACloudDragPayload | null, event: DragEvent]
  'drop-request': [payload: ACloudDragPayload, event: DragEvent]
  'drop-target-change': [target: ACloudDropTarget | null, event: DragEvent]
  'move-request': [item: ACloudItem, event: Event]
}>()

const root = ref<HTMLElement | null>(null)
const transientDropTarget = ref<ACloudDropTarget | null>(null)
const transientDraggingIds = ref<AId[]>([])
const selectionAnchor = ref<AId | null>(null)
const renderedItems = computed(() => props.items)
const effectiveDropTarget = computed(() => props.dropTarget ?? transientDropTarget.value)
const effectiveDraggingIds = computed(() =>
  props.draggingIds.length ? [...props.draggingIds] : transientDraggingIds.value
)
const domId = (id: AId) => `${typeof id}:${String(id)}`
const sameId = (left: AId | null, right: AId | null) =>
  left !== null && right !== null && domId(left) === domId(right)

const setSelected = (item: ACloudItem, selected: boolean, event?: MouseEvent) => {
  if (!props.selectable || props.disabled || item.disabled) return

  if (event?.shiftKey && selectionAnchor.value !== null) {
    const enabled = props.items.filter((candidate) => !candidate.disabled)
    const anchorIndex = enabled.findIndex((candidate) => sameId(candidate.id, selectionAnchor.value))
    const itemIndex = enabled.findIndex((candidate) => sameId(candidate.id, item.id))
    if (anchorIndex >= 0 && itemIndex >= 0) {
      const [start, end] = [anchorIndex, itemIndex].sort((a, b) => a - b)
      const range = enabled.slice(start, end + 1).map((candidate) => candidate.id)
      selectedIds.value = [...new Set([...selectedIds.value, ...range])]
      return
    }
  }

  const next = new Set(selectedIds.value)
  if (selected) next.add(item.id)
  else next.delete(item.id)
  selectedIds.value = [...next]
  selectionAnchor.value = item.id
}

const marquee = useSelectionMarquee({
  root,
  selectedIds,
  items: () => props.items,
  enabled: () => (
    props.selectionInteraction === 'marquee'
    && props.selectable
    && !props.disabled
    && props.state === 'ready'
  ),
  onStart: (detail) => emit('selection-start', detail),
  onChange: (detail) => emit('selection-change', detail),
  onEnd: (detail) => emit('selection-end', detail)
})
const marqueeActive = marquee.active
const marqueeStyle = marquee.rectangleStyle

function handleKeydown(event: KeyboardEvent) {
  if (
    !props.selectable
    || props.disabled
    || !(event.ctrlKey || event.metaKey)
    || event.key.toLocaleLowerCase() !== 'a'
  ) {
    return
  }
  event.preventDefault()
  selectedIds.value = props.items.filter((item) => !item.disabled).map((item) => item.id)
}

function itemDropState(item: ACloudItem): ACloudDropState {
  return sameId(effectiveDropTarget.value?.id ?? null, item.id)
    ? props.dropState === 'idle' ? 'active' : props.dropState
    : 'idle'
}

function handleDropTargetChange(target: ACloudDropTarget | null, event: DragEvent) {
  transientDropTarget.value = target
  emit('drop-target-change', target, event)
}

function handleDragStart(payload: ACloudDragPayload, event: DragEvent) {
  transientDraggingIds.value = payload.sourceIds
  emit('drag-start', payload, event)
}

function handleDragEnd(payload: ACloudDragPayload | null, event: DragEvent) {
  transientDraggingIds.value = []
  transientDropTarget.value = null
  emit('drag-end', payload, event)
}

function handleDropRequest(payload: ACloudDragPayload, event: DragEvent) {
  transientDropTarget.value = null
  emit('drop-request', payload, event)
}

const focusActive = async () => {
  if (activeId.value === null) return
  await nextTick()
  const item = [...(root.value?.querySelectorAll<HTMLElement>('[data-cloud-id]') ?? [])]
    .find((element) => element.dataset.cloudId === domId(activeId.value!))
  item?.querySelector<HTMLElement>('.a-file-card__open')?.focus()
}

onMounted(focusActive)
watch(() => props.state, (state) => {
  if (state === 'ready') void focusActive()
})
</script>

<template>
  <section
    ref="root"
    class="a-file-grid"
    :class="{ 'a-file-grid--marquee-active': marqueeActive }"
    :aria-busy="state === 'loading'"
    @keydown="handleKeydown"
    @pointerdown="marquee.onPointerDown"
    @pointermove="marquee.onPointerMove"
    @pointerup="marquee.onPointerUp"
    @pointercancel="marquee.onPointerCancel"
  >
    <div v-if="state === 'loading'" class="a-file-grid__items" role="status">
      <article v-for="index in loadingCount" :key="index" class="a-file-grid__skeleton">
        <ASkeleton height="var(--a-layout-stat-min)" />
        <ASkeleton width="72%" />
        <ASkeleton width="48%" />
      </article>
      <span class="a-visually-hidden">Cargando elementos</span>
    </div>
    <AErrorState
      v-else-if="state === 'error'"
      :title="errorTitle"
      :description="errorDescription"
      retry-label="Reintentar"
      :disabled="disabled"
      @retry="emit('retry')"
    />
    <AEmptyState
      v-else-if="state === 'empty' || !renderedItems.length"
      icon="folder_open"
      :title="emptyTitle"
      :description="emptyDescription"
      :disabled="disabled"
    >
      <template #actions><slot name="empty-actions" /></template>
    </AEmptyState>
    <div v-else class="a-file-grid__items">
      <AFileCard
        v-for="item in renderedItems"
        :key="domId(item.id)"
        :data-cloud-id="domId(item.id)"
        :data-selection-id="domId(item.id)"
        :data-selection-disabled="disabled || item.disabled || undefined"
        :item="item"
        :selected="selectedIds.includes(item.id)"
        :selectable="selectable"
        :disabled="disabled"
        :draggable="dnd"
        :drag-ids="selectedIds.includes(item.id) ? selectedIds : [item.id]"
        :source-container-id="sourceContainerId"
        :drop-target="effectiveDropTarget"
        :drop-state="itemDropState(item)"
        :drop-effect="dropEffect"
        :dragging="effectiveDraggingIds.some((id) => sameId(id, item.id))"
        :show-move-action="showMoveAction"
        @open="emit('open', item)"
        @select="(_item, selected, event) => setSelected(item, selected, event)"
        @favorite="(_item, favorite) => emit('favorite', item, favorite)"
        @menu="(_item, event) => emit('menu', item, event)"
        @focus="activeId = item.id"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
        @drop-request="handleDropRequest"
        @drop-target-change="handleDropTargetChange"
        @move-request="(_item, event) => emit('move-request', item, event)"
      >
        <template v-if="$slots['item-menu']" #menu><slot name="item-menu" :item="item" /></template>
      </AFileCard>
    </div>
    <div
      v-if="marqueeActive"
      class="a-file-grid__marquee"
      :style="marqueeStyle"
      aria-hidden="true"
    />
  </section>
</template>

<style scoped>
.a-file-grid { min-width: 0; }
.a-file-grid--marquee-active {
  cursor: crosshair;
  user-select: none;
}
.a-file-grid__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--a-layout-search-min), 1fr));
  gap: var(--a-space-3);
}
.a-file-grid__skeleton {
  display: grid;
  gap: var(--a-space-3);
  min-height: calc(var(--a-layout-stat-min) + var(--a-space-16));
  padding: var(--a-space-3);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-surface);
}
.a-file-grid__marquee {
  position: fixed;
  z-index: var(--a-z-overlay);
  border: var(--a-border-width) solid var(--a-primary);
  background: color-mix(in srgb, var(--a-primary) 14%, transparent);
  box-shadow: 0 0 0 var(--a-border-width) color-mix(in srgb, var(--a-bg-raised) 60%, transparent) inset;
  pointer-events: none;
}
@media (max-width: 22rem) {
  .a-file-grid__items { grid-template-columns: 1fr; }
}
</style>
