<script setup lang="ts">
import type { AstianAccent } from '../types/ui'
export interface BannerAction { label: string; action: () => void }
withDefaults(defineProps<{ label: string; color?: AstianAccent; icon?: string; actions?: BannerAction[]; closable?: boolean }>(), { color: 'blue' })
defineEmits<{ close: [] }>()
</script>

<template>
  <aside class="a-banner" :class="`a-banner--${color}`" role="status">
    <div class="a-banner__message"><span v-if="icon" class="a-banner__icon"><q-icon :name="icon" /></span><span>{{ label }}</span></div>
    <div class="a-banner__actions"><button v-for="action in actions" :key="action.label" type="button" @click="action.action">{{ action.label }}</button><button v-if="closable" type="button" aria-label="Cerrar aviso" @click="$emit('close')"><q-icon name="close" /></button></div>
  </aside>
</template>

<style scoped>
.a-banner { --banner-color: var(--a-info); display: flex; align-items: center; justify-content: space-between; gap: var(--a-space-4); min-height: var(--a-target-min); padding: var(--a-space-2) var(--a-space-3); background: color-mix(in srgb, var(--banner-color) 16%, var(--a-bg-surface)); color: var(--a-text-primary); border-bottom: var(--a-border-width) solid color-mix(in srgb, var(--banner-color) 44%, transparent); font-size: var(--a-font-size-sm); }
.a-banner--green { --banner-color: var(--a-positive); }.a-banner--orange { --banner-color: var(--a-accent); }.a-banner--red { --banner-color: var(--a-negative); }.a-banner--yellow { --banner-color: var(--a-warning); }.a-banner--pink { --banner-color: var(--a-color-pink); }
.a-banner__message,.a-banner__actions { display: flex; align-items: center; gap: 10px; }.a-banner__icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: color-mix(in srgb, var(--banner-color) 18%, transparent); color: var(--banner-color); }
.a-banner button { appearance: none; min-width: var(--a-target-min); min-height: var(--a-target-min); border: 0; border-radius: var(--a-radius-xs); padding: var(--a-space-2); background: transparent; color: var(--a-text-secondary); font-weight: 650; cursor: pointer; }.a-banner button:hover { background: color-mix(in srgb, var(--banner-color) 12%, transparent); color: var(--a-text-primary); }
</style>
