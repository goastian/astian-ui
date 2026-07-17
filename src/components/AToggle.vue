<script setup lang="ts">
const model = defineModel<boolean>({ required: true })
withDefaults(defineProps<{ label?: string; size?: 'small' | 'medium'; disabled?: boolean; leftLabel?: boolean }>(), { size: 'medium' })
</script>

<template><q-toggle v-model="model" :label="label" :disable="disabled" :left-label="leftLabel" :size="size === 'small' ? '32px' : '40px'" color="primary" class="a-toggle" /></template>

<style scoped>.a-toggle { color: var(--a-text-primary); font-weight: 550; }</style>
