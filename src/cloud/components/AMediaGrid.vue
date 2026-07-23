<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

import type { AId, ALoadState } from '../../types/core'
import AEmptyState from '../../components/AEmptyState.vue'
import AErrorState from '../../components/AErrorState.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import APhotoTile from './APhotoTile.vue'
import type { ACloudMedia } from '../types'

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
}>(), {
  state: 'ready',
  loadingCount: 8,
  selectable: true,
  disabled: false,
  emptyTitle: 'No hay contenido multimedia',
  emptyDescription: 'Las imágenes y videos aparecerán aquí.',
  errorTitle: 'No se pudo cargar la galería',
  errorDescription: 'Reintenta la carga.'
})

const emit = defineEmits<{
  open: [media: ACloudMedia]
  menu: [media: ACloudMedia, event: MouseEvent]
  retry: []
}>()

const root = ref<HTMLElement | null>(null)
const domId = (id: AId) => `${typeof id}:${String(id)}`

const setSelected = (item: ACloudMedia, selected: boolean) => {
  const next = new Set(selectedIds.value)
  if (selected) next.add(item.id)
  else next.delete(item.id)
  selectedIds.value = [...next]
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
  <section ref="root" class="a-media-grid" :aria-busy="state === 'loading'">
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
        :key="item.id"
        :data-media-id="domId(item.id)"
        :media="item"
        :selected="selectedIds.includes(item.id)"
        :selectable="selectable"
        :disabled="disabled"
        @open="emit('open', item)"
        @select="(_item, selected) => setSelected(item, selected)"
        @menu="(_item, event) => emit('menu', item, event)"
        @focus="activeId = item.id"
      >
        <template v-if="$slots['item-menu']" #menu><slot name="item-menu" :media="item" /></template>
      </APhotoTile>
    </div>
  </section>
</template>

<style scoped>
.a-media-grid { min-width: 0; }
.a-media-grid__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--a-layout-media-min), 1fr));
  gap: var(--a-space-2);
}
.a-media-grid__skeleton {
  aspect-ratio: 1;
  border-radius: var(--a-radius-md);
}
@media (max-width: 22rem) {
  .a-media-grid__items { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
