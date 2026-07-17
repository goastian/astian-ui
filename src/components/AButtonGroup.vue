<script setup lang="ts">
withDefaults(defineProps<{ layout?: 'inline' | 'stacked'; fullWidth?: boolean; align?: 'left' | 'center' | 'right' | 'between' }>(), { layout: 'inline', align: 'right' })
</script>

<template><div class="a-button-group" :class="[`a-button-group--${layout}`, `a-button-group--${align}`, { 'a-button-group--full': fullWidth }]"><slot /></div></template>

<style scoped>
.a-button-group { display: flex; gap: 9px; align-items: center; }.a-button-group--stacked { flex-direction: column; align-items: stretch; }.a-button-group--left { justify-content: flex-start; }.a-button-group--center { justify-content: center; }.a-button-group--right { justify-content: flex-end; }.a-button-group--between { justify-content: space-between; }.a-button-group--full :deep(.a-button) { flex: 1; }
</style>
