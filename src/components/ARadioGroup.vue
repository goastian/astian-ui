<script setup lang="ts" generic="T extends AId = AId">
import { computed, nextTick, ref, useId } from 'vue'

import type { AId, ARadioOption } from '../types/core'
import ARadio from './ARadio.vue'

const model = defineModel<T | null>({ required: true })

const props = withDefaults(defineProps<{
  label: string
  options: readonly ARadioOption<T>[]
  name?: string
  hint?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  orientation?: 'vertical' | 'horizontal'
}>(), {
  error: false,
  required: false,
  disabled: false,
  readonly: false,
  orientation: 'vertical'
})

const emit = defineEmits<{
  change: [value: T, event: Event]
}>()

const instanceId = useId()
const groupName = computed(() => props.name || `a-radio-group-${instanceId}`)
const hintId = `a-radio-group-${instanceId}-hint`
const errorId = `a-radio-group-${instanceId}-error`
const root = ref<HTMLFieldSetElement | null>(null)

const describedBy = computed(() => [
  props.hint ? hintId : null,
  props.error && props.errorMessage ? errorId : null
].filter(Boolean).join(' ') || undefined)

const enabledIndexes = computed(() => props.options
  .map((option, index) => ({ option, index }))
  .filter(({ option }) => !option.disabled)
  .map(({ index }) => index))

const tabbableIndex = computed(() => {
  const selectedIndex = props.options.findIndex((option) => option.value === model.value && !option.disabled)
  return selectedIndex >= 0 ? selectedIndex : (enabledIndexes.value[0] ?? -1)
})

function select(value: T, event: Event) {
  if (props.disabled || props.readonly) return
  model.value = value
  emit('change', value, event)
}

async function focusOption(index: number) {
  await nextTick()
  root.value
    ?.querySelector<HTMLInputElement>(`input[data-radio-index="${index}"]`)
    ?.focus({ preventScroll: true })
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled || props.readonly || enabledIndexes.value.length === 0) return

  const target = event.target
  if (!(target instanceof HTMLInputElement) || target.type !== 'radio') return

  const currentIndex = Number(target.dataset.radioIndex)
  const currentPosition = enabledIndexes.value.indexOf(currentIndex)
  let nextIndex: number | undefined

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      nextIndex = enabledIndexes.value[(currentPosition + 1) % enabledIndexes.value.length]
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      nextIndex = enabledIndexes.value[
        (currentPosition - 1 + enabledIndexes.value.length) % enabledIndexes.value.length
      ]
      break
    case 'Home':
      nextIndex = enabledIndexes.value[0]
      break
    case 'End':
      nextIndex = enabledIndexes.value.at(-1)
      break
    default:
      return
  }

  if (nextIndex === undefined) return
  event.preventDefault()
  const option = props.options[nextIndex]
  model.value = option.value
  emit('change', option.value, event)
  void focusOption(nextIndex)
}
</script>

<template>
  <fieldset
    ref="root"
    class="a-radio-group"
    :class="[
      `a-radio-group--${orientation}`,
      {
        'a-radio-group--disabled': disabled,
        'a-radio-group--readonly': readonly,
        'a-radio-group--error': error
      }
    ]"
    :disabled="disabled"
    :aria-describedby="describedBy"
    :aria-invalid="error || undefined"
    :aria-required="required || undefined"
    :aria-readonly="readonly || undefined"
    @keydown="handleKeydown"
  >
    <legend class="a-radio-group__legend">{{ label }}</legend>
    <p v-if="hint" :id="hintId" class="a-radio-group__hint">{{ hint }}</p>

    <div class="a-radio-group__options">
      <ARadio
        v-for="(option, index) in options"
        :key="`${typeof option.value}:${String(option.value)}`"
        :model-value="model"
        :value="option.value"
        :label="option.label"
        :description="option.description"
        :name="groupName"
        :required="required"
        :disabled="disabled || option.disabled"
        :readonly="readonly"
        :option-index="index"
        :tabindex="index === tabbableIndex ? 0 : -1"
        @update:model-value="model = $event"
        @change="select"
      >
        <slot name="option" :option="option">{{ option.label }}</slot>
      </ARadio>
    </div>

    <p
      v-if="error && errorMessage"
      :id="errorId"
      class="a-radio-group__error"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </fieldset>
</template>

<style scoped>
.a-radio-group {
  min-width: var(--a-space-0);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  border: var(--a-space-0);
  color: var(--a-text-primary);
}

.a-radio-group__legend {
  padding: var(--a-space-0);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
  line-height: var(--a-line-height-body);
}

.a-radio-group__hint,
.a-radio-group__error {
  margin: var(--a-space-1) var(--a-space-0) var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.a-radio-group__error {
  margin-block-end: var(--a-space-0);
  color: var(--a-negative);
}

.a-radio-group__options {
  display: flex;
  gap: var(--a-space-1) var(--a-space-4);
}

.a-radio-group--vertical .a-radio-group__options {
  flex-direction: column;
}

.a-radio-group--horizontal .a-radio-group__options {
  flex-flow: row wrap;
}

</style>
