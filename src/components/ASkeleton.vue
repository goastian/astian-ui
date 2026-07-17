<script setup lang="ts">
withDefaults(defineProps<{ width?: string; height?: string; type?: 'text' | 'rect' | 'circle' | 'QBtn' | 'QAvatar'; animation?: 'wave' | 'pulse' | 'fade' | 'blink' | 'none' }>(), { width: '100%', height: '1rem', type: 'rect', animation: 'wave' })
</script>

<template><q-skeleton :width="width" :height="height" :type="type" :animation="animation" class="a-skeleton" /></template>

<style scoped>.a-skeleton { background: var(--a-bg-muted); border-radius: var(--a-radius-xs); }</style>
