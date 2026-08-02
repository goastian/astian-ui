<script setup lang="ts">
import { computed, useId } from 'vue'

import type { AId } from '../types/core'

const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<{
  label: string
  hint?: string
  error?: boolean
  errorMessage?: string
  indeterminate?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  value?: AId
  hideLabel?: boolean
}>(), {
  error: false,
  indeterminate: false,
  disabled: false,
  required: false,
  hideLabel: false
})

const emit = defineEmits<{
  change: [checked: boolean, event: Event]
}>()

const instanceId = useId()
const inputId = `a-checkbox-${instanceId}`
const hintId = `${inputId}-hint`
const errorId = `${inputId}-error`

const describedBy = computed(() => [
  props.hint ? hintId : null,
  props.error && props.errorMessage ? errorId : null
].filter(Boolean).join(' ') || undefined)

function handleChange(event: Event) {
  emit('change', (event.target as HTMLInputElement).checked, event)
}
</script>

<template>
  <div
    class="a-checkbox"
    :class="{
      'a-checkbox--disabled': disabled,
      'a-checkbox--error': error,
      'a-checkbox--label-hidden': hideLabel
    }"
  >
    <label class="a-checkbox__label" :for="inputId">
      <span class="a-checkbox__control">
        <input
          :id="inputId"
          v-model="model"
          class="a-checkbox__native"
          type="checkbox"
          :name="name"
          :value="value"
          :disabled="disabled"
          :required="required"
          :indeterminate="indeterminate"
          :aria-checked="indeterminate ? 'mixed' : model"
          :aria-describedby="describedBy"
          :aria-invalid="error || undefined"
          @change="handleChange"
        >
        <span class="a-checkbox__box" aria-hidden="true" />
      </span>
      <span class="a-checkbox__copy">
        <span class="a-checkbox__text"><slot>{{ label }}</slot></span>
        <span v-if="hint" :id="hintId" class="a-checkbox__hint">{{ hint }}</span>
      </span>
    </label>
    <p
      v-if="error && errorMessage"
      :id="errorId"
      class="a-checkbox__error"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
