<script setup lang="ts">
withDefaults(defineProps<{ title: string; shortcut?: string; placement?: 'top' | 'right' | 'bottom' | 'left'; delay?: number }>(), { placement: 'top', delay: 350 })
</script>

<template>
  <q-tooltip :anchor="placement === 'bottom' ? 'bottom middle' : placement === 'left' ? 'center left' : placement === 'right' ? 'center right' : 'top middle'" :self="placement === 'bottom' ? 'top middle' : placement === 'left' ? 'center right' : placement === 'right' ? 'center left' : 'bottom middle'" :delay="delay" class="a-tooltip">
    <span>{{ title }}</span><kbd v-if="shortcut">{{ shortcut }}</kbd>
  </q-tooltip>
</template>

<style>
.a-tooltip { display: flex; gap: 12px; align-items: center; padding: 7px 9px; border: 1px solid var(--a-border-strong); border-radius: 7px; background: var(--a-text-primary); color: var(--a-bg-raised); box-shadow: var(--a-shadow-1); font-family: var(--a-font-sans); }
.a-tooltip kbd { font-family: var(--a-font-mono); opacity: .7; }
</style>
