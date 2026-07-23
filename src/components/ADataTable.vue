<script setup lang="ts" generic="Row extends ADataRow = ADataRow">
import { computed, useId, useSlots } from 'vue'

import type {
  ADataRow,
  AId,
  ALoadState,
  ARowKey,
  ATableColumn,
  ATableSort
} from '../types/core'
import AEmptyState from './AEmptyState.vue'
import AErrorState from './AErrorState.vue'

const props = withDefaults(defineProps<{
  caption: string
  columns: readonly ATableColumn<Row>[]
  rows: readonly Row[]
  rowKey: ARowKey<Row>
  selected?: readonly AId[]
  sort?: ATableSort | null
  selection?: 'none' | 'single' | 'multiple'
  state?: ALoadState
  disabled?: boolean
  stickyHeader?: boolean
  mobileMode?: 'cards' | 'scroll'
  rowActivatable?: boolean
  rowLabel?: (row: Row) => string
  captionVisible?: boolean
  loadingRows?: number
  loadingLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
  errorTitle?: string
  errorMessage?: string
  retryLabel?: string
  selectAllLabel?: string
  actionsLabel?: string
}>(), {
  selected: () => [],
  sort: null,
  selection: 'none',
  state: 'ready',
  disabled: false,
  stickyHeader: false,
  mobileMode: 'cards',
  rowActivatable: false,
  captionVisible: false,
  loadingRows: 3,
  loadingLabel: 'Cargando datos',
  emptyTitle: 'No hay datos',
  errorTitle: 'No se pudieron cargar los datos',
  selectAllLabel: 'Seleccionar todas las filas',
  actionsLabel: 'Acciones'
})

const emit = defineEmits<{
  'update:selected': [keys: AId[]]
  'update:sort': [sort: ATableSort]
  'row-activate': [row: Row]
  retry: []
}>()

const instanceId = useId()
const selectionName = `a-data-table-selection-${instanceId}`
const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))

const effectiveState = computed<ALoadState>(() => {
  if (props.state === 'loading' || props.state === 'error' || props.state === 'empty') {
    return props.state
  }

  return props.rows.length === 0 ? 'empty' : 'ready'
})

const controlsDisabled = computed(() => props.disabled || effectiveState.value === 'loading')
const totalColumns = computed(() => (
  props.columns.length
  + (props.selection === 'none' ? 0 : 1)
  + (hasActions.value ? 1 : 0)
))

function resolveValue(
  row: Row,
  accessor: keyof Row | ((item: Row) => unknown)
) {
  return typeof accessor === 'function' ? accessor(row) : row[accessor]
}

function resolveRowKey(row: Row): AId {
  return typeof props.rowKey === 'function'
    ? props.rowKey(row)
    : row[props.rowKey] as AId
}

function resolveRowLabel(row: Row) {
  return props.rowLabel?.(row) ?? String(resolveRowKey(row))
}

function resolveCellValue(row: Row, column: ATableColumn<Row>) {
  return resolveValue(row, column.value)
}

function formatCell(row: Row, column: ATableColumn<Row>) {
  const value = resolveCellValue(row, column)
  return column.format?.(value, row) ?? (value == null ? '' : String(value))
}

function ariaSort(column: ATableColumn<Row>) {
  if (!column.sortable || props.sort?.columnId !== column.id) return undefined
  return props.sort.direction
}

function requestSort(column: ATableColumn<Row>) {
  if (!column.sortable || controlsDisabled.value) return

  const direction = props.sort?.columnId === column.id && props.sort.direction === 'ascending'
    ? 'descending'
    : 'ascending'

  emit('update:sort', { columnId: column.id, direction })
}

function isSelected(row: Row) {
  return props.selected.includes(resolveRowKey(row))
}

function updateRowSelection(row: Row, checked: boolean) {
  if (controlsDisabled.value || props.selection === 'none') return

  const key = resolveRowKey(row)

  if (props.selection === 'single') {
    emit('update:selected', checked ? [key] : [])
    return
  }

  emit(
    'update:selected',
    checked
      ? [...new Set([...props.selected, key])]
      : props.selected.filter((selectedKey) => selectedKey !== key)
  )
}

