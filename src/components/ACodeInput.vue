<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ codeLength: number; type?: 'text' | 'number'; errorMessage?: string; submitting?: boolean; label?: string }>(), { type: 'number', label: 'Código de verificación' })
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ submit: [] }>()
const fields = ref<HTMLInputElement[]>([])

const setField = (element: unknown, index: number) => {
  if (element instanceof HTMLInputElement) fields.value[index] = element
}

const update = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const cleaned = props.type === 'number' ? input.value.replace(/\D/g, '') : input.value
  const chars = model.value.padEnd(props.codeLength, ' ').split('')
  chars[index] = cleaned.slice(-1) || ' '
  model.value = chars.join('').trimEnd()
  if (cleaned && index < props.codeLength - 1) nextTick(() => fields.value[index + 1]?.focus())
}

const keydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace' && !model.value[index] && index > 0) fields.value[index - 1]?.focus()
  if (event.key === 'ArrowLeft' && index > 0) fields.value[index - 1]?.focus()
  if (event.key === 'ArrowRight' && index < props.codeLength - 1) fields.value[index + 1]?.focus()
}

const paste = (event: ClipboardEvent) => {
  event.preventDefault()
  const value = event.clipboardData?.getData('text').slice(0, props.codeLength) ?? ''
  model.value = props.type === 'number' ? value.replace(/\D/g, '') : value
}

watch(model, (value) => { if (value.length === props.codeLength) emit('submit') })
</script>

<template>
  <fieldset class="a-code-input" :aria-invalid="!!errorMessage">
    <legend>{{ label }}</legend>
    <div class="a-code-input__fields" @paste="paste">
      <input v-for="index in codeLength" :key="index" :ref="(element) => setField(element, index - 1)" :value="model[index - 1] || ''" :inputmode="type === 'number' ? 'numeric' : 'text'" maxlength="1" :disabled="submitting" :aria-label="`Carácter ${index} de ${codeLength}`" @input="update($event, index - 1)" @keydown="keydown($event, index - 1)" />
    </div>
    <p v-if="errorMessage" class="a-code-input__error">{{ errorMessage }}</p>
    <q-linear-progress v-if="submitting" indeterminate color="primary" rounded />
  </fieldset>
</template>

<style scoped>
.a-code-input {
  min-width: var(--a-space-0);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  border: var(--a-space-0);
}
.a-code-input legend {
  margin-bottom: var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  font-weight: var(--a-font-weight-semibold);
}
.a-code-input__fields {
  display: flex;
  max-width: 100%;
  flex-wrap: wrap;
  gap: var(--a-space-2);
}
.a-code-input input {
  width: var(--a-target-min);
  height: var(--a-control-lg);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
  font: var(--a-font-weight-bold) var(--a-font-size-lg) var(--a-font-mono);
  text-align: center;
  transition: border var(--a-motion-fast), box-shadow var(--a-motion-fast);
}
.a-code-input input:focus {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
  outline: var(--a-space-0);
}
.a-code-input[aria-invalid="true"] input {
  border-color: var(--a-negative);
}
.a-code-input__error {
  margin: var(--a-space-2) var(--a-space-0) var(--a-space-0);
  color: var(--a-negative);
  font-size: var(--a-font-size-xs);
}
</style>
