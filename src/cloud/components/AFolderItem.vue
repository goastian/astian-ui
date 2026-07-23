<script setup lang="ts">
import AFileItem from './AFileItem.vue'
import type { AId } from '../../types/core'
import type {
  ACloudDragPayload,
  ACloudDropEffect,
  ACloudDropState,
  ACloudDropTarget,
  ACloudFolder
} from '../types'

withDefaults(defineProps<{
  folder: ACloudFolder
  selected?: boolean
  disabled?: boolean
  selectable?: boolean
  showMenu?: boolean
  draggable?: boolean
  dragIds?: readonly AId[]
  sourceContainerId?: AId | null
  dropTarget?: ACloudDropTarget | null
  dropState?: ACloudDropState
  dropEffect?: ACloudDropEffect
  dragging?: boolean
  showMoveAction?: boolean
}>(), {
  disabled: false,
  selectable: true,
  showMenu: true,
  draggable: false,
  dragIds: () => [],
  sourceContainerId: null,
  dropTarget: null,
  dropState: 'idle',
  dropEffect: 'move',
  dragging: false,
  showMoveAction: true
})

defineEmits<{
  open: [folder: ACloudFolder]
  select: [folder: ACloudFolder, selected: boolean, event: MouseEvent]
  menu: [folder: ACloudFolder, event: MouseEvent]
  focus: [folder: ACloudFolder]
  'drag-start': [payload: ACloudDragPayload, event: DragEvent]
  'drag-end': [payload: ACloudDragPayload | null, event: DragEvent]
  'drop-request': [payload: ACloudDragPayload, event: DragEvent]
  'drop-target-change': [target: ACloudDropTarget | null, event: DragEvent]
  'move-request': [folder: ACloudFolder, event: Event]
}>()
</script>

<template>
  <AFileItem
    :item="folder"
    :selected="selected"
    :disabled="disabled"
    :selectable="selectable"
    :show-menu="showMenu"
    :draggable="draggable"
    :drag-ids="dragIds"
    :source-container-id="sourceContainerId"
    :drop-target="dropTarget"
    :drop-state="dropState"
    :drop-effect="dropEffect"
    :dragging="dragging"
    :show-move-action="showMoveAction"
    @open="$emit('open', folder)"
    @select="(_item, value, event) => $emit('select', folder, value, event)"
    @menu="(_item, event) => $emit('menu', folder, event)"
    @focus="$emit('focus', folder)"
    @drag-start="(payload, event) => $emit('drag-start', payload, event)"
    @drag-end="(payload, event) => $emit('drag-end', payload, event)"
    @drop-request="(payload, event) => $emit('drop-request', payload, event)"
    @drop-target-change="(target, event) => $emit('drop-target-change', target, event)"
    @move-request="(_item, event) => $emit('move-request', folder, event)"
  >
    <template v-if="$slots.menu" #menu><slot name="menu" :folder="folder" /></template>
  </AFileItem>
</template>
