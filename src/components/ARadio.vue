<script setup lang="ts" generic="T extends AId = AId">
import { computed, useId } from 'vue'

import type { AId } from '../types/core'

const model = defineModel<T | null>({ required: true })

const props = withDefaults(defineProps<{
  value: T
  label: string
  description?: string
  hint?: string
  error?: boolean
  errorMessage?: string
  name?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  optionIndex?: number
  tabindex?: number
}>(), {
  error: false,
  required: false,
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  change: [value: T, event: Event]
}>()

const instanceId = useId()
const inputId = `a-radio-${instanceId}`
const descriptionId = `${inputId}-description`
const hintId = `${inputId}-hint`
const errorId = `${inputId}-error`

const checked = computed(() => model.value === props.value)
const describedBy = computed(() => [
  props.description ? descriptionId : null,
  props.hint ? hintId : null,
  props.error && props.errorMessage ? errorId : null
].filter(Boolean).join(' ') || undefined)

function select(event: Event) {
  if (props.disabled || props.readonly) {
    event.preventDefault()
    return
  }

  model.value = props.value
  emit('change', props.value, event)
}

function preventReadonly(event: Event) {
  if (props.readonly) event.preventDefault()
}
</script>

<template>
  <div
    class="a-radio"
    :class="{
      'a-radio--checked': checked,
      'a-radio--disabled': disabled,
      'a-radio--readonly': readonly,
      'a-radio--error': error
    }"
  >
    <label class="a-radio__label" :for="inputId">
      <span class="a-radio__control">
        <input
          :id="inputId"
          class="a-radio__native"
          type="radio"
          :name="name"
          :value="value"
          :checked="checked"
          :required="required"
          :disabled="disabled"
          :readonly="readonly || undefined"
          :tabindex="tabindex"
          :data-radio-index="optionIndex"
          :aria-checked="checked"
          :aria-readonly="readonly || undefined"
          :aria-invalid="error || undefined"
          :aria-describedby="describedBy"
          @click="preventReadonly"
          @change="select"
          @keydown.space="preventReadonly"
        >
        <span class="a-radio__circle" aria-hidden="true" />
      </span>
      <span class="a-radio__copy">
        <span class="a-radio__text"><slot>{{ label }}</slot></span>
        <span v-if="description" :id="descriptionId" class="a-radio__description">
          {{ description }}
        </span>
        <span v-if="hint" :id="hintId" class="a-radio__hint">{{ hint }}</span>
      </span>
    </label>
    <p v-if="error && errorMessage" :id="errorId" class="a-radio__error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped>
.a-radio {
  color: var(--a-text-primary);
}

.a-radio__label {
  display: grid;
  grid-template-columns: var(--a-target-min) minmax(0, 1fr);
  align-items: center;
  min-height: var(--a-target-min);
  border-radius: var(--a-radius-sm);
  cursor: pointer;
}

.a-radio__control {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
}

.a-radio__native {
  position: absolute;
  inset: var(--a-space-0);
  width: 100%;
  height: 100%;
  margin: var(--a-space-0);
  cursor: inherit;
  opacity: 0;
}

.a-radio__circle {
  display: grid;
  width: var(--a-icon-md);
  height: var(--a-icon-md);
  place-items: center;
  border: var(--a-border-width-strong) solid var(--a-border-strong);
  border-radius: var(--a-radius-round);
  background: var(--a-bg-raised);
  transition:
    border-color var(--a-motion-fast),
    background var(--a-motion-fast),
    box-shadow var(--a-motion-fast);
}

.a-radio__circle::after {
  width: var(--a-space-2);
  height: var(--a-space-2);
  border-radius: inherit;
  background: var(--a-text-inverse);
  content: '';
  opacity: 0;
  transform: scale(.5);
  transition: opacity var(--a-motion-fast), transform var(--a-motion-fast);
}

.a-radio__native:checked + .a-radio__circle {
  border-color: var(--a-primary);
  background: var(--a-primary);
}

.a-radio__native:checked + .a-radio__circle::after {
  opacity: 1;
  transform: scale(1);
}

.a-radio__label:has(.a-radio__native:focus-visible) {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
  box-shadow: var(--a-shadow-focus);
}

.a-radio__copy {
  display: grid;
  gap: var(--a-space-1);
  min-width: var(--a-space-0);
  padding-block: var(--a-space-2);
}

.a-radio__text {
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-medium);
}

.a-radio__description,
.a-radio__hint,
.a-radio__error {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.a-radio__error {
  margin: var(--a-space-1) var(--a-space-0) var(--a-space-0) var(--a-target-min);
  color: var(--a-negative);
}

.a-radio--disabled,
.a-radio--readonly {
  opacity: var(--a-opacity-disabled);
}

.a-radio--disabled .a-radio__label,
.a-radio--readonly .a-radio__label {
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .a-radio__circle,
  .a-radio__circle::after {
    transition: none;
  }
}
</style>
