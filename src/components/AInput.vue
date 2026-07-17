<script setup lang="ts">
const model = defineModel<string | number | null>({ default: '' })

withDefaults(defineProps<{
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'url' | 'tel'
  icon?: string
  endIcon?: string
  hint?: string
  error?: boolean
  errorMessage?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  ghost?: boolean
  autocomplete?: string
}>(), { type: 'text', size: 'medium' })

defineEmits<{ 'end-click': [] }>()
</script>

<template>
  <q-input
    v-model="model"
    outlined
    :dense="size === 'small'"
    :label="label"
    :placeholder="placeholder"
    :type="type"
    :hint="hint"
    :error="error"
    :error-message="errorMessage"
    :disable="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :autocomplete="autocomplete"
    class="a-input"
    :class="[`a-input--${size}`, { 'a-input--ghost': ghost }]"
  >
    <template v-if="icon" #prepend><q-icon :name="icon" /></template>
    <template v-if="endIcon" #append><q-btn round flat :icon="endIcon" aria-label="Acción del campo" @click="$emit('end-click')" /></template>
    <template v-if="$slots.append" #append><slot name="append" /></template>
  </q-input>
</template>

<style scoped>
.a-input { color: var(--a-text-primary); }
.a-input :deep(.q-field__control) { border-radius: var(--a-radius-sm); background: var(--a-bg-raised); color: var(--a-text-primary); transition: background var(--a-motion-fast), box-shadow var(--a-motion-fast); }
.a-input :deep(.q-field__control::before) { border-color: var(--a-border); }
.a-input:hover :deep(.q-field__control::before) { border-color: var(--a-border-strong); }
.a-input.q-field--focused :deep(.q-field__control) { box-shadow: 0 0 0 3px color-mix(in srgb, var(--a-primary) 14%, transparent); }
.a-input :deep(.q-field__native),.a-input :deep(.q-field__label),.a-input :deep(.q-field__prepend),.a-input :deep(.q-field__append) { color: var(--a-text-primary); }
.a-input :deep(.q-field__label),.a-input :deep(.q-field__bottom) { color: var(--a-text-secondary); }
.a-input--large :deep(.q-field__control) { min-height: 54px; }.a-input--ghost :deep(.q-field__control) { background: transparent; }.a-input--ghost :deep(.q-field__control::before) { border-color: transparent; }
</style>
