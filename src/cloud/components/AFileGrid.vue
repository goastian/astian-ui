<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import AEmptyState from '../../components/AEmptyState.vue'
import AErrorState from '../../components/AErrorState.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import type { AId, ALoadState } from '../../types/core'
import AFileCard from './AFileCard.vue'
import type { ACloudItem } from '../types'

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
}>(), {
  state: 'ready',
  loadingCount: 6,
  selectable: true,
  disabled: false,
  emptyTitle: 'No hay elementos',
  emptyDescription: 'Crea uno nuevo o cambia los filtros.',
  errorTitle: 'No se pudieron cargar los elementos',
  errorDescription: 'Reintenta la carga.',
})

const emit = defineEmits<{
  open: [item: ACloudItem]
  favorite: [item: ACloudItem, favorite: boolean]
  menu: [item: ACloudItem, event: MouseEvent]
  retry: []
}>()

const root = ref<HTMLElement | null>(null)
const renderedItems = computed(() => props.items)

const setSelected = (item: ACloudItem, selected: boolean) => {
  const next = new Set(selectedIds.value)
  if (selected) next.add(item.id)
  else next.delete(item.id)
  selectedIds.value = [...next]
}

const focusActive = async () => {
  if (activeId.value === null) return
  await nextTick()
  const item = [...(root.value?.querySelectorAll<HTMLElement>('[data-cloud-id]') ?? [])]
    .find((element) => element.dataset.cloudId === String(activeId.value))
  item?.querySelector<HTMLElement>('.a-file-card__open')?.focus()
}

onMounted(focusActive)
watch(() => props.state, (state) => {
  if (state === 'ready') void focusActive()
})
</script>

<template>
  <section ref="root" class="a-file-grid" :aria-busy="state === 'loading'">
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
        :key="item.id"
        :data-cloud-id="String(item.id)"
        :item="item"
        :selected="selectedIds.includes(item.id)"
        :selectable="selectable"
        :disabled="disabled"
        @open="emit('open', item)"
        @select="(_item, selected) => setSelected(item, selected)"
        @favorite="(_item, favorite) => emit('favorite', item, favorite)"
        @menu="(_item, event) => emit('menu', item, event)"
        @focus="activeId = item.id"
      >
        <template v-if="$slots['item-menu']" #menu><slot name="item-menu" :item="item" /></template>
      </AFileCard>
    </div>
  </section>
</template>

<style scoped>
.a-file-grid { min-width: 0; }
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
@media (max-width: 22rem) {
  .a-file-grid__items { grid-template-columns: 1fr; }
}
</style>
