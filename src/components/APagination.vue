<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'

import type {
  ALoadState,
  APaginationModel,
  APaginationQuerySync,
  APagePaginationModel
} from '../types/core'

type PageToken =
  | { kind: 'page'; page: number }
  | { kind: 'ellipsis'; key: string }

const model = defineModel<APaginationModel>({ required: true })

const props = withDefaults(defineProps<{
  total?: number
  pageCount?: number
  pageSizes?: readonly number[]
  siblingCount?: number
  state?: ALoadState
  disabled?: boolean
  querySync?: boolean | APaginationQuerySync
  label?: string
  previousLabel?: string
  nextLabel?: string
  firstLabel?: string
  lastLabel?: string
  pageSizeLabel?: string
  loadingLabel?: string
  totalLabel?: (total: number) => string
  pageLabel?: (page: number) => string
  showFirstLast?: boolean
}>(), {
  pageSizes: () => [10, 25, 50],
  siblingCount: 1,
  state: 'ready',
  disabled: false,
  querySync: false,
  label: 'Paginación',
  previousLabel: 'Página anterior',
  nextLabel: 'Página siguiente',
  firstLabel: 'Primera página',
  lastLabel: 'Última página',
  pageSizeLabel: 'Elementos por página',
  loadingLabel: 'Cargando página',
  totalLabel: (total: number) => `${new Intl.NumberFormat().format(total)} elementos`,
  pageLabel: (page: number) => `Página ${page}`,
  showFirstLast: true
})

const emit = defineEmits<{
  change: [model: APaginationModel]
}>()

const pageModel = computed(() => (
  model.value.mode === 'page' ? model.value : null
))
const cursorModel = computed(() => (
  model.value.mode === 'cursor' ? model.value : null
))

const availablePageSizes = computed(() => {
  const sizes = [...new Set(
    props.pageSizes.filter((size) => Number.isInteger(size) && size > 0)
  )]
  const currentSize = pageModel.value?.pageSize
  if (
    currentSize != null
    && Number.isInteger(currentSize)
    && currentSize > 0
    && !sizes.includes(currentSize)
  ) {
    sizes.push(currentSize)
  }
  return sizes
})

const totalPages = computed(() => {
  if (!pageModel.value) return 1
  if (props.pageCount != null) return Math.max(1, Math.floor(props.pageCount))
  const pageSize = Number.isFinite(pageModel.value.pageSize) && pageModel.value.pageSize > 0
    ? pageModel.value.pageSize
    : 1
  if (props.total != null) return Math.max(1, Math.ceil(Math.max(0, props.total) / pageSize))
  return Math.max(1, pageModel.value.page)
})

const currentPage = computed(() => (
  pageModel.value
    ? Math.min(totalPages.value, Math.max(1, pageModel.value.page))
    : 1
))

const controlsDisabled = computed(() => (
  props.disabled
  || props.state === 'loading'
  || props.state === 'error'
  || props.state === 'empty'
))

const pageTokens = computed<PageToken[]>(() => {
  if (!pageModel.value) return []

  const pages = new Set<number>([1, totalPages.value])
  for (
    let page = currentPage.value - props.siblingCount;
    page <= currentPage.value + props.siblingCount;
    page += 1
  ) {
    if (page > 0 && page <= totalPages.value) pages.add(page)
  }

  const sortedPages = [...pages].sort((left, right) => left - right)
  const tokens: PageToken[] = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]
    if (previousPage != null && page - previousPage > 1) {
      tokens.push({ kind: 'ellipsis', key: `${previousPage}-${page}` })
    }
    tokens.push({ kind: 'page', page })
  })

  return tokens
})

const statusLabel = computed(() => {
  if (props.state === 'loading') return props.loadingLabel
  if (pageModel.value) return `${props.pageLabel(currentPage.value)} de ${totalPages.value}`
  return ''
})

function commit(nextModel: APaginationModel) {
  model.value = nextModel
  emit('change', nextModel)
}

function goToPage(page: number) {
  if (!pageModel.value || controlsDisabled.value) return

  const nextPage = Math.min(totalPages.value, Math.max(1, page))
  if (nextPage === pageModel.value.page) return
  commit({ ...pageModel.value, page: nextPage })
}

function updatePageSize(event: Event) {
  if (!pageModel.value || controlsDisabled.value) return

  const pageSize = Number((event.target as HTMLSelectElement).value)
  if (!Number.isFinite(pageSize) || pageSize <= 0) return
  commit({ ...pageModel.value, page: 1, pageSize })
}