const visibleKeys = computed(() => props.rows.map(resolveRowKey))
const allVisibleSelected = computed(() => (
  visibleKeys.value.length > 0
  && visibleKeys.value.every((key) => props.selected.includes(key))
))
const someVisibleSelected = computed(() => (
  !allVisibleSelected.value
  && visibleKeys.value.some((key) => props.selected.includes(key))
))

function updateAllVisible(checked: boolean) {
  if (controlsDisabled.value || props.selection !== 'multiple') return

  const visible = new Set(visibleKeys.value)
  emit(
    'update:selected',
    checked
      ? [...new Set([...props.selected, ...visibleKeys.value])]
      : props.selected.filter((key) => !visible.has(key))
  )
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element
    && Boolean(target.closest('a, button, input, select, textarea, [role="button"], [role="link"]'))
}

function activateRow(row: Row, event?: Event) {
  if (!props.rowActivatable || controlsDisabled.value || isInteractiveTarget(event?.target ?? null)) return
  emit('row-activate', row)
}

function activateRowFromKeyboard(row: Row, event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  activateRow(row, event)
}
</script>

<template>
  <div
    class="a-data-table"
    :class="[
      `a-data-table--mobile-${mobileMode}`,
      {
        'a-data-table--sticky': stickyHeader,
        'a-data-table--disabled': disabled
      }
    ]"
    :aria-busy="effectiveState === 'loading' || undefined"
    :aria-disabled="disabled || undefined"
  >
    <div class="a-data-table__scroller" tabindex="0">
      <table>
        <caption :class="{ 'a-data-table__caption--hidden': !captionVisible }">
          {{ caption }}
        </caption>
        <thead>
          <tr>
            <th
              v-if="selection !== 'none'"
              class="a-data-table__selection-cell"
              scope="col"
            >
              <label
                v-if="selection === 'multiple'"
                class="a-data-table__selection-control"
              >
                <input
                  type="checkbox"
                  :checked="allVisibleSelected"
                  :indeterminate="someVisibleSelected"
                  :disabled="controlsDisabled"
                  :aria-label="selectAllLabel"
                  @change="updateAllVisible(($event.target as HTMLInputElement).checked)"
                >
              </label>
            </th>
            <th
              v-for="column in columns"
              :key="column.id"
              scope="col"
              :class="`a-data-table__cell--${column.align ?? 'start'}`"
              :style="{ width: column.width }"
              :aria-sort="ariaSort(column)"
            >
              <button
                v-if="column.sortable"
                class="a-data-table__sort"
                type="button"
                :disabled="controlsDisabled"
                @click="requestSort(column)"
              >
                <slot :name="`header-${column.id}`" :column="column">
                  {{ column.label }}
                </slot>
                <span class="a-data-table__sort-icon" aria-hidden="true">
                  {{ sort?.columnId === column.id ? (sort.direction === 'ascending' ? '↑' : '↓') : '↕' }}
                </span>
              </button>
              <span v-else>
                <slot :name="`header-${column.id}`" :column="column">
                  {{ column.label }}
                </slot>
              </span>
            </th>
            <th v-if="hasActions" class="a-data-table__actions-heading" scope="col">
              <span class="a-data-table__visually-hidden">{{ actionsLabel }}</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="effectiveState === 'ready'">
          <tr
            v-for="row in rows"
            :key="resolveRowKey(row)"
            :class="{
              'a-data-table__row--selected': isSelected(row),
              'a-data-table__row--activatable': rowActivatable
            }"
            :tabindex="rowActivatable && !controlsDisabled ? 0 : undefined"
            @click="activateRow(row, $event)"
            @keydown="activateRowFromKeyboard(row, $event)"
          >
            <td
              v-if="selection !== 'none'"
              class="a-data-table__selection-cell"
              :data-label="selection === 'multiple' ? selectAllLabel : undefined"
            >
              <label class="a-data-table__selection-control">
                <input
                  :type="selection === 'single' ? 'radio' : 'checkbox'"
                  :name="selection === 'single' ? selectionName : undefined"
                  :checked="isSelected(row)"
                  :disabled="controlsDisabled"
                  :aria-label="`Seleccionar ${resolveRowLabel(row)}`"
                  @click.stop
                  @change="updateRowSelection(row, ($event.target as HTMLInputElement).checked)"
                >
              </label>
            </td>
            <td
              v-for="column in columns"
              :key="column.id"
              :class="`a-data-table__cell--${column.align ?? 'start'}`"
              :data-label="column.mobileLabel ?? column.label"
            >
              <slot
                :name="`cell-${column.id}`"
                :row="row"
                :column="column"
                :value="resolveCellValue(row, column)"
              >
                {{ formatCell(row, column) }}
              </slot>
            </td>
            <td v-if="hasActions" class="a-data-table__actions" :data-label="actionsLabel">
              <slot name="actions" :row="row" :disabled="controlsDisabled" />
            </td>
          </tr>
        </tbody>

        <tbody v-else-if="effectiveState === 'loading'" aria-live="polite">
          <tr
            v-for="rowIndex in loadingRows"
            :key="rowIndex"
            class="a-data-table__loading-row"
          >
            <td
              v-for="cellIndex in totalColumns"
              :key="cellIndex"
              :data-label="cellIndex === 1 ? loadingLabel : undefined"
            >
              <span class="a-data-table__skeleton" aria-hidden="true" />
              <span v-if="rowIndex === 1 && cellIndex === 1" class="a-data-table__visually-hidden">
                {{ loadingLabel }}
              </span>
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr class="a-data-table__state-row">
            <td :colspan="totalColumns">
              <AErrorState
                v-if="effectiveState === 'error'"
                compact
                :title="errorTitle"
                :description="errorMessage"
                :retry-label="retryLabel"
                :disabled="disabled"
                @retry="$emit('retry')"
              >
                <template v-if="$slots.error" #default>
                  <slot name="error" />
                </template>
              </AErrorState>
              <AEmptyState
                v-else
                compact
                :title="emptyTitle"
                :description="emptyDescription"
                :icon="emptyIcon"
                :disabled="disabled"
              >
                <template v-if="$slots.empty" #default>
                  <slot name="empty" />
                </template>
              </AEmptyState>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.a-data-table {
  width: 100%;
  color: var(--a-text-primary);
}

