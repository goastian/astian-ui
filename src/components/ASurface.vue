<script setup lang="ts">
withDefaults(defineProps<{ level?: 'l0' | 'l1' | 'l2' | 'l3'; padding?: boolean; interactive?: boolean; glass?: boolean; as?: string }>(), { level: 'l1', padding: true, as: 'section' })
</script>

<template><component :is="as" class="a-surface" :class="[`a-surface--${level}`, { 'a-surface--padded': padding, 'a-surface--interactive': interactive, 'a-surface--glass': glass }]"><slot /></component></template>

<style scoped>
.a-surface { position: relative; border: var(--a-border-width) solid var(--a-border); border-radius: var(--a-radius-md); background: var(--a-bg-surface); }.a-surface--padded { padding: clamp(var(--a-space-4), 2vw, var(--a-space-6)); }.a-surface--l0 { background: transparent; border-color: transparent; }.a-surface--l2 { background: var(--a-bg-raised); box-shadow: var(--a-shadow-1); }.a-surface--l3 { background: var(--a-bg-raised); box-shadow: var(--a-shadow-2); }.a-surface--interactive { transition: border-color var(--a-motion-base), background var(--a-motion-base); }.a-surface--interactive:hover { border-color: var(--a-border-strong); background: var(--a-bg-muted); }.a-surface--glass { background: color-mix(in oklch, var(--a-bg-raised) 74%, transparent); backdrop-filter: blur(18px); box-shadow: inset 0 var(--a-border-width) var(--a-glass-highlight), var(--a-shadow-1); }
</style>
