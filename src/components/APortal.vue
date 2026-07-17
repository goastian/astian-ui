<script setup lang="ts">
withDefaults(defineProps<{ to?: string; disabled?: boolean }>(), { to: 'body' })
</script>

<template><Teleport :to="to" :disabled="disabled"><slot /></Teleport></template>
