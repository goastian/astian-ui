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

<style scoped>
.a-checkbox {
  color: var(--a-text-primary);
}

.a-checkbox__label {
  display: grid;
  grid-template-columns: var(--a-target-min) minmax(0, 1fr);
  align-items: center;
  min-height: var(--a-target-min);
  cursor: pointer;
}

.a-checkbox__control {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
}

.a-checkbox__native {
  position: absolute;
  inset: var(--a-space-0);
  z-index: var(--a-z-base);
  width: 100%;
  height: 100%;
  margin: var(--a-space-0);
  cursor: inherit;
  opacity: 0;
}

.a-checkbox__box {
  position: relative;
  width: var(--a-icon-md);
  height: var(--a-icon-md);
  border: var(--a-border-width-strong) solid var(--a-border-strong);
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-raised);
  transition:
    border-color var(--a-motion-fast),
    background var(--a-motion-fast),
    box-shadow var(--a-motion-fast);
}

.a-checkbox__native:checked + .a-checkbox__box,
.a-checkbox__native:indeterminate + .a-checkbox__box {
  border-color: var(--a-primary);
  background: var(--a-primary);
}

.a-checkbox__native:checked + .a-checkbox__box::after {
  position: absolute;
  inset-block-start: 16%;
  inset-inline-start: 34%;
  width: 28%;
  height: 52%;
  border: solid var(--a-text-inverse);
  border-width: var(--a-space-0) var(--a-border-width-strong) var(--a-border-width-strong) var(--a-space-0);
  content: '';
  transform: rotate(45deg);
}

.a-checkbox__native:indeterminate + .a-checkbox__box::after {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 20%;
  width: 60%;
  height: var(--a-border-width-strong);
  background: var(--a-text-inverse);
  content: '';
  transform: translateY(-50%);
}

.a-checkbox__native:focus-visible + .a-checkbox__box {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
}

.a-checkbox__copy {
  display: grid;
  gap: var(--a-space-1);
  padding-block: var(--a-space-2);
}

.a-checkbox__text {
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-medium);
  line-height: var(--a-line-height-body);
}

.a-checkbox__hint {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.a-checkbox__error {
  margin: var(--a-space-1) var(--a-space-0) var(--a-space-0) var(--a-target-min);
  color: var(--a-negative);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.a-checkbox--error .a-checkbox__box {
  border-color: var(--a-negative);
}

.a-checkbox--disabled {
  opacity: var(--a-opacity-disabled);
}

.a-checkbox--disabled .a-checkbox__label {
  cursor: not-allowed;
}

.a-checkbox--label-hidden .a-checkbox__copy {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .a-checkbox__box {
    transition: none;
  }
}
</style>
