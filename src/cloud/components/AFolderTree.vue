<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import type { AId } from '../../types/core'
import { cloudDropPosition, useCloudItemDnd } from '../composables/useCloudItemDnd'
import type {
  ACloudDragPayload,
  ACloudDropEffect,
  ACloudDropState,
  ACloudDropTarget,
  AFolderTreeNode
} from '../types'

interface VisibleNode {
  node: AFolderTreeNode
  level: number
  parentId: AId | null
  position: number
  setSize: number
}

const selectedId = defineModel<AId | null>('selectedId', { default: null })
const expandedIds = defineModel<AId[]>('expandedIds', { default: () => [] })
const activeId = defineModel<AId | null>('activeId', { default: null })

const props = withDefaults(defineProps<{
  nodes: AFolderTreeNode[]
  label?: string
  emptyLabel?: string
  disabled?: boolean
  selectable?: boolean
  dnd?: boolean
  sourceContainerId?: AId | null
  dropTarget?: ACloudDropTarget | null
  dropState?: ACloudDropState
  dropEffect?: ACloudDropEffect
  draggingIds?: readonly AId[]
}>(), {
  label: 'Carpetas',
  emptyLabel: 'No hay carpetas disponibles.',
  disabled: false,
  selectable: true,
  dnd: false,
  sourceContainerId: null,
  dropTarget: null,
  dropState: 'idle',
  dropEffect: 'move',
  draggingIds: () => []
})

const emit = defineEmits<{
  select: [node: AFolderTreeNode]
  toggle: [node: AFolderTreeNode, expanded: boolean]
  loadChildren: [node: AFolderTreeNode]
  focus: [node: AFolderTreeNode]
  'drag-start': [payload: ACloudDragPayload, event: DragEvent]
  'drag-end': [payload: ACloudDragPayload | null, event: DragEvent]
  'drop-request': [payload: ACloudDragPayload, event: DragEvent]
  'drop-target-change': [target: ACloudDropTarget | null, event: DragEvent]
  'move-request': [node: AFolderTreeNode, event: KeyboardEvent]
}>()

const tree = ref<HTMLElement | null>(null)
const transientDropTarget = ref<ACloudDropTarget | null>(null)
const transientDraggingIds = ref<AId[]>([])
const initializedIds = new Set<string>()
let typeahead = ''
let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

const nodeKey = (id: AId) => `${typeof id}:${String(id)}`
const sameId = (left: AId | null, right: AId | null) => {
  if (left === null || right === null) return left === right
  return nodeKey(left) === nodeKey(right)
}
const effectiveDropTarget = computed(() => props.dropTarget ?? transientDropTarget.value)
const effectiveDraggingIds = computed(() =>
  props.draggingIds.length ? [...props.draggingIds] : transientDraggingIds.value
)
const dndApi = useCloudItemDnd({
  sourceIds: () => effectiveDraggingIds.value,
  sourceContainerId: () => props.sourceContainerId,
  effect: () => props.dropEffect
})

const nodeDropState = (node: AFolderTreeNode): ACloudDropState =>
  sameId(effectiveDropTarget.value?.id ?? null, node.id)
    ? props.dropState === 'idle' ? 'active' : props.dropState
    : 'idle'

const nodeDropPosition = (node: AFolderTreeNode) =>
  sameId(effectiveDropTarget.value?.id ?? null, node.id)
    ? effectiveDropTarget.value?.position
    : undefined

const dropTargetFrom = (
  node: AFolderTreeNode,
  parentId: AId | null,
  event: DragEvent
) => {
  const position = cloudDropPosition(event, event.currentTarget as HTMLElement, true)
  return {
    id: node.id,
    containerId: position === 'inside' ? node.id : parentId,
    position,
    kind: 'item'
  } satisfies ACloudDropTarget
}

const handleDragStart = (node: AFolderTreeNode, event: DragEvent) => {
  if (!props.dnd || props.disabled || node.disabled) {
    event.preventDefault()
    return
  }
  const ids = effectiveDraggingIds.value.some((id) => sameId(id, node.id))
    ? effectiveDraggingIds.value
    : [node.id]
  transientDraggingIds.value = ids
  emit('drag-start', dndApi.beginDrag(event, node.id), event)
}

