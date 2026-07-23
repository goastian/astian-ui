<script setup lang="ts">
withDefaults(defineProps<{ level?: 'l0' | 'l1' | 'l2' | 'l3'; padding?: boolean; interactive?: boolean; glass?: boolean; as?: string }>(), { level: 'l1', padding: true, as: 'section' })
</script>

<template><component :is="as" class="a-surface" :class="[`a-surface--${level}`, { 'a-surface--padded': padding, 'a-surface--interactive': interactive, 'a-surface--glass': glass }]"><slot /></component></template>

<style scoped>
.a-surface { position: relative; border: 1px solid var(--a-border); border-radius: var(--a-radius-md); background: var(--a-bg-surface); }.a-surface--padded { padding: clamp(16px, 2vw, 24px); }.a-surface--l0 { background: transparent; border-color: transparent; }.a-surface--l2 { background: var(--a-bg-raised); box-shadow: var(--a-shadow-1); }.a-surface--l3 { background: var(--a-bg-raised); box-shadow: var(--a-shadow-2); }.a-surface--interactive { transition: transform var(--a-motion-base), border var(--a-motion-base), box-shadow var(--a-motion-base); }.a-surface--interactive:hover { transform: translateY(-3px); border-color: var(--a-border-strong); box-shadow: var(--a-shadow-1); }.a-surface--glass { background: color-mix(in srgb, var(--a-bg-raised) 74%, transparent); backdrop-filter: blur(18px); box-shadow: inset 0 var(--a-border-width) var(--a-glass-highlight), var(--a-shadow-1); }
</style>
