<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

import type { AId, ALoadState } from '../../types/core'
import AEmptyState from '../../components/AEmptyState.vue'
import AErrorState from '../../components/AErrorState.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import { useSelectionMarquee } from '../composables/useSelectionMarquee'
import APhotoTile from './APhotoTile.vue'
import type {
  ACloudMedia,
  ACloudSelectionDetail,
  ACloudSelectionInteraction
} from '../types'

const selectedIds = defineModel<AId[]>('selectedIds', { default: () => [] })
const activeId = defineModel<AId | null>('activeId', { default: null })

const props = withDefaults(defineProps<{
  media: ACloudMedia[]
  state?: ALoadState
  loadingCount?: number
  selectable?: boolean
  disabled?: boolean
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string
  selectionInteraction?: ACloudSelectionInteraction
}>(), {
  state: 'ready',
  loadingCount: 8,
  selectable: true,
  disabled: false,
  emptyTitle: 'No hay contenido multimedia',
  emptyDescription: 'Las imágenes y videos aparecerán aquí.',
  errorTitle: 'No se pudo cargar la galería',
  errorDescription: 'Reintenta la carga.',
  selectionInteraction: 'individual'
})

const emit = defineEmits<{
  open: [media: ACloudMedia]
  menu: [media: ACloudMedia, event: MouseEvent]
  retry: []
  'selection-start': [detail: ACloudSelectionDetail]
  'selection-change': [detail: ACloudSelectionDetail]
  'selection-end': [detail: ACloudSelectionDetail]
}>()

const root = ref<HTMLElement | null>(null)
const selectionAnchor = ref<AId | null>(null)
const domId = (id: AId) => `${typeof id}:${String(id)}`
const sameId = (left: AId | null, right: AId | null) =>
  left !== null && right !== null && domId(left) === domId(right)

const setSelected = (item: ACloudMedia, selected: boolean, event?: MouseEvent) => {
  if (!props.selectable || props.disabled || item.disabled) return

  if (event?.shiftKey && selectionAnchor.value !== null) {
    const enabled = props.media.filter((candidate) => !candidate.disabled)
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
  items: () => props.media,
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
  selectedIds.value = props.media.filter((item) => !item.disabled).map((item) => item.id)
}

const focusActive = async () => {
  if (activeId.value === null) return
  await nextTick()
  const item = [...(root.value?.querySelectorAll<HTMLElement>('[data-media-id]') ?? [])]
    .find((element) => element.dataset.mediaId === domId(activeId.value!))
  item?.querySelector<HTMLElement>('.a-photo-tile__open')?.focus()
}

onMounted(focusActive)
watch(() => props.state, (state, previousState) => {
  if (state === 'ready' && previousState !== 'ready') void focusActive()
})

defineExpose({ focusActive })
</script>

<template>
  <section
    ref="root"
    class="a-media-grid"
    :class="{ 'a-media-grid--marquee-active': marqueeActive }"
    :aria-busy="state === 'loading'"
    @keydown="handleKeydown"
    @pointerdown="marquee.onPointerDown"
    @pointermove="marquee.onPointerMove"
    @pointerup="marquee.onPointerUp"
    @pointercancel="marquee.onPointerCancel"
  >
    <div v-if="state === 'loading'" class="a-media-grid__items" role="status">
      <ASkeleton
        v-for="index in loadingCount"
        :key="index"
        height="var(--a-layout-media-min)"
        class="a-media-grid__skeleton"
      />
      <span class="a-visually-hidden">Cargando galería</span>
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
      v-else-if="state === 'empty' || !media.length"
      icon="photo_library"
      :title="emptyTitle"
      :description="emptyDescription"
      :disabled="disabled"
    >
      <template #actions><slot name="empty-actions" /></template>
    </AEmptyState>
    <div v-else class="a-media-grid__items">
      <APhotoTile
        v-for="item in media"
        :key="domId(item.id)"
        :data-media-id="domId(item.id)"
        :data-selection-id="domId(item.id)"
        :data-selection-disabled="disabled || item.disabled || undefined"
        :media="item"
        :selected="selectedIds.includes(item.id)"
        :selectable="selectable"
        :disabled="disabled"
        @open="emit('open', item)"
        @select="(_item, selected, event) => setSelected(item, selected, event)"
        @menu="(_item, event) => emit('menu', item, event)"
        @focus="activeId = item.id"
      >
        <template v-if="$slots['item-menu']" #menu><slot name="item-menu" :media="item" /></template>
      </APhotoTile>
    </div>
    <div
      v-if="marqueeActive"
      class="a-media-grid__marquee"
      :style="marqueeStyle"
      aria-hidden="true"
    />
  </section>
</template>

<style scoped>
.a-media-grid { min-width: 0; }
.a-media-grid--marquee-active {
  cursor: crosshair;
  user-select: none;
}
.a-media-grid__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--a-layout-media-min), 1fr));
  gap: var(--a-space-2);
}
.a-media-grid__skeleton {
  aspect-ratio: 1;
  border-radius: var(--a-radius-md);
}
.a-media-grid__marquee {
  position: fixed;
  z-index: var(--a-z-overlay);
  border: var(--a-border-width) solid var(--a-primary);
  background: color-mix(in srgb, var(--a-primary) 14%, transparent);
  box-shadow: 0 0 0 var(--a-border-width) color-mix(in srgb, var(--a-bg-raised) 60%, transparent) inset;
  pointer-events: none;
}
@media (max-width: 22rem) {
  .a-media-grid__items { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
