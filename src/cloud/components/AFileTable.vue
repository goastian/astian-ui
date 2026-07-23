<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'

import ADataTable from '../../components/ADataTable.vue'
import AFacepile from '../../components/AFacepile.vue'
import AIcon from '../../components/AIcon.vue'
import AIconButton from '../../components/AIconButton.vue'
import type {
  ADataRow,
  AId,
  ATableColumn,
  ATableSort
} from '../../types/core'
import { cloudDropPosition, useCloudItemDnd } from '../composables/useCloudItemDnd'
import type {
  ACloudCollectionState,
  ACloudDragPayload,
  ACloudDropEffect,
  ACloudDropState,
  ACloudDropTarget,
  ACloudItem,
  ACloudVisibility
} from '../types'

type AFileTableRow = ACloudItem & ADataRow

type AFileTableProps = ACloudCollectionState & {
  items: readonly ACloudItem[]
  loadingCount?: number
  selectable?: boolean
  selectionMode?: 'single' | 'multiple'
  disabled?: boolean
  stickyHeader?: boolean
  mobileMode?: 'cards' | 'scroll'
  caption?: string
  captionVisible?: boolean
  showMenu?: boolean
  retryLabel?: string
  dnd?: boolean
  sourceContainerId?: AId | null
  dropTarget?: ACloudDropTarget | null
  dropState?: ACloudDropState
  dropEffect?: ACloudDropEffect
  draggingIds?: readonly AId[]
  showMoveAction?: boolean
}

const selectedIds = defineModel<AId[]>('selectedIds', { default: () => [] })
const activeId = defineModel<AId | null>('activeId', { default: null })
const sort = defineModel<ATableSort | null>('sort', { default: null })

