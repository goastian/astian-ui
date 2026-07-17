<script setup lang="ts">
withDefaults(defineProps<{ label: string; caption?: string; icon?: string; color?: 'primary' | 'destructive'; active?: boolean; disabled?: boolean; shortcut?: string }>(), { color: 'primary' })
defineEmits<{ click: [] }>()
</script>

<template>
  <q-item clickable v-ripple :active="active" :disable="disabled" class="a-dropdown-item" :class="`a-dropdown-item--${color}`" @click="$emit('click')">
    <q-item-section v-if="icon" avatar><q-icon :name="icon" /></q-item-section>
    <q-item-section><q-item-label>{{ label }}</q-item-label><q-item-label v-if="caption" caption>{{ caption }}</q-item-label></q-item-section>
    <q-item-section v-if="shortcut || $slots.side" side><slot name="side"><kbd>{{ shortcut }}</kbd></slot></q-item-section>
  </q-item>
</template>

<style scoped>
.a-dropdown-item { min-height: 40px; margin: 2px 4px; border-radius: 8px; color: var(--a-text-primary); }.a-dropdown-item:hover { background: var(--a-bg-hover); }.a-dropdown-item :deep(.q-item__section--avatar) { min-width: 34px; color: var(--a-text-secondary); }.a-dropdown-item :deep(.q-item__label--caption) { color: var(--a-text-secondary); }.a-dropdown-item--destructive,.a-dropdown-item--destructive :deep(.q-icon) { color: var(--a-negative); }.a-dropdown-item kbd { font: .65rem var(--a-font-mono); color: var(--a-text-tertiary); }
</style>
