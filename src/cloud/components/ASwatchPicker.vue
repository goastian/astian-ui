<script setup lang="ts">
import { computed, useId } from 'vue'

import AIcon from '../../components/AIcon.vue'
import type { AId } from '../../types/core'
import type { AColorSwatch } from '../types'

const model = defineModel<AId | null>({ default: null })

const props = withDefaults(defineProps<{
  swatches: AColorSwatch[]
  label: string
  hint?: string
  error?: string
  disabled?: boolean
  columns?: number
}>(), {
  disabled: false,
  columns: 6
})

const groupId = useId()
const safeColumns = computed(() => Math.max(2, Math.min(10, props.columns)))
const swatchStyle = (token: string) => ({
  '--a-swatch-color': /^--a-[a-z0-9-]+$/i.test(token) ? `var(${token})` : 'var(--a-primary)'
})
</script>

<template>
  <fieldset
    class="a-swatch-picker"
    :class="{ 'a-swatch-picker--error': error }"
    :disabled="disabled"
    :aria-describedby="hint || error ? `${groupId}-message` : undefined"
    :aria-invalid="error ? 'true' : undefined"
  >
    <legend>{{ label }}</legend>
    <div class="a-swatch-picker__grid" :style="{ '--a-swatch-columns': safeColumns }">
      <label
        v-for="swatch in swatches"
        :key="swatch.id"
        class="a-swatch-picker__option"
        :class="{ 'a-swatch-picker__option--selected': model === swatch.id }"
        :style="swatchStyle(swatch.token)"
      >
        <input
          v-model="model"
          type="radio"
          :name="groupId"
          :value="swatch.id"
          :disabled="disabled || swatch.disabled"
        >
        <span class="a-swatch-picker__color" aria-hidden="true">
          <AIcon v-if="model === swatch.id" name="check" />
        </span>
        <span class="a-swatch-picker__label">{{ swatch.label }}</span>
        <span v-if="swatch.description" class="a-visually-hidden">{{ swatch.description }}</span>
      </label>
    </div>
    <p v-if="error || hint" :id="`${groupId}-message`" class="a-swatch-picker__message" :role="error ? 'alert' : undefined">
      {{ error || hint }}
    </p>
  </fieldset>
</template>

<style scoped>
.a-swatch-picker {
  min-width: 0;
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  border: 0;
  color: var(--a-text-primary);
}
.a-swatch-picker legend {
  margin-bottom: var(--a-space-3);
  font-weight: var(--a-font-weight-semibold);
}
.a-swatch-picker__grid {
  display: grid;
  grid-template-columns: repeat(var(--a-swatch-columns), minmax(var(--a-target-min), 1fr));
  gap: var(--a-space-2);
}
.a-swatch-picker__option {
  position: relative;
  display: grid;
  gap: var(--a-space-1);
  justify-items: center;
  min-width: var(--a-target-min);
  min-height: var(--a-control-lg);
  padding: var(--a-space-1);
  border: var(--a-border-width-strong) solid transparent;
  border-radius: var(--a-radius-sm);
  cursor: pointer;
}
.a-swatch-picker__option:hover { background: var(--a-bg-hover); }
.a-swatch-picker__option--selected { border-color: var(--a-focus-ring); }
.a-swatch-picker__option:has(input:focus-visible) {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
  box-shadow: var(--a-shadow-focus);
}
.a-swatch-picker__option:has(input:disabled) {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}
.a-swatch-picker__option input {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  opacity: 0;
}
.a-swatch-picker__color {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border: var(--a-border-width-strong) solid var(--a-border-strong);
  border-radius: var(--a-radius-round);
  background: var(--a-swatch-color);
  color: var(--a-text-inverse);
  text-shadow: var(--a-shadow-1);
}
.a-swatch-picker__label {
  max-width: 100%;
  overflow: hidden;
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.a-swatch-picker__message {
  margin: var(--a-space-2) var(--a-space-0) var(--a-space-0);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}
.a-swatch-picker--error .a-swatch-picker__message { color: var(--a-negative); }
@media (max-width: 26rem) {
  .a-swatch-picker__grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
