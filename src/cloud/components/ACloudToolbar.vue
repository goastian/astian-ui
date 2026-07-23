<script setup lang="ts">
import { computed, useId } from 'vue'

import AButton from '../../components/AButton.vue'
import AIcon from '../../components/AIcon.vue'
import AIconButton from '../../components/AIconButton.vue'
import ASelect from '../../components/ASelect.vue'
import type { AstianOption } from '../../types/ui'
import type { ACloudSortOption, ACloudViewMode } from '../types'

const search = defineModel<string>('search', { default: '' })
const view = defineModel<ACloudViewMode>('view', { default: 'grid' })
const sort = defineModel<string | number | null>('sort', { default: null })

const props = withDefaults(defineProps<{
  searchLabel?: string
  searchPlaceholder?: string
  newLabel?: string
  filterLabel?: string
  sortLabel?: string
  sortOptions?: ACloudSortOption[]
  loading?: boolean
  disabled?: boolean
  showViewToggle?: boolean
  showCreate?: boolean
}>(), {
  searchLabel: 'Buscar',
  searchPlaceholder: 'Buscar archivos y carpetas',
  newLabel: 'Nuevo',
  filterLabel: 'Filtros',
  sortLabel: 'Ordenar',
  sortOptions: () => [],
  loading: false,
  disabled: false,
  showViewToggle: true,
  showCreate: true
})

const emit = defineEmits<{
  create: []
  filters: []
  submitSearch: [query: string]
}>()

const searchId = useId()
const selectOptions = computed<AstianOption[]>(() => props.sortOptions.map((option) => ({
  label: option.label,
  value: option.id,
  icon: option.direction === 'descending' ? 'south' : option.direction === 'ascending' ? 'north' : undefined
})))
</script>

<template>
  <div class="a-cloud-toolbar" role="search" :aria-busy="loading">
    <slot name="start" />
    <form class="a-cloud-toolbar__search" @submit.prevent="emit('submitSearch', search)">
      <label class="a-visually-hidden" :for="searchId">{{ searchLabel }}</label>
      <AIcon name="search" aria-hidden="true" />
      <input
        :id="searchId"
        v-model="search"
        type="search"
        :placeholder="searchPlaceholder"
        :disabled="disabled"
        autocomplete="off"
      >
    </form>

    <div class="a-cloud-toolbar__controls">
      <ASelect
        v-if="selectOptions.length"
        v-model="sort"
        class="a-cloud-toolbar__sort"
        :options="selectOptions"
        :label="sortLabel"
        :disabled="disabled"
        size="small"
      />
      <AButton
        :label="filterLabel"
        icon="filter_list"
        type="secondary"
        :disabled="disabled"
        @click="emit('filters')"
      />
      <div v-if="showViewToggle" class="a-cloud-toolbar__view" role="group" aria-label="Vista">
        <AIconButton
          icon="grid_view"
          label="Vista de cuadrícula"
          :variant="view === 'grid' ? 'filled' : 'unfilled'"
          :aria-pressed="view === 'grid'"
          :disabled="disabled"
          @click="view = 'grid'"
        />
        <AIconButton
          icon="view_list"
          label="Vista de lista"
          :variant="view === 'list' ? 'filled' : 'unfilled'"
          :aria-pressed="view === 'list'"
          :disabled="disabled"
          @click="view = 'list'"
        />
      </div>
      <slot name="actions" />
      <AButton
        v-if="showCreate"
        :label="newLabel"
        icon="add"
        :loading="loading"
        :disabled="disabled"
        @click="emit('create')"
      />
    </div>
  </div>
</template>

<style scoped>
.a-cloud-toolbar {
  display: grid;
  grid-template-columns: minmax(var(--a-layout-search-min), 1fr) auto;
  gap: var(--a-space-3);
  align-items: center;
  padding-block: var(--a-space-3);
  border-bottom: var(--a-border-width) solid var(--a-border);
}
.a-cloud-toolbar__search {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--a-space-2);
  align-items: center;
  min-height: var(--a-control-md);
  padding-inline: var(--a-space-4);
  border: var(--a-border-width) solid var(--a-border-strong);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  color: var(--a-text-secondary);
}
.a-cloud-toolbar__search:focus-within {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
}
.a-cloud-toolbar__search input {
  min-width: 0;
  min-height: var(--a-target-min);
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--a-text-primary);
}
.a-cloud-toolbar__search input::placeholder { color: var(--a-text-tertiary); }
.a-cloud-toolbar__controls {
  display: flex;
  gap: var(--a-space-2);
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.a-cloud-toolbar__sort { width: var(--a-layout-field-sm); }
.a-cloud-toolbar__view {
  display: inline-flex;
  padding: var(--a-space-1);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-muted);
}
@media (max-width: 56rem) {
  .a-cloud-toolbar { grid-template-columns: 1fr; }
  .a-cloud-toolbar__controls { justify-content: flex-start; }
}
@media (max-width: 30rem) {
  .a-cloud-toolbar__controls > :deep(.a-button) { flex: 1; }
  .a-cloud-toolbar__sort { width: 100%; }
}
</style>