const handleDragEnd = (event: DragEvent) => {
  transientDraggingIds.value = []
  transientDropTarget.value = null
  emit('drag-end', dndApi.endDrag(event), event)
}

const handleDragOver = (node: AFolderTreeNode, parentId: AId | null, event: DragEvent) => {
  if (props.disabled || node.disabled) return
  const target = dropTargetFrom(node, parentId, event)
  if (!dndApi.allowDrop(event, target, nodeDropState(node))) return
  if (
    transientDropTarget.value?.position !== target.position
    || !sameId(transientDropTarget.value?.id ?? null, target.id)
  ) {
    transientDropTarget.value = target
    emit('drop-target-change', target, event)
  }
}

const handleDragLeave = (event: DragEvent) => {
  const current = event.currentTarget as HTMLElement
  if (event.relatedTarget instanceof Node && current.contains(event.relatedTarget)) return
  transientDropTarget.value = null
  emit('drop-target-change', null, event)
}

const handleDrop = (node: AFolderTreeNode, parentId: AId | null, event: DragEvent) => {
  const target = dropTargetFrom(node, parentId, event)
  const payload = dndApi.allowDrop(event, target, nodeDropState(node))
  transientDropTarget.value = null
  emit('drop-target-change', null, event)
  if (payload) emit('drop-request', payload, event)
}

const isExpanded = (node: AFolderTreeNode) =>
  expandedIds.value.some((id) => sameId(id, node.id))

const isBranch = (node: AFolderTreeNode) =>
  node.hasChildren === true || (node.children?.length ?? 0) > 0

const visibleNodes = computed<VisibleNode[]>(() => {
  const result: VisibleNode[] = []

  const visit = (nodes: AFolderTreeNode[], level: number, parentId: AId | null) => {
    nodes.forEach((node, index) => {
      result.push({
        node,
        level,
        parentId,
        position: index + 1,
        setSize: nodes.length
      })

      if (isBranch(node) && isExpanded(node) && node.children?.length) {
        visit(node.children, level + 1, node.id)
      }
    })
  }

  visit(props.nodes, 1, null)
  return result
})

const allNodes = computed(() => {
  const result: AFolderTreeNode[] = []
  const visit = (nodes: AFolderTreeNode[]) => {
    nodes.forEach((node) => {
      result.push(node)
      if (node.children?.length) visit(node.children)
    })
  }
  visit(props.nodes)
  return result
})

const selectedNode = computed(() =>
  allNodes.value.find((node) => sameId(node.id, selectedId.value)) ?? null
)

const visualLevel = (level: number) => Math.min(level, 8)

const focusVisibleNode = async (index: number) => {
  const entry = visibleNodes.value[index]
  if (!entry) return

  activeId.value = entry.node.id
  emit('focus', entry.node)
  await nextTick()

  const items = tree.value?.querySelectorAll<HTMLElement>('[role="treeitem"]')
  items?.item(index).focus({ preventScroll: true })
}

const focusNode = (node: AFolderTreeNode) => {
  const index = visibleNodes.value.findIndex((entry) => sameId(entry.node.id, node.id))
  if (index >= 0) void focusVisibleNode(index)
}

const requestChildren = (node: AFolderTreeNode) => {
  if (
    isBranch(node) &&
    node.children === undefined &&
    node.loading !== true &&
    node.disabled !== true &&
    !props.disabled
  ) {
    emit('loadChildren', node)
  }
}

const setExpanded = (node: AFolderTreeNode, expanded: boolean) => {
  if (!isBranch(node) || node.disabled || props.disabled) return

  const next = expandedIds.value.filter((id) => !sameId(id, node.id))
  if (expanded) next.push(node.id)
  expandedIds.value = next
  emit('toggle', node, expanded)
  if (expanded) requestChildren(node)
}

const toggleNode = (node: AFolderTreeNode) => {
  setExpanded(node, !isExpanded(node))
}

const selectNode = (node: AFolderTreeNode) => {
  if (!props.selectable || props.disabled || node.disabled) return
  selectedId.value = node.id
  emit('select', node)
}

const handleRowClick = (node: AFolderTreeNode) => {
  activeId.value = node.id
  emit('focus', node)
  selectNode(node)
}

