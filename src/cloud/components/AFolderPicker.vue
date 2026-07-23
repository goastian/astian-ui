<script setup lang="ts">
import { computed, useId } from 'vue'

import AButton from '../../components/AButton.vue'
import AEmptyState from '../../components/AEmptyState.vue'
import AErrorState from '../../components/AErrorState.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import type { AId, ALoadState } from '../../types/core'
import type { AFolderTreeNode } from '../types'
import AFolderTree from './AFolderTree.vue'

const selectedId = defineModel<AId | null>('selectedId', { default: null })
const expandedIds = defineModel<AId[]>('expandedIds', { default: () => [] })
const activeId = defineModel<AId | null>('activeId', { default: null })

const props = withDefaults(defineProps<{
  nodes: AFolderTreeNode[]
  title?: string
  description?: string
  treeLabel?: string
  state?: ALoadState
  disabled?: boolean
  confirming?: boolean
  retrying?: boolean
  confirmLabel?: string
  cancelLabel?: string
  loadingLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string
  selectedLabel?: string
  noSelectionLabel?: string
}>(), {
  title: 'Seleccionar carpeta',
  description: 'Elige una ubicación de destino.',
  treeLabel: 'Carpetas disponibles',
  state: 'ready',
  disabled: false,
  confirming: false,
  retrying: false,
  confirmLabel: 'Seleccionar',
  cancelLabel: 'Cancelar',
  loadingLabel: 'Cargando carpetas',
  emptyTitle: 'No hay carpetas disponibles',
  emptyDescription: 'No se encontró una ubicación que puedas seleccionar.',
  errorTitle: 'No se pudieron cargar las carpetas',
  errorDescription: 'Reintenta para consultar las ubicaciones disponibles.',
  selectedLabel: 'Ubicación seleccionada',
  noSelectionLabel: 'Ninguna ubicación seleccionada'
})

const emit = defineEmits<{
  select: [node: AFolderTreeNode]
  toggle: [node: AFolderTreeNode, expanded: boolean]
  loadChildren: [node: AFolderTreeNode]
  confirm: [node: AFolderTreeNode]
  cancel: []
  retry: []
}>()

const instanceId = useId()
const titleId = `a-folder-picker-title-${instanceId}`
const descriptionId = `a-folder-picker-description-${instanceId}`
const selectionId = `a-folder-picker-selection-${instanceId}`

const findNode = (nodes: AFolderTreeNode[], id: AId | null): AFolderTreeNode | null => {
  if (id === null) return null

  for (const node of nodes) {
    if (node.id === id) return node
    const child = findNode(node.children ?? [], id)
    if (child) return child
  }
  return null
}

const selectedNode = computed(() => findNode(props.nodes, selectedId.value))
const isLoading = computed(() => props.state === 'loading')
const isError = computed(() => props.state === 'error')
const isEmpty = computed(() =>
  props.state === 'empty' || (!isLoading.value && !isError.value && props.nodes.length === 0)
)
const canConfirm = computed(() =>
  Boolean(
    selectedNode.value &&
    !selectedNode.value.disabled &&
    !props.disabled &&
    !props.confirming &&
    !isLoading.value &&
    !isError.value &&
    !isEmpty.value
  )
)

const handleSelect = (node: AFolderTreeNode) => {
  emit('select', node)
}

const handleConfirm = () => {
  if (selectedNode.value && canConfirm.value) emit('confirm', selectedNode.value)
}
</script>

