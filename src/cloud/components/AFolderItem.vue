<script setup lang="ts">
import AFileItem from './AFileItem.vue'
import type { ACloudFolder } from '../types'

withDefaults(defineProps<{
  folder: ACloudFolder
  selected?: boolean
  disabled?: boolean
  selectable?: boolean
  showMenu?: boolean
}>(), {
  disabled: false,
  selectable: true,
  showMenu: true
})

defineEmits<{
  open: [folder: ACloudFolder]
  select: [folder: ACloudFolder, selected: boolean]
  menu: [folder: ACloudFolder, event: MouseEvent]
  focus: [folder: ACloudFolder]
}>()
</script>

<template>
  <AFileItem
    :item="folder"
    :selected="selected"
    :disabled="disabled"
    :selectable="selectable"
    :show-menu="showMenu"
    @open="$emit('open', folder)"
    @select="(_item, value) => $emit('select', folder, value)"
    @menu="(_item, event) => $emit('menu', folder, event)"
    @focus="$emit('focus', folder)"
  >
    <template v-if="$slots.menu" #menu><slot name="menu" :folder="folder" /></template>
  </AFileItem>
</template>