const handleDisclosureClick = (node: AFolderTreeNode) => {
  focusNode(node)
  toggleNode(node)
}

const expandSiblingBranches = (entry: VisibleNode) => {
  const siblings = visibleNodes.value.filter(
    (candidate) => sameId(candidate.parentId, entry.parentId) && isBranch(candidate.node)
  )

  siblings.forEach(({ node }) => {
    if (!isExpanded(node) && !node.disabled) setExpanded(node, true)
  })
}

const handleTypeahead = (event: KeyboardEvent, currentIndex: number) => {
  if (
    event.key.length !== 1 ||
    event.key === '*' ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    /\s/.test(event.key)
  ) {
    return false
  }

  typeahead += event.key.toLocaleLowerCase()
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
  typeaheadTimer = setTimeout(() => {
    typeahead = ''
  }, 600)

  const candidates = [
    ...visibleNodes.value.slice(currentIndex + 1),
    ...visibleNodes.value.slice(0, currentIndex + 1)
  ]
  const match = candidates.find(({ node }) =>
    node.label.toLocaleLowerCase().startsWith(typeahead)
  )
  if (match) focusNode(match.node)
  return true
}

const handleKeydown = (event: KeyboardEvent, entry: VisibleNode) => {
  const currentIndex = visibleNodes.value.findIndex(({ node }) => sameId(node.id, entry.node.id))
  if (currentIndex < 0) return

  if (event.altKey && event.key.toLocaleLowerCase() === 'm') {
    event.preventDefault()
    if (!props.disabled && !entry.node.disabled) emit('move-request', entry.node, event)
    return
  }

  if (handleTypeahead(event, currentIndex)) {
    event.preventDefault()
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      void focusVisibleNode(Math.min(currentIndex + 1, visibleNodes.value.length - 1))
      break
    case 'ArrowUp':
      event.preventDefault()
      void focusVisibleNode(Math.max(currentIndex - 1, 0))
      break
    case 'Home':
      event.preventDefault()
      void focusVisibleNode(0)
      break
    case 'End':
      event.preventDefault()
      void focusVisibleNode(visibleNodes.value.length - 1)
      break
    case 'ArrowRight': {
      event.preventDefault()
      if (!isBranch(entry.node)) break
      if (!isExpanded(entry.node)) {
        setExpanded(entry.node, true)
      } else {
        const childIndex = visibleNodes.value.findIndex(
          (candidate) => sameId(candidate.parentId, entry.node.id)
        )
        if (childIndex >= 0) void focusVisibleNode(childIndex)
      }
      break
    }
    case 'ArrowLeft': {
      event.preventDefault()
      if (isBranch(entry.node) && isExpanded(entry.node)) {
        setExpanded(entry.node, false)
      } else if (entry.parentId !== null) {
        const parentIndex = visibleNodes.value.findIndex(
          ({ node }) => sameId(node.id, entry.parentId)
        )
        if (parentIndex >= 0) void focusVisibleNode(parentIndex)
      }
      break
    }
    case '*':
      event.preventDefault()
      expandSiblingBranches(entry)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectNode(entry.node)
      break
  }
}

watch(
  allNodes,
  (nodes) => {
    const nextExpanded = [...expandedIds.value]
    let expandedChanged = false

    nodes.forEach((node) => {
      const key = nodeKey(node.id)
      if (initializedIds.has(key)) return
      initializedIds.add(key)

      if (node.expanded && !nextExpanded.some((id) => sameId(id, node.id))) {
        nextExpanded.push(node.id)
        expandedChanged = true
      }
      if (selectedId.value === null && node.selected) selectedId.value = node.id
    })

    if (expandedChanged) expandedIds.value = nextExpanded
  },
  { immediate: true }
)