<template>
  <section
    class="a-folder-picker"
    :class="{ 'a-folder-picker--disabled': disabled }"
    :aria-labelledby="$slots.header ? undefined : titleId"
    :aria-describedby="description && !$slots.header ? descriptionId : undefined"
    :aria-label="$slots.header ? title : undefined"
    :aria-busy="isLoading || confirming || undefined"
    :aria-disabled="disabled || undefined"
    :inert="disabled ? true : undefined"
  >
    <header class="a-folder-picker__header">
      <slot name="header" :title-id="titleId" :description-id="descriptionId">
        <div class="a-folder-picker__copy">
          <h2 :id="titleId" class="a-folder-picker__title">{{ title }}</h2>
          <p v-if="description" :id="descriptionId" class="a-folder-picker__description">
            {{ description }}
          </p>
        </div>
      </slot>
    </header>

    <div class="a-folder-picker__body">
      <div
        v-if="isLoading"
        class="a-folder-picker__loading"
        role="status"
        aria-live="polite"
      >
        <span class="a-folder-picker__sr-only">{{ loadingLabel }}</span>
        <div
          v-for="index in 5"
          :key="index"
          class="a-folder-picker__loading-row"
          aria-hidden="true"
        >
          <ASkeleton type="circle" width="var(--a-icon-md)" height="var(--a-icon-md)" />
          <ASkeleton
            type="text"
            :width="index % 2 === 0 ? '58%' : '76%'"
            height="var(--a-space-4)"
          />
        </div>
      </div>

      <AErrorState
        v-else-if="isError"
        compact
        :title="errorTitle"
        :description="errorDescription"
        :retry-label="'Reintentar'"
        :retrying="retrying"
        :disabled="disabled"
        @retry="emit('retry')"
      />

      <AEmptyState
        v-else-if="isEmpty"
        compact
        icon="folder_off"
        :title="emptyTitle"
        :description="emptyDescription"
        :disabled="disabled"
        announce="polite"
      >
        <template v-if="$slots.emptyAction" #primary="{ disabled: actionDisabled }">
          <slot name="emptyAction" :disabled="actionDisabled" />
        </template>
      </AEmptyState>

      <AFolderTree
        v-else
        v-model:selected-id="selectedId"
        v-model:expanded-ids="expandedIds"
        v-model:active-id="activeId"
        :nodes="nodes"
        :label="treeLabel"
        :disabled="disabled || confirming"
        @select="handleSelect"
        @toggle="(node, expanded) => emit('toggle', node, expanded)"
        @load-children="(node) => emit('loadChildren', node)"
      />
    </div>

    <p
      :id="selectionId"
      class="a-folder-picker__selection"
      aria-live="polite"
      aria-atomic="true"
    >
      <span class="a-folder-picker__selection-label">{{ selectedLabel }}:</span>
      {{ selectedNode?.label ?? noSelectionLabel }}
    </p>

    <footer class="a-folder-picker__footer">
      <slot
        name="footer"
        :selected="selectedNode"
        :confirm="handleConfirm"
        :disabled="disabled || confirming"
      >
        <AButton
          type="secondary"
          :label="cancelLabel"
          :disabled="disabled || confirming"
          @click="emit('cancel')"
        />
        <AButton
          :label="confirmLabel"
          :loading="confirming"
          :disabled="!canConfirm"
          :aria-describedby="selectionId"
          @click="handleConfirm"
        />
      </slot>
    </footer>
  </section>
</template>

<style scoped>
.a-folder-picker {
  display: grid;
  min-width: var(--a-space-0);
  overflow: hidden;
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-lg);
  background: var(--a-bg-surface);
  color: var(--a-text-primary);
  box-shadow: var(--a-shadow-2);
}

.a-folder-picker__header,
.a-folder-picker__body,
.a-folder-picker__selection,
.a-folder-picker__footer {
  padding-inline: var(--a-space-5);
}

.a-folder-picker__header {
  padding-block: var(--a-space-5) var(--a-space-3);
}

.a-folder-picker__copy {
  display: grid;
  gap: var(--a-space-1);
}

.a-folder-picker__title,
.a-folder-picker__description,
.a-folder-picker__selection {
  margin: var(--a-space-0);
}

.a-folder-picker__title {
  font-size: var(--a-font-size-lg);
  font-weight: var(--a-font-weight-semibold);
  line-height: var(--a-line-height-tight);
}

.a-folder-picker__description {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
}

.a-folder-picker__body {
  min-height: var(--a-layout-preview-min);
  max-height: var(--a-layout-drawer);
  overflow: auto;
  padding-block: var(--a-space-2);
  scrollbar-gutter: stable;
}

.a-folder-picker__loading {
  display: grid;
  gap: var(--a-space-1);
}

.a-folder-picker__loading-row {
  display: grid;
  grid-template-columns: var(--a-target-min) minmax(0, 1fr);
  align-items: center;
  min-height: var(--a-target-min);
  padding-inline: var(--a-space-2);
}

.a-folder-picker__selection {
  padding-block: var(--a-space-3);
  border-block-start: var(--a-border-width) solid var(--a-border);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
}

.a-folder-picker__selection-label {
  color: var(--a-text-primary);
  font-weight: var(--a-font-weight-semibold);
}

.a-folder-picker__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--a-space-2);
  padding-block: var(--a-space-3) var(--a-space-5);
}

.a-folder-picker--disabled {
  opacity: var(--a-opacity-disabled);
}

.a-folder-picker__sr-only {
  position: absolute;
  width: var(--a-space-1);
  height: var(--a-space-1);
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 30rem) {
  .a-folder-picker {
    border-inline: var(--a-space-0);
    border-radius: var(--a-radius-md);
  }

  .a-folder-picker__header,
  .a-folder-picker__body,
  .a-folder-picker__selection,
  .a-folder-picker__footer {
    padding-inline: var(--a-space-4);
  }

  .a-folder-picker__footer :deep(*) {
    flex: 1 1 auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .a-folder-picker {
    scroll-behavior: auto;
  }
}
</style>