const props = withDefaults(defineProps<AFileTableProps>(), {
  state: 'ready',
  loadingCount: 5,
  selectable: true,
  selectionMode: 'multiple',
  disabled: false,
  stickyHeader: true,
  mobileMode: 'cards',
  caption: 'Archivos y carpetas',
  captionVisible: false,
  showMenu: true,
  emptyTitle: 'No hay elementos',
  emptyDescription: 'Cambia los filtros o añade un elemento.',
  errorTitle: 'No se pudieron cargar los elementos',
  errorDescription: 'Reintenta la carga.',
  retryLabel: 'Reintentar',
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
  menu: [item: ACloudItem, event: MouseEvent]
  action: [item: ACloudItem, actionId: string, event: Event]
  retry: []
  'drag-start': [payload: ACloudDragPayload, event: DragEvent]
  'drag-end': [payload: ACloudDragPayload | null, event: DragEvent]
  'drop-request': [payload: ACloudDragPayload, event: DragEvent]
  'drop-target-change': [target: ACloudDropTarget | null, event: DragEvent]
  'move-request': [item: ACloudItem, event: Event]
}>()

const root = ref<HTMLElement | null>(null)
const transientDropTarget = ref<ACloudDropTarget | null>(null)
const transientDraggingIds = ref<AId[]>([])
const selectionName = `a-file-table-selection-${useId()}`
const rows = computed(() => props.items as readonly AFileTableRow[])
const effectiveDropTarget = computed(() => props.dropTarget ?? transientDropTarget.value)
const effectiveDraggingIds = computed(() =>
  props.draggingIds.length ? [...props.draggingIds] : transientDraggingIds.value
)
const dndApi = useCloudItemDnd({
  sourceIds: () => effectiveDraggingIds.value,
  sourceContainerId: () => props.sourceContainerId,
  effect: () => props.dropEffect
})

const visibilityCopy: Record<ACloudVisibility, string> = {
  private: 'Privado',
  shared: 'Compartido',
  link: 'Con enlace'
}

const columns = computed<ATableColumn<AFileTableRow>[]>(() => {
  const result: ATableColumn<AFileTableRow>[] = []

  if (props.selectable) {
    result.push({
      id: 'selection',
      label: '',
      value: () => '',
      align: 'center',
      width: 'var(--a-target-min)',
      mobileLabel: 'Selección'
    })
  }

  result.push(
    {
      id: 'name',
      label: 'Nombre',
      value: (item) => item.name,
      sortValue: (item) => item.name,
      sortable: true,
      width: 'var(--a-layout-file-name-column)',
      mobileLabel: 'Nombre'
    },
    {
      id: 'kind',
      label: 'Tipo',
      value: (item) => item.kind,
      sortable: true,
      mobileLabel: 'Tipo'
    },
    {
      id: 'activity',
      label: 'Actividad',
      value: (item) => item.activityLabel ?? '',
      sortable: true,
      mobileLabel: 'Actividad'
    },
    {
      id: 'size',
      label: 'Tamaño',
      value: (item) => item.kind === 'folder' ? item.itemCount : item.size,
      sortable: true,
      align: 'end',
      mobileLabel: 'Tamaño'
    },
    {
      id: 'visibility',
      label: 'Acceso',
      value: (item) => item.visibility ?? '',
      sortable: true,
      mobileLabel: 'Acceso'
    },
    {
      id: 'collaborators',
      label: 'Personas',
      value: (item) => item.collaborators?.length ?? 0,
      align: 'center',
      mobileLabel: 'Personas'
    }
  )

  return result
})

const enabledItems = computed(() => props.items.filter((item) => !item.disabled))
const allEnabledSelected = computed(() => (
  enabledItems.value.length > 0
  && enabledItems.value.every((item) => selectedIds.value.includes(item.id))
))
const someEnabledSelected = computed(() => (
  !allEnabledSelected.value
  && enabledItems.value.some((item) => selectedIds.value.includes(item.id))
))

function resolvedIcon(item: ACloudItem) {
  if (item.icon) return item.icon
  if (item.kind === 'folder') return 'folder'
  if (item.mimeType?.startsWith('image/')) return 'image'
  if (item.mimeType?.startsWith('video/')) return 'movie'
  if (item.mimeType === 'application/pdf') return 'picture_as_pdf'
  return 'description'
}

function kindLabel(item: ACloudItem) {
  if (item.kind === 'folder') return 'Carpeta'
  const subtype = item.mimeType?.split('/').at(-1)
  return subtype ? subtype.replaceAll('-', ' ').toLocaleUpperCase() : 'Archivo'
}

function sizeLabel(item: ACloudItem) {
  if (item.kind === 'folder') {
    return `${new Intl.NumberFormat().format(item.itemCount ?? 0)} elementos`
  }
  if (item.sizeLabel) return item.sizeLabel
  if (item.size == null) return ''
  return `${new Intl.NumberFormat().format(item.size)} B`
}

function isSelected(item: ACloudItem) {
  return selectedIds.value.includes(item.id)
}

function domId(id: AId) {
  return `${typeof id}:${String(id)}`
}

function sameId(left: AId | null, right: AId | null) {
  return left !== null && right !== null && domId(left) === domId(right)
}

function itemDropState(item: ACloudItem): ACloudDropState {
  return sameId(effectiveDropTarget.value?.id ?? null, item.id)
    ? props.dropState === 'idle' ? 'active' : props.dropState
    : 'idle'
}

function itemDropPosition(item: ACloudItem) {
  return sameId(effectiveDropTarget.value?.id ?? null, item.id)
    ? effectiveDropTarget.value?.position
    : undefined
}

function dropTargetFrom(item: ACloudItem, event: DragEvent) {
  const position = cloudDropPosition(
    event,
    event.currentTarget as HTMLElement,
    item.kind === 'folder'
  )
  return {
    id: item.id,
    containerId: position === 'inside' ? item.id : props.sourceContainerId,
    position,
    kind: 'item'
  } satisfies ACloudDropTarget
}

function handleDragStart(item: ACloudItem, event: DragEvent) {
  if (!props.dnd || props.disabled || item.disabled) {
    event.preventDefault()
    return
  }
  const ids = selectedIds.value.includes(item.id) ? selectedIds.value : [item.id]
  transientDraggingIds.value = ids
  const payload = dndApi.beginDrag(event, item.id)
  emit('drag-start', payload, event)
}

function handleDragEnd(event: DragEvent) {
  transientDraggingIds.value = []
  transientDropTarget.value = null
  emit('drag-end', dndApi.endDrag(event), event)
}

function handleDragOver(item: ACloudItem, event: DragEvent) {
  if (props.disabled || item.disabled) return
  const target = dropTargetFrom(item, event)
  if (!dndApi.allowDrop(event, target, itemDropState(item))) return
  if (
    transientDropTarget.value?.position !== target.position
    || !sameId(transientDropTarget.value?.id ?? null, target.id)
  ) {
    transientDropTarget.value = target
    emit('drop-target-change', target, event)
  }
}

function handleDragLeave(event: DragEvent) {
  const current = event.currentTarget as HTMLElement
  if (event.relatedTarget instanceof Node && current.contains(event.relatedTarget)) return
  transientDropTarget.value = null
  emit('drop-target-change', null, event)
}

function handleDrop(item: ACloudItem, event: DragEvent) {
  const target = dropTargetFrom(item, event)
  const payload = dndApi.allowDrop(event, target, itemDropState(item))
  transientDropTarget.value = null
  emit('drop-target-change', null, event)
  if (payload) emit('drop-request', payload, event)
}

function setSelected(item: ACloudItem, selected: boolean) {
  if (!props.selectable || props.disabled || item.disabled) return

  if (props.selectionMode === 'single') {
    selectedIds.value = selected ? [item.id] : []
    return
  }

  const next = new Set(selectedIds.value)
  if (selected) next.add(item.id)
  else next.delete(item.id)
  selectedIds.value = [...next]
}

function setAllSelected(selected: boolean) {
  if (!props.selectable || props.selectionMode !== 'multiple' || props.disabled) return

  const enabledIds = new Set(enabledItems.value.map((item) => item.id))
  selectedIds.value = selected
    ? [...new Set([...selectedIds.value, ...enabledIds])]
    : selectedIds.value.filter((id) => !enabledIds.has(id))
}

function openItem(item: ACloudItem) {
  if (props.disabled || item.disabled) return
  activeId.value = item.id
  emit('open', item)
}

function openMenu(item: ACloudItem, event: Event) {
  event.preventDefault()
  event.stopPropagation()
  if (props.disabled || item.disabled) return
  activeId.value = item.id
  emit('menu', item, event as MouseEvent)
}

function triggerAction(item: ACloudItem, actionId: string, event: Event) {
  event.stopPropagation()
  if (props.disabled || item.disabled) return
  activeId.value = item.id
  emit('action', item, actionId, event)
}

function updateSort(nextSort: ATableSort) {
  sort.value = nextSort
}

function itemFromRow(row: AFileTableRow): ACloudItem {
  return row
}

function itemFromEvent(event: Event) {
  const target = event.target
  if (!(target instanceof Element) || !root.value) return undefined

  const identified = target.closest<HTMLElement>('[data-cloud-id]')
  if (identified?.dataset.cloudId) {
    return props.items.find((item) => domId(item.id) === identified.dataset.cloudId)
  }

  if (props.state !== 'ready' && props.state !== 'idle') return undefined

  const tableRow = target.closest('tbody tr')
  if (!tableRow) return undefined
  const renderedRows = [...root.value.querySelectorAll('tbody tr')]
  const rowIndex = renderedRows.indexOf(tableRow)
  return rowIndex >= 0 ? props.items[rowIndex] : undefined
}

function handleContextMenu(event: MouseEvent) {
  const item = itemFromEvent(event)
  if (item) openMenu(item, event)
}

function handleFocusIn(event: FocusEvent) {
  const item = itemFromEvent(event)
  if (item) activeId.value = item.id
}

async function focusActive() {
  if (activeId.value == null) return

  await nextTick()
  const target = [...(root.value?.querySelectorAll<HTMLElement>('[data-cloud-id]') ?? [])]
    .find((element) => element.dataset.cloudId === domId(activeId.value!))
  target?.focus()
}

onMounted(() => {
  void focusActive()
})

watch(() => props.state, (state, previousState) => {
  if (state === 'ready' && previousState !== 'ready') void focusActive()
})

defineExpose({ focusActive })
</script>

<template>
  <section
    ref="root"
    class="a-file-table"
    :aria-busy="state === 'loading' || undefined"
    @contextmenu="handleContextMenu"
    @focusin="handleFocusIn"
  >
    <ADataTable
      :caption="caption"
      :caption-visible="captionVisible"
      :columns="columns"
      :rows="rows"
      :row-key="(row: AFileTableRow) => row.id"
      :row-label="(row: AFileTableRow) => row.name"
      :selected="selectedIds"
      :sort="sort"
      selection="none"
      row-activatable
      :state="state"
      :disabled="disabled"
      :sticky-header="stickyHeader"
      :mobile-mode="mobileMode"
      :loading-rows="loadingCount"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      empty-icon="folder_open"
      :error-title="errorTitle"
      :error-message="errorDescription"
      :retry-label="retryLabel"
      actions-label="Acciones del elemento"
      @update:sort="updateSort"
      @row-activate="openItem(itemFromRow($event))"
      @retry="emit('retry')"
    >
      <template v-if="selectable" #header-selection>
        <label v-if="selectionMode === 'multiple'" class="a-file-table__select">
          <input
            type="checkbox"
            :checked="allEnabledSelected"
            :indeterminate="someEnabledSelected"
            :disabled="disabled || enabledItems.length === 0"
            aria-label="Seleccionar todos los elementos disponibles"
            @change="setAllSelected(($event.target as HTMLInputElement).checked)"
          >
          <span aria-hidden="true"><AIcon name="check" /></span>
        </label>
      </template>

      <template v-if="selectable" #cell-selection="{ row }">
        <label class="a-file-table__select">
          <input
            :type="selectionMode === 'single' ? 'radio' : 'checkbox'"
            :name="selectionMode === 'single' ? selectionName : undefined"
            :checked="isSelected(itemFromRow(row))"
            :disabled="disabled || itemFromRow(row).disabled"
            :aria-label="`Seleccionar ${itemFromRow(row).name}`"
            @click.stop
            @change="setSelected(itemFromRow(row), ($event.target as HTMLInputElement).checked)"
          >
          <span aria-hidden="true"><AIcon name="check" /></span>
        </label>
      </template>

      <template #cell-name="{ row }">
        <button
          class="a-file-table__name"
          type="button"
          :data-cloud-id="domId(itemFromRow(row).id)"
          :data-drop-position="itemDropPosition(itemFromRow(row))"
          :class="{
            'a-file-table__name--dragging': effectiveDraggingIds.some((id) => sameId(id, itemFromRow(row).id)),
            'a-file-table__name--drop-pending': itemDropState(itemFromRow(row)) === 'pending',
            'a-file-table__name--drop-invalid': itemDropState(itemFromRow(row)) === 'invalid'
          }"
          :draggable="dnd && !disabled && !itemFromRow(row).disabled"
          :disabled="disabled || itemFromRow(row).disabled"
          @click="openItem(itemFromRow(row))"
          @focus="activeId = itemFromRow(row).id"
          @dragstart="handleDragStart(itemFromRow(row), $event)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver(itemFromRow(row), $event)"
          @dragleave="handleDragLeave"
          @drop="handleDrop(itemFromRow(row), $event)"
        >
          <span class="a-file-table__icon" aria-hidden="true">
            <AIcon :name="resolvedIcon(itemFromRow(row))" />
          </span>
          <span class="a-file-table__name-copy">
            <strong>{{ itemFromRow(row).name }}</strong>
            <span v-if="itemFromRow(row).favorite" class="a-file-table__favorite">
              <AIcon name="star" size="small" /> Favorito
            </span>
          </span>
        </button>
      </template>

      <template #cell-kind="{ row }">
        <span class="a-file-table__secondary">{{ kindLabel(itemFromRow(row)) }}</span>
      </template>

      <template #cell-activity="{ row }">
        <span class="a-file-table__secondary">{{ itemFromRow(row).activityLabel || '—' }}</span>
      </template>

      <template #cell-size="{ row }">
        <span class="a-file-table__number">{{ sizeLabel(itemFromRow(row)) || '—' }}</span>
      </template>

      <template #cell-visibility="{ row }">
        <span v-if="itemFromRow(row).visibility" class="a-file-table__visibility">
          <AIcon
            :name="itemFromRow(row).visibility === 'private' ? 'lock' : itemFromRow(row).visibility === 'link' ? 'link' : 'group'"
            size="small"
          />
          {{ visibilityCopy[itemFromRow(row).visibility!] }}
        </span>
        <span v-else class="a-file-table__secondary">—</span>
      </template>

      <template #cell-collaborators="{ row }">
        <AFacepile
          v-if="itemFromRow(row).collaborators?.length"
          :people="itemFromRow(row).collaborators!"
          :max-displayed="3"
          size="medium"
        />
        <span v-else class="a-file-table__secondary">—</span>
      </template>

      <template v-if="showMenu || $slots.actions || $slots['item-menu']" #actions="{ row, disabled: tableDisabled }">
        <slot
          name="actions"
          :item="itemFromRow(row)"
          :disabled="tableDisabled || itemFromRow(row).disabled"
          :open="() => openItem(itemFromRow(row))"
          :menu="(event: Event) => openMenu(itemFromRow(row), event)"
          :action="(actionId: string, event: Event) => triggerAction(itemFromRow(row), actionId, event)"
        >
          <slot
            name="item-menu"
            :item="itemFromRow(row)"
            :disabled="tableDisabled || itemFromRow(row).disabled"
            :open-menu="(event: Event) => openMenu(itemFromRow(row), event)"
          >
            <AIconButton
              v-if="dnd && showMoveAction"
              icon="drive_file_move"
              :label="`Mover ${itemFromRow(row).name}…`"
              size="small"
              :disabled="tableDisabled || itemFromRow(row).disabled"
              @click="emit('move-request', itemFromRow(row), $event)"
            />
            <AIconButton
              v-if="showMenu"
              icon="more_horiz"
              :label="`Acciones para ${itemFromRow(row).name}`"
              size="small"
              :disabled="tableDisabled || itemFromRow(row).disabled"
              @click="openMenu(itemFromRow(row), $event)"
            />
          </slot>
        </slot>
      </template>

      <template v-if="$slots.empty" #empty><slot name="empty" /></template>
      <template v-if="$slots.error" #error><slot name="error" /></template>
    </ADataTable>
  </section>