watch(
  [visibleNodes, activeId],
  ([nodes]) => {
    if (nodes.length === 0) {
      activeId.value = null
      return
    }

    const activeIsVisible = nodes.some(({ node }) => sameId(node.id, activeId.value))
    if (!activeIsVisible) {
      const selected = nodes.find(({ node }) => sameId(node.id, selectedNode.value?.id ?? null))
      activeId.value = selected?.node.id ?? nodes[0].node.id
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (typeaheadTimer) clearTimeout(typeaheadTimer)
})
</script>

<template>
  <div
    ref="tree"
    class="a-folder-tree"
    :class="{ 'a-folder-tree--disabled': disabled }"
    role="tree"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    :aria-multiselectable="false"
  >
    <div
      v-for="entry in visibleNodes"
      :key="nodeKey(entry.node.id)"
      class="a-folder-tree__item"
      :class="{
        'a-folder-tree__item--selected': sameId(entry.node.id, selectedId),
        'a-folder-tree__item--disabled': entry.node.disabled,
        'a-folder-tree__item--loading': entry.node.loading,
        'a-folder-tree__item--dragging': effectiveDraggingIds.some((id) => sameId(id, entry.node.id)),
        'a-folder-tree__item--drop-pending': nodeDropState(entry.node) === 'pending',
        'a-folder-tree__item--drop-invalid': nodeDropState(entry.node) === 'invalid'
      }"
      role="treeitem"
      :data-tree-level="visualLevel(entry.level)"
      :aria-level="entry.level"
      :aria-posinset="entry.position"
      :aria-setsize="entry.setSize"
      :aria-expanded="isBranch(entry.node) ? isExpanded(entry.node) : undefined"
      :aria-selected="selectable ? sameId(entry.node.id, selectedId) : undefined"
      :aria-disabled="disabled || entry.node.disabled || undefined"
      :aria-busy="entry.node.loading || undefined"
      :aria-invalid="nodeDropState(entry.node) === 'invalid' || undefined"
      aria-keyshortcuts="Alt+M"
      :data-drop-position="nodeDropPosition(entry.node)"
      :draggable="dnd && !disabled && !entry.node.disabled"
      :tabindex="sameId(entry.node.id, activeId) ? 0 : -1"
      @click="handleRowClick(entry.node)"
      @focus="activeId = entry.node.id"
      @keydown="handleKeydown($event, entry)"
      @dragstart="handleDragStart(entry.node, $event)"
      @dragend="handleDragEnd"
      @dragover="handleDragOver(entry.node, entry.parentId, $event)"
      @dragleave="handleDragLeave"
      @drop="handleDrop(entry.node, entry.parentId, $event)"
    >
      <button
        v-if="isBranch(entry.node)"
        class="a-folder-tree__disclosure"
        type="button"
        tabindex="-1"
        :disabled="disabled || entry.node.disabled"
        :aria-label="`${isExpanded(entry.node) ? 'Contraer' : 'Expandir'} ${entry.node.label}`"
        @click.stop="handleDisclosureClick(entry.node)"
      >
        <q-icon
          :name="entry.node.loading ? 'progress_activity' : 'chevron_right'"
          :class="{
            'a-folder-tree__chevron--expanded': isExpanded(entry.node),
            'a-folder-tree__spinner': entry.node.loading
          }"
          aria-hidden="true"
        />
      </button>
      <span v-else class="a-folder-tree__disclosure-placeholder" aria-hidden="true" />

      <q-icon
        v-if="entry.node.icon"
        class="a-folder-tree__icon"
        :name="entry.node.icon"
        aria-hidden="true"
      />
      <q-icon
        v-else
        class="a-folder-tree__icon"
        :name="isExpanded(entry.node) ? 'folder_open' : 'folder'"
        aria-hidden="true"
      />

      <span class="a-folder-tree__label">{{ entry.node.label }}</span>
      <span v-if="entry.node.loading" class="a-folder-tree__loading-label">
        Cargando
      </span>
    </div>

    <p v-if="visibleNodes.length === 0" class="a-folder-tree__empty" role="status">
      {{ emptyLabel }}
    </p>
  </div>
</template>

<style scoped>
.a-folder-tree {
  display: grid;
  gap: var(--a-space-1);
  color: var(--a-text-primary);
}

