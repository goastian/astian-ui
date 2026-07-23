<script setup lang="ts">
import type { AstianAccent } from '../types/ui'
withDefaults(defineProps<{ label: string; icon?: string; color?: AstianAccent }>(), { color: 'green' })
</script>

<template><span class="a-mono-tag" :class="`a-mono-tag--${color}`"><q-icon v-if="icon" :name="icon" />{{ label }}</span></template>

<style scoped>
.a-mono-tag { display: inline-flex; align-items: center; gap: 5px; border: 1px solid currentColor; border-radius: 6px; padding: 3px 6px; color: var(--a-primary); font: 700 .68rem/1.1 var(--a-font-mono); letter-spacing: .02em; }
.a-mono-tag--orange { color: var(--a-accent); }.a-mono-tag--blue,.a-mono-tag--dark-blue { color: var(--a-info); }.a-mono-tag--red { color: var(--a-negative); }.a-mono-tag--yellow { color: var(--a-warning); }.a-mono-tag--pink { color: var(--a-color-pink); }
</style>