</template>

<style scoped>
.a-file-table {
  min-width: var(--a-space-0);
}

.a-file-table__select {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  cursor: pointer;
}

.a-file-table__select input {
  position: absolute;
  inset: var(--a-space-0);
  width: 100%;
  height: 100%;
  margin: var(--a-space-0);
  opacity: 0;
  cursor: inherit;
}

.a-file-table__select > span {
  display: grid;
  place-items: center;
  width: var(--a-icon-lg);
  height: var(--a-icon-lg);
  border: var(--a-border-width-strong) solid var(--a-border-strong);
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-raised);
  color: transparent;
}

.a-file-table__select input:checked + span,
.a-file-table__select input:indeterminate + span {
  border-color: var(--a-primary);
  background: var(--a-primary);
  color: var(--a-text-inverse);
}

.a-file-table__select input:indeterminate + span :deep(.a-icon) {
  transform: rotate(90deg);
}

.a-file-table__select:has(input:focus-visible) {
  border-radius: var(--a-radius-xs);
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
  box-shadow: var(--a-shadow-focus);
}

.a-file-table__select:has(input:disabled) {
  cursor: not-allowed;
  opacity: var(--a-opacity-disabled);
}

.a-file-table__name {
  position: relative;
  display: inline-grid;
  grid-template-columns: var(--a-target-min) minmax(0, 1fr);
  align-items: center;
  gap: var(--a-space-2);
  width: 100%;
  min-width: var(--a-space-0);
  min-height: var(--a-target-min);
  border: var(--a-space-0);
  padding: var(--a-space-0);
  background: transparent;
  color: var(--a-text-primary);
  text-align: start;
  cursor: pointer;
}
.a-file-table__name[data-drop-position='before']::before,
.a-file-table__name[data-drop-position='after']::after {
  position: absolute;
  z-index: var(--a-z-sticky);
  inset-inline: var(--a-space-0);
  height: var(--a-border-width-strong);
  border-radius: var(--a-radius-round);
  background: var(--a-primary);
  content: '';
  pointer-events: none;
}
.a-file-table__name[data-drop-position='before']::before { inset-block-start: var(--a-space-0); }
.a-file-table__name[data-drop-position='after']::after { inset-block-end: var(--a-space-0); }
.a-file-table__name[data-drop-position='inside'] {
  border-radius: var(--a-radius-sm);
  box-shadow: var(--a-shadow-focus);
}
.a-file-table__name--dragging { opacity: .58; }
.a-file-table__name--drop-pending { cursor: progress; }
.a-file-table__name--drop-invalid {
  border-radius: var(--a-radius-sm);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-negative) 22%, transparent);
}

.a-file-table__name:focus-visible {
  border-radius: var(--a-radius-xs);
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
}

.a-file-table__name:disabled {
  cursor: not-allowed;
  opacity: var(--a-opacity-disabled);
}

.a-file-table__icon {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-muted);
  color: var(--a-primary);
}

.a-file-table__name-copy {
  display: flex;
  min-width: var(--a-space-0);
  align-items: center;
  gap: var(--a-space-2);
}

.a-file-table__name-copy strong {
  min-width: var(--a-space-0);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a-file-table__favorite,
.a-file-table__visibility {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--a-space-1);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.a-file-table__favorite {
  color: var(--a-warning);
}

.a-file-table__secondary {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}

.a-file-table__number {
  color: var(--a-text-secondary);
  font-family: var(--a-font-mono);
  font-size: var(--a-font-size-xs);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 48rem) {
  .a-file-table__name-copy {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--a-space-1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .a-file-table__select input:indeterminate + span :deep(.a-icon) {
    transform: none;
  }
}
</style>