function goToCursor(direction: 'previous' | 'next') {
  const current = cursorModel.value
  if (!current || controlsDisabled.value) return

  if (direction === 'previous' && current.hasPrevious) {
    commit({ ...current, cursor: current.previousCursor })
  }

  if (direction === 'next' && current.hasNext) {
    commit({ ...current, cursor: current.nextCursor })
  }
}

const queryOptions = computed<Required<APaginationQuerySync>>(() => {
  const options = typeof props.querySync === 'object' ? props.querySync : {}
  return {
    pageKey: options.pageKey ?? 'page',
    sizeKey: options.sizeKey ?? 'pageSize',
    history: options.history ?? 'replace'
  }
})

let skipNextQueryWrite = false

function writeQuery(value: APagePaginationModel) {
  if (!props.querySync || typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.searchParams.set(queryOptions.value.pageKey, String(value.page))
  url.searchParams.set(queryOptions.value.sizeKey, String(value.pageSize))

  const method = queryOptions.value.history === 'push' ? 'pushState' : 'replaceState'
  window.history[method](window.history.state, '', url)
}

function readQuery() {
  if (!props.querySync || typeof window === 'undefined' || !pageModel.value) return

  const query = new URL(window.location.href).searchParams
  const parsedPage = Number(query.get(queryOptions.value.pageKey))
  const parsedSize = Number(query.get(queryOptions.value.sizeKey))

  const pageSize = Number.isInteger(parsedSize) && parsedSize > 0
    ? parsedSize
    : pageModel.value.pageSize
  const queryTotalPages = props.pageCount != null
    ? Math.max(1, Math.floor(props.pageCount))
    : props.total != null
      ? Math.max(1, Math.ceil(Math.max(0, props.total) / pageSize))
      : Math.max(1, pageModel.value.page)
  const page = Number.isInteger(parsedPage) && parsedPage > 0
    ? Math.min(queryTotalPages, parsedPage)
    : Math.min(queryTotalPages, pageModel.value.page)

  if (page === pageModel.value.page && pageSize === pageModel.value.pageSize) return

  skipNextQueryWrite = true
  commit({ ...pageModel.value, page, pageSize })
}

watch(
  () => model.value,
  (value) => {
    if (value.mode !== 'page' || !props.querySync) return
    if (skipNextQueryWrite) {
      skipNextQueryWrite = false
      return
    }
    writeQuery(value)
  },
  { deep: true }
)

onMounted(() => {
  if (!props.querySync || typeof window === 'undefined') return
  readQuery()
  window.addEventListener('popstate', readQuery)
  if (model.value.mode === 'page') writeQuery(model.value)
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('popstate', readQuery)
})
</script>

<template>
  <nav
    class="a-pagination"
    :class="{
      'a-pagination--disabled': disabled,
      'a-pagination--loading': state === 'loading'
    }"
    :aria-label="label"
    :aria-busy="state === 'loading' || undefined"
    :aria-disabled="controlsDisabled || undefined"
  >
    <p class="a-pagination__status" aria-live="polite">{{ statusLabel }}</p>

    <div v-if="pageModel" class="a-pagination__main">
      <div class="a-pagination__controls">
        <button
          v-if="showFirstLast"
          class="a-pagination__button a-pagination__button--edge"
          type="button"
          :disabled="controlsDisabled || currentPage <= 1"
          @click="goToPage(1)"
        >
          {{ firstLabel }}
        </button>
        <button
          class="a-pagination__button"
          type="button"
          :disabled="controlsDisabled || currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          {{ previousLabel }}
        </button>

        <ol class="a-pagination__pages">
          <li v-for="token in pageTokens" :key="token.kind === 'page' ? token.page : token.key">
            <span v-if="token.kind === 'ellipsis'" class="a-pagination__ellipsis" aria-hidden="true">…</span>
            <button
              v-else
              class="a-pagination__button a-pagination__page"
              type="button"
              :class="{ 'a-pagination__page--current': token.page === currentPage }"
              :aria-label="pageLabel(token.page)"
              :aria-current="token.page === currentPage ? 'page' : undefined"
              :disabled="controlsDisabled"
              @click="goToPage(token.page)"
            >
              {{ token.page }}
            </button>
          </li>
        </ol>

        <button
          class="a-pagination__button"
          type="button"
          :disabled="controlsDisabled || currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          {{ nextLabel }}
        </button>
        <button
          v-if="showFirstLast"
          class="a-pagination__button a-pagination__button--edge"
          type="button"
          :disabled="controlsDisabled || currentPage >= totalPages"
          @click="goToPage(totalPages)"
        >
          {{ lastLabel }}
        </button>
      </div>

      <div class="a-pagination__meta">
        <span v-if="total != null" class="a-pagination__total">{{ totalLabel(total) }}</span>
        <label v-if="availablePageSizes.length > 0" class="a-pagination__size">
          <span>{{ pageSizeLabel }}</span>
          <select
            :value="pageModel.pageSize"
            :disabled="controlsDisabled"
            @change="updatePageSize"
          >
            <option v-for="size in availablePageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
        </label>
      </div>
    </div>

    <div v-else-if="cursorModel" class="a-pagination__controls a-pagination__controls--cursor">
      <button
        class="a-pagination__button"
        type="button"
        :disabled="controlsDisabled || !cursorModel.hasPrevious"
        @click="goToCursor('previous')"
      >
        {{ previousLabel }}
      </button>
      <slot name="cursor" :model="cursorModel" />
      <button
        class="a-pagination__button"
        type="button"
        :disabled="controlsDisabled || !cursorModel.hasNext"
        @click="goToCursor('next')"
      >
        {{ nextLabel }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.a-pagination {
  display: grid;
  gap: var(--a-space-3);
  color: var(--a-text-primary);
}

.a-pagination__status {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  margin: var(--a-space-0);
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.a-pagination__main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-3) var(--a-space-4);
}

