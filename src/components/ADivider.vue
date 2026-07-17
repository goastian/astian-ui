<script setup lang="ts">
withDefaults(defineProps<{ vertical?: boolean; inset?: boolean; strong?: boolean }>(), {})
</script>

<template><q-separator :vertical="vertical" :inset="inset" :class="{ 'a-divider--strong': strong }" /></template>

<style scoped>
.q-separator { background: var(--a-border); }
.a-divider--strong { background: var(--a-border-strong); }
</style>