.a-folder-tree__item {
  position: relative;
  display: grid;
  grid-template-columns: var(--a-target-min) var(--a-icon-md) minmax(0, 1fr) auto;
  align-items: center;
  min-height: var(--a-target-min);
  padding-inline-end: var(--a-space-3);
  border-radius: var(--a-radius-sm);
  outline: none;
  cursor: pointer;
  transition:
    background var(--a-motion-fast),
    color var(--a-motion-fast);
}
.a-folder-tree__item[data-drop-position='before']::before,
.a-folder-tree__item[data-drop-position='after']::after {
  position: absolute;
  z-index: var(--a-z-sticky);
  inset-inline: var(--a-space-2);
  height: var(--a-border-width-strong);
  border-radius: var(--a-radius-round);
  background: var(--a-primary);
  content: '';
  pointer-events: none;
}
.a-folder-tree__item[data-drop-position='before']::before { inset-block-start: calc(var(--a-space-1) * -1); }
.a-folder-tree__item[data-drop-position='after']::after { inset-block-end: calc(var(--a-space-1) * -1); }
.a-folder-tree__item[data-drop-position='inside'] {
  box-shadow: var(--a-shadow-focus);
}
.a-folder-tree__item--dragging { opacity: .58; }
.a-folder-tree__item--drop-pending { cursor: progress; }
.a-folder-tree__item--drop-invalid {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-negative) 22%, transparent);
}

.a-folder-tree__item[data-tree-level='1'] {
  padding-inline-start: var(--a-space-0);
}

.a-folder-tree__item[data-tree-level='2'] {
  padding-inline-start: var(--a-space-5);
}

.a-folder-tree__item[data-tree-level='3'] {
  padding-inline-start: calc(var(--a-space-5) + var(--a-space-5));
}

.a-folder-tree__item[data-tree-level='4'] {
  padding-inline-start: calc(var(--a-space-5) + var(--a-space-5) + var(--a-space-5));
}

.a-folder-tree__item[data-tree-level='5'] {
  padding-inline-start: calc(var(--a-space-10) + var(--a-space-10));
}

.a-folder-tree__item[data-tree-level='6'] {
  padding-inline-start: calc(var(--a-space-10) + var(--a-space-10) + var(--a-space-5));
}

.a-folder-tree__item[data-tree-level='7'] {
  padding-inline-start: calc(var(--a-space-10) + var(--a-space-10) + var(--a-space-10));
}

.a-folder-tree__item[data-tree-level='8'] {
  padding-inline-start: calc(var(--a-space-10) + var(--a-space-10) + var(--a-space-10) + var(--a-space-5));
}

.a-folder-tree__item:hover {
  background: var(--a-bg-hover);
}

.a-folder-tree__item--selected {
  background: var(--a-bg-selected);
  color: var(--a-primary);
}

.a-folder-tree__item:focus-visible {
  box-shadow: var(--a-shadow-focus);
}

.a-folder-tree__disclosure,
.a-folder-tree__disclosure-placeholder {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  min-width: var(--a-target-min);
  height: var(--a-target-min);
}

.a-folder-tree__disclosure {
  border: var(--a-space-0);
  border-radius: var(--a-radius-sm);
  padding: var(--a-space-0);
  background: transparent;
  color: currentColor;
  cursor: pointer;
}

.a-folder-tree__disclosure:disabled {
  cursor: default;
}

.a-folder-tree__disclosure:focus-visible {
  box-shadow: var(--a-shadow-focus);
}

.a-folder-tree__disclosure :deep(.q-icon) {
  transition: transform var(--a-motion-fast);
}

.a-folder-tree__chevron--expanded {
  transform: rotate(90deg);
}

.a-folder-tree__spinner {
  animation: a-folder-tree-spin var(--a-duration-slow) linear infinite;
}

.a-folder-tree__icon {
  color: var(--a-text-secondary);
  font-size: var(--a-icon-md);
}

.a-folder-tree__label {
  min-width: var(--a-space-0);
  overflow: hidden;
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-medium);
  line-height: var(--a-line-height-tight);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a-folder-tree__loading-label {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.a-folder-tree__empty {
  margin: var(--a-space-0);
  padding: var(--a-space-4);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  text-align: center;
}

.a-folder-tree--disabled,
.a-folder-tree__item--disabled {
  opacity: var(--a-opacity-disabled);
}

.a-folder-tree--disabled .a-folder-tree__item,
.a-folder-tree__item--disabled {
  cursor: default;
}

@keyframes a-folder-tree-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .a-folder-tree__item,
  .a-folder-tree__disclosure :deep(.q-icon) {
    transition: none;
  }

  .a-folder-tree__spinner {
    animation: none;
  }
}
</style>