.a-data-table__scroller {
  width: 100%;
  overflow: auto;
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-raised);
}

.a-data-table__scroller:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: var(--a-space-0);
  font-size: var(--a-font-size-sm);
}

caption {
  padding: var(--a-space-4);
  color: var(--a-text-primary);
  font-size: var(--a-font-size-md);
  font-weight: var(--a-font-weight-semibold);
  text-align: start;
}

.a-data-table__caption--hidden,
.a-data-table__visually-hidden {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

th,
td {
  min-height: var(--a-target-min);
  padding: var(--a-space-3) var(--a-space-4);
  border-block-end: var(--a-border-width) solid var(--a-border);
  vertical-align: middle;
}

th {
  background: var(--a-bg-muted);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  font-weight: var(--a-font-weight-semibold);
  text-align: start;
}

.a-data-table--sticky thead th {
  position: sticky;
  inset-block-start: var(--a-space-0);
  z-index: var(--a-z-sticky);
}

tbody tr:last-child td {
  border-block-end: var(--a-space-0);
}

.a-data-table__row--selected td {
  background: var(--a-bg-selected);
}

.a-data-table__row--activatable {
  cursor: pointer;
}

.a-data-table__row--activatable:hover td {
  background: var(--a-bg-hover);
}

.a-data-table__row--activatable:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: calc(var(--a-border-width-strong) * -1);
}

.a-data-table__cell--start {
  text-align: start;
}

.a-data-table__cell--center {
  text-align: center;
}

