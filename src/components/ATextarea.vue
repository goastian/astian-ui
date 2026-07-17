<script setup lang="ts">
const model = defineModel<string>({ default: '' })
withDefaults(defineProps<{ label?: string; placeholder?: string; hint?: string; error?: boolean; errorMessage?: string; rows?: number; autogrow?: boolean; disabled?: boolean; readonly?: boolean }>(), { rows: 4 })
</script>

<template><q-input v-model="model" outlined type="textarea" :label="label" :placeholder="placeholder" :hint="hint" :error="error" :error-message="errorMessage" :rows="rows" :autogrow="autogrow" :disable="disabled" :readonly="readonly" class="a-textarea" /></template>

<style scoped>
.a-textarea :deep(.q-field__control) { border-radius: var(--a-radius-sm); background: var(--a-bg-raised); color: var(--a-text-primary); }.a-textarea :deep(.q-field__control::before) { border-color: var(--a-border); }.a-textarea :deep(.q-field__native),.a-textarea :deep(.q-field__label) { color: var(--a-text-primary); }.a-textarea.q-field--focused :deep(.q-field__control) { box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-primary) 14%, transparent); }
</style>