.a-pagination__controls,
.a-pagination__pages,
.a-pagination__meta,
.a-pagination__size {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--a-space-1);
}

.a-pagination__pages {
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}

.a-pagination__button,
.a-pagination__size select {
  min-width: var(--a-target-min);
  min-height: var(--a-target-min);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  padding: var(--a-space-2) var(--a-space-3);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
  font: var(--a-font-weight-semibold) var(--a-font-size-sm) / var(--a-line-height-tight) var(--a-font-sans);
  cursor: pointer;
  transition:
    background var(--a-motion-fast),
    border-color var(--a-motion-fast),
    color var(--a-motion-fast),
    transform var(--a-motion-fast);
}

.a-pagination__button:hover:not(:disabled),
.a-pagination__size select:hover:not(:disabled) {
  border-color: var(--a-border-strong);
  background: var(--a-bg-hover);
}

.a-pagination__button:active:not(:disabled) {
  transform: translateY(var(--a-border-width));
}

.a-pagination__button:focus-visible,
.a-pagination__size select:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
}

.a-pagination__button:disabled,
.a-pagination__size select:disabled {
  cursor: not-allowed;
  opacity: var(--a-opacity-disabled);
}

.a-pagination__page {
  padding-inline: var(--a-space-2);
  font-family: var(--a-font-mono);
  font-variant-numeric: tabular-nums;
}

.a-pagination__page--current {
  border-color: var(--a-primary);
  background: var(--a-primary);
  color: var(--a-text-inverse);
}

.a-pagination__ellipsis {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  color: var(--a-text-tertiary);
}

.a-pagination__meta {
  gap: var(--a-space-3);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.a-pagination__size {
  gap: var(--a-space-2);
  font-weight: var(--a-font-weight-medium);
}

.a-pagination__size select {
  padding-inline: var(--a-space-2);
  font-variant-numeric: tabular-nums;
}

.a-pagination--disabled {
  opacity: var(--a-opacity-disabled);
}

@media (max-width: 44rem) {
  .a-pagination__main,
  .a-pagination__controls,
  .a-pagination__meta {
    width: 100%;
  }

  .a-pagination__controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .a-pagination__pages {
    grid-column: 1 / -1;
    grid-row: 1;
    justify-content: center;
  }

  .a-pagination__button {
    width: 100%;
  }

  .a-pagination__page {
    width: var(--a-target-min);
  }

  .a-pagination__button--edge {
    display: none;
  }

  .a-pagination__meta {
    justify-content: space-between;
  }

  .a-pagination__controls--cursor {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 24rem) {
  .a-pagination__pages li:not(:has(.a-pagination__page--current)) {
    display: none;
  }

  .a-pagination__meta,
  .a-pagination__size {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .a-pagination__button,
  .a-pagination__size select {
    transition: none;
  }
}
</style>
