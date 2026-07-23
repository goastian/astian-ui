<script setup lang="ts" generic="T extends AId = AId">
import { computed, useId } from 'vue'

import type { ACheckboxOption, AId } from '../types/core'
import ACheckbox from './ACheckbox.vue'

const model = defineModel<T[]>({ default: () => [] })

const props = withDefaults(defineProps<{
  label: string
  options: readonly ACheckboxOption<T>[]
  hint?: string
  error?: boolean
  errorMessage?: string
  disabled?: boolean
  required?: boolean
  name?: string
  orientation?: 'vertical' | 'horizontal'
}>(), {
  error: false,
  disabled: false,
  required: false,
  orientation: 'vertical'
})

const instanceId = useId()
const hintId = `a-checkbox-group-${instanceId}-hint`
const errorId = `a-checkbox-group-${instanceId}-error`

const describedBy = computed(() => [
  props.hint ? hintId : null,
  props.error && props.errorMessage ? errorId : null
].filter(Boolean).join(' ') || undefined)

function isSelected(value: T) {
  return model.value.includes(value)
}

function updateSelection(value: T, checked: boolean) {
  if (props.disabled) return

  if (checked) {
    if (!model.value.includes(value)) model.value = [...model.value, value]
    return
  }

  model.value = model.value.filter((item) => item !== value)
}
</script>

<template>
  <fieldset
    class="a-checkbox-group"
    :class="[
      `a-checkbox-group--${orientation}`,
      {
        'a-checkbox-group--disabled': disabled,
        'a-checkbox-group--error': error
      }
    ]"
    :disabled="disabled"
    :aria-describedby="describedBy"
    :aria-invalid="error || undefined"
    :aria-required="required || undefined"
  >
    <legend class="a-checkbox-group__legend">{{ label }}</legend>
    <p v-if="hint" :id="hintId" class="a-checkbox-group__hint">{{ hint }}</p>

    <div class="a-checkbox-group__options">
      <ACheckbox
        v-for="option in options"
        :key="String(option.value)"
        :model-value="isSelected(option.value)"
        :label="option.label"
        :hint="option.hint"
        :name="name"
        :value="option.value"
        :disabled="disabled || option.disabled"
        @update:model-value="updateSelection(option.value, $event)"
      >
        <slot name="option" :option="option">{{ option.label }}</slot>
      </ACheckbox>
    </div>

    <p
      v-if="error && errorMessage"
      :id="errorId"
      class="a-checkbox-group__error"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </fieldset>
</template>

<style scoped>
.a-checkbox-group {
  min-width: var(--a-space-0);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  border: var(--a-space-0);
  color: var(--a-text-primary);
}

.a-checkbox-group__legend {
  padding: var(--a-space-0);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
  line-height: var(--a-line-height-body);
}

.a-checkbox-group__hint,
.a-checkbox-group__error {
  margin: var(--a-space-1) var(--a-space-0) var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.a-checkbox-group__error {
  margin-block-end: var(--a-space-0);
  color: var(--a-negative);
}

.a-checkbox-group__options {
  display: flex;
  gap: var(--a-space-1) var(--a-space-4);
}

.a-checkbox-group--vertical .a-checkbox-group__options {
  flex-direction: column;
}

.a-checkbox-group--horizontal .a-checkbox-group__options {
  flex-flow: row wrap;
}

.a-checkbox-group--disabled {
  opacity: var(--a-opacity-disabled);
}
</style>