.a-data-table__cell--end {
  text-align: end;
  font-variant-numeric: tabular-nums;
}

.a-data-table__sort {
  display: inline-flex;
  align-items: center;
  justify-content: inherit;
  gap: var(--a-space-2);
  min-height: var(--a-target-min);
  margin-block: calc(var(--a-space-3) * -1);
  border: var(--a-space-0);
  padding: var(--a-space-2) var(--a-space-0);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.a-data-table__sort:hover:not(:disabled) {
  color: var(--a-text-primary);
}

.a-data-table__sort:focus-visible {
  border-radius: var(--a-radius-xs);
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
}

.a-data-table__sort:disabled {
  cursor: not-allowed;
  opacity: var(--a-opacity-disabled);
}

.a-data-table__sort-icon {
  color: var(--a-primary);
  font-family: var(--a-font-mono);
}

.a-data-table__selection-cell {
  width: var(--a-target-min);
  padding: var(--a-space-0);
  text-align: center;
}

.a-data-table__selection-control {
  display: inline-grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  cursor: pointer;
}

.a-data-table__selection-control input {
  width: var(--a-icon-sm);
  height: var(--a-icon-sm);
  margin: var(--a-space-0);
  accent-color: var(--a-primary);
  cursor: inherit;
}

.a-data-table__selection-control input:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
}

.a-data-table__actions-heading,
.a-data-table__actions {
  width: var(--a-target-min);
  text-align: end;
}

.a-data-table__actions :deep(button),
.a-data-table__actions :deep(a) {
  min-width: var(--a-target-min);
  min-height: var(--a-target-min);
}

.a-data-table__loading-row td {
  height: var(--a-target-min);
}

.a-data-table__skeleton {
  display: block;
  width: 78%;
  height: var(--a-space-3);
  overflow: hidden;
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-muted);
}

.a-data-table__state-row td {
  padding: var(--a-space-0);
}

.a-data-table--disabled {
  opacity: var(--a-opacity-disabled);
}

@media (max-width: 48rem) {
  .a-data-table--mobile-cards .a-data-table__scroller {
    overflow: visible;
    border: var(--a-space-0);
    background: transparent;
  }

  .a-data-table--mobile-cards table,
  .a-data-table--mobile-cards tbody,
  .a-data-table--mobile-cards tr,
  .a-data-table--mobile-cards td {
    display: block;
    width: 100%;
  }

  .a-data-table--mobile-cards thead {
    position: absolute;
    width: var(--a-border-width);
    height: var(--a-border-width);
    overflow: hidden;
    clip-path: inset(50%);
  }

  .a-data-table--mobile-cards tbody {
    display: grid;
    gap: var(--a-space-3);
  }

  .a-data-table--mobile-cards tbody tr {
    overflow: hidden;
    border: var(--a-border-width) solid var(--a-border);
    border-radius: var(--a-radius-md);
    background: var(--a-bg-raised);
  }

  .a-data-table--mobile-cards td {
    display: grid;
    grid-template-columns: minmax(var(--a-layout-table-label), .45fr) minmax(0, 1fr);
    align-items: center;
    gap: var(--a-space-3);
    min-height: var(--a-target-min);
    text-align: start;
  }

  .a-data-table--mobile-cards td::before {
    color: var(--a-text-secondary);
    content: attr(data-label);
    font-size: var(--a-font-size-xs);
    font-weight: var(--a-font-weight-semibold);
  }

  .a-data-table--mobile-cards .a-data-table__selection-cell,
  .a-data-table--mobile-cards .a-data-table__actions {
    display: flex;
    justify-content: space-between;
    padding-block: var(--a-space-0);
    padding-inline-start: var(--a-space-4);
  }

  .a-data-table--mobile-cards .a-data-table__state-row td,
  .a-data-table--mobile-cards .a-data-table__loading-row td {
    display: block;
  }

  .a-data-table--mobile-cards .a-data-table__state-row td::before,
  .a-data-table--mobile-cards .a-data-table__loading-row td::before {
    content: none;
  }
}

</style>
