<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ shortcut: string; size?: 'xsmall' | 'small' | 'medium' | 'large' }>(), { size: 'medium' })
const keys = computed(() => props.shortcut.split('+').map((key) => key.trim()))
</script>

<template><span class="a-key-sequence" :class="`a-key-sequence--${size}`"><kbd v-for="key in keys" :key="key">{{ key }}</kbd></span></template>

<style scoped>
.a-key-sequence { display: inline-flex; gap: 4px; }.a-key-sequence kbd { min-width: 24px; padding: 4px 6px; border: 1px solid var(--a-border-strong); border-bottom-width: 2px; border-radius: 6px; background: var(--a-bg-raised); color: var(--a-text-secondary); font: 600 .72rem/1 var(--a-font-mono); text-align: center; box-shadow: 0 1px 0 var(--a-border); }
.a-key-sequence--xsmall kbd,.a-key-sequence--small kbd { min-width: 18px; padding: 3px 4px; font-size: .62rem; }.a-key-sequence--large kbd { min-width: 30px; padding: 6px 8px; font-size: .82rem; }
</style>
