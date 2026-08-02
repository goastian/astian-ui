<script setup lang="ts">
import { computed, ref, useAttrs, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel<string | number | null>({ default: '' })

const props = withDefaults(defineProps<{
  id?: string
  label?: string
  ariaLabel?: string
  placeholder?: string
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'url' | 'tel' | 'date' | 'datetime-local'
  icon?: string
  endIcon?: string
  endActionLabel?: string
  clearLabel?: string
  hint?: string
  error?: boolean
  errorMessage?: string
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  ghost?: boolean
  autocomplete?: string
  name?: string
  required?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
}>(), {
  type: 'text',
  size: 'medium',
  endActionLabel: 'Acción del campo',
  clearLabel: 'Limpiar campo'
})

const emit = defineEmits<{
  'end-click': []
  clear: []
}>()

const attrs = useAttrs()
const input = ref<HTMLInputElement | null>(null)
const instanceId = useId()
const inputId = computed(() => props.id ?? `a-input-${instanceId}`)
const hintId = computed(() => `${inputId.value}-hint`)
const errorId = computed(() => `${inputId.value}-error`)
const describedBy = computed(() => [
  typeof attrs['aria-describedby'] === 'string' ? attrs['aria-describedby'] : null,
  props.hint ? hintId.value : null,
  props.error && props.errorMessage ? errorId.value : null
].filter(Boolean).join(' ') || undefined)
const invalidState = computed<boolean | 'true' | 'false' | 'grammar' | 'spelling' | undefined>(() => {
  if (props.error) return true
  const value = attrs['aria-invalid']
  return value === true || value === 'true' || value === 'false' || value === 'grammar' || value === 'spelling'
    ? value
    : undefined
})
const hasValue = computed(() => model.value !== '' && model.value !== null && model.value !== undefined)

const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

function clearValue() {
  if (props.disabled || props.readonly) return
  model.value = null
  emit('clear')
  input.value?.focus()
}

defineExpose({
  focus: (options?: FocusOptions) => input.value?.focus(options),
  select: () => input.value?.select()
})
</script>

<template>
  <div
    class="a-form-field a-input"
    :class="[
      `a-form-field--${size}`,
      attrs.class,
      {
        'a-form-field--error': error,
        'a-form-field--disabled': disabled,
        'a-form-field--ghost': ghost
      }
    ]"
    :style="attrs.style"
  >
    <label v-if="label" class="a-form-field__label" :for="inputId">{{ label }}</label>
    <div class="a-form-field__control">
      <span v-if="$slots.prepend || icon" class="a-form-field__prefix" aria-hidden="true">
        <slot name="prepend"><span class="material-icons-round">{{ icon }}</span></slot>
      </span>
      <input
        :id="inputId"
        ref="input"
        v-model="model"
        v-bind="forwardedAttrs"
        class="a-form-field__native"
        :type="type"
        :aria-label="ariaLabel"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :name="name"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :aria-describedby="describedBy"
        :aria-invalid="invalidState"
      >
      <button
        v-if="clearable && hasValue"
        class="a-form-field__action"
        type="button"
        :aria-label="clearLabel"
        :disabled="disabled || readonly"
        @click="clearValue"
      >
        <span class="a-form-field__clear-icon" aria-hidden="true" />
      </button>
      <button
        v-if="$slots['end-icon'] || endIcon"
        class="a-form-field__action"
        type="button"
        :aria-label="endActionLabel"
        :disabled="disabled"
        @click="emit('end-click')"
      >
        <slot name="end-icon"><span class="material-icons-round" aria-hidden="true">{{ endIcon }}</span></slot>
      </button>
      <span v-if="$slots.append" class="a-form-field__suffix"><slot name="append" /></span>
    </div>
    <p v-if="hint" :id="hintId" class="a-form-field__hint">{{ hint }}</p>
    <p v-if="error && errorMessage" :id="errorId" class="a-form-field__error" role="alert">{{ errorMessage }}</p>
  </div>
</template>
