<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{
  id?: string
  label?: string
  ariaLabel?: string
  placeholder?: string
  hint?: string
  error?: boolean
  errorMessage?: string
  rows?: number
  autogrow?: boolean
  disabled?: boolean
  readonly?: boolean
  name?: string
  required?: boolean
  autocomplete?: string
  minlength?: number
  maxlength?: number
}>(), { rows: 4 })

const attrs = useAttrs()
const textarea = ref<HTMLTextAreaElement | null>(null)
const instanceId = useId()
const textareaId = computed(() => props.id ?? `a-textarea-${instanceId}`)
const hintId = computed(() => `${textareaId.value}-hint`)
const errorId = computed(() => `${textareaId.value}-error`)
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

const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

function resizeToContent() {
  if (!props.autogrow || !textarea.value) return
  textarea.value.style.height = 'auto'
  textarea.value.style.height = `${textarea.value.scrollHeight}px`
}

watch(model, async () => {
  await nextTick()
  resizeToContent()
})
onMounted(resizeToContent)

defineExpose({
  focus: (options?: FocusOptions) => textarea.value?.focus(options),
  select: () => textarea.value?.select()
})
</script>

<template>
  <div
    class="a-form-field a-textarea"
    :class="[
      attrs.class,
      {
        'a-form-field--error': error,
        'a-form-field--disabled': disabled,
        'a-textarea--autogrow': autogrow
      }
    ]"
    :style="attrs.style"
  >
    <label v-if="label" class="a-form-field__label" :for="textareaId">{{ label }}</label>
    <div class="a-form-field__control a-textarea__control">
      <textarea
        :id="textareaId"
        ref="textarea"
        v-model="model"
        v-bind="forwardedAttrs"
        class="a-form-field__native a-textarea__native"
        :aria-label="ariaLabel"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :readonly="readonly"
        :name="name"
        :required="required"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :maxlength="maxlength"
        :aria-describedby="describedBy"
        :aria-invalid="invalidState"
        @input="resizeToContent"
      />
    </div>
    <p v-if="hint" :id="hintId" class="a-form-field__hint">{{ hint }}</p>
    <p v-if="error && errorMessage" :id="errorId" class="a-form-field__error" role="alert">{{ errorMessage }}</p>
  </div>
</template>
