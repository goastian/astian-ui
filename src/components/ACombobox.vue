<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import type {
  AComboboxLoader,
  AComboboxOption,
  AId
} from '../types/core'

const props = withDefaults(defineProps<{
  options?: AComboboxOption[]
  loadOptions?: AComboboxLoader
  label: string
  placeholder?: string
  hint?: string
  errorMessage?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  required?: boolean
  debounceMs?: number
  minQueryLength?: number
  loadingLabel?: string
  emptyLabel?: string
  loadErrorLabel?: string
}>(), {
  options: () => [],
  placeholder: '',
  hint: '',
  errorMessage: '',
  debounceMs: 250,
  minQueryLength: 0,
  loadingLabel: 'Buscando opciones',
  emptyLabel: 'No hay opciones disponibles',
  loadErrorLabel: 'No se pudieron cargar las opciones'
})

const emit = defineEmits<{
  select: [option: AComboboxOption]
  clear: []
  'query-change': [query: string]
  'load-error': [error: unknown]
}>()

const model = defineModel<AId | null>({ default: null })

const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const query = ref('')
const open = ref(false)
const loading = ref(false)
const loadError = ref('')
const results = ref<AComboboxOption[]>([])
const activeIndex = ref(-1)
const inputId = `a-combobox-${useId()}`
const listboxId = `${inputId}-listbox`
const hintId = `${inputId}-hint`
const errorId = `${inputId}-error`
let debounceTimer: ReturnType<typeof setTimeout> | undefined
let requestController: AbortController | undefined
let syncingSelection = false

const enabledIndexes = computed(() =>
  results.value.reduce<number[]>((indexes, option, index) => {
    if (!option.disabled) indexes.push(index)
    return indexes
  }, [])
)

const activeOptionId = computed(() =>
  open.value && activeIndex.value >= 0
    ? `${listboxId}-option-${activeIndex.value}`
    : undefined
)

const descriptionIds = computed(() => {
  const ids: string[] = []
  if (props.hint) ids.push(hintId)
  if (props.errorMessage) ids.push(errorId)
  return ids.join(' ') || undefined
})

const selectedOption = computed(() => {
  if (model.value === null) return undefined
  return [...results.value, ...props.options].find((option) => option.id === model.value)
})

const locallyFilteredOptions = (value: string) => {
  const normalized = value.trim().toLocaleLowerCase()
  if (!normalized) return [...props.options]
  return props.options.filter((option) =>
    `${option.label} ${option.description ?? ''}`.toLocaleLowerCase().includes(normalized)
  )
}

const firstEnabledIndex = () => enabledIndexes.value[0] ?? -1

const ensureActiveOption = () => {
  if (!enabledIndexes.value.includes(activeIndex.value)) {
    activeIndex.value = firstEnabledIndex()
  }
}

const refreshOptions = async (value: string) => {
  requestController?.abort()
  requestController = new AbortController()
  const { signal } = requestController
  loadError.value = ''

  if (value.trim().length < props.minQueryLength) {
    results.value = []
    activeIndex.value = -1
    loading.value = false
    return
  }

  if (!props.loadOptions) {
    loading.value = false
    results.value = locallyFilteredOptions(value)
    ensureActiveOption()
    return
  }

  loading.value = true
  activeIndex.value = -1
  try {
    const loaded = await props.loadOptions(value, { signal })
    if (signal.aborted) return
    results.value = loaded
    ensureActiveOption()
  } catch (error) {
    if (signal.aborted) return
    results.value = []
    activeIndex.value = -1
    loadError.value = props.loadErrorLabel
    emit('load-error', error)
  } finally {
    if (!signal.aborted) loading.value = false
  }
}

const scheduleRefresh = (value: string, immediate = false) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (immediate || !props.loadOptions || props.debounceMs === 0) {
    void refreshOptions(value)
    return
  }
  debounceTimer = setTimeout(() => void refreshOptions(value), props.debounceMs)
}

const show = (immediate = false) => {
  if (props.disabled || props.readonly) return
  open.value = true
  scheduleRefresh(query.value, immediate)
}

const close = () => {
  open.value = false
  activeIndex.value = -1
}

const selectOption = (option: AComboboxOption) => {
  if (option.disabled) return
  syncingSelection = true
  model.value = option.id
  query.value = option.label
  emit('query-change', query.value)
  emit('select', option)
  close()
  nextTick(() => input.value?.focus())
}

const clearSelection = () => {
  requestController?.abort()
  syncingSelection = true
  model.value = null
  query.value = ''
  results.value = [...props.options]
  activeIndex.value = firstEnabledIndex()
  emit('query-change', '')
  emit('clear')
  nextTick(() => {
    input.value?.focus()
    show(true)
  })
}

const moveActive = (direction: 1 | -1) => {
  const indexes = enabledIndexes.value
  if (!indexes.length) {
    activeIndex.value = -1
    return
  }
  const currentPosition = indexes.indexOf(activeIndex.value)
  const nextPosition = currentPosition < 0
    ? (direction > 0 ? 0 : indexes.length - 1)
    : (currentPosition + direction + indexes.length) % indexes.length
  activeIndex.value = indexes[nextPosition] ?? -1
  nextTick(() => {
    document.getElementById(activeOptionId.value ?? '')?.scrollIntoView({ block: 'nearest' })
  })
}

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  syncingSelection = false
  query.value = value
  if (model.value !== null) {
    syncingSelection = true
    model.value = null
  }
  emit('query-change', value)
  open.value = true
  activeIndex.value = -1
  scheduleRefresh(value)
}

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.readonly) return
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!open.value) show(true)
      moveActive(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!open.value) show(true)
      moveActive(-1)
      break
    case 'Home':
      if (!open.value) return
      event.preventDefault()
      activeIndex.value = enabledIndexes.value[0] ?? -1
      break
    case 'End':
      if (!open.value) return
      event.preventDefault()
      activeIndex.value = enabledIndexes.value.at(-1) ?? -1
      break
    case 'Enter': {
      if (!open.value) {
        event.preventDefault()
        show(true)
        return
      }
      const option = results.value[activeIndex.value]
      if (option && !option.disabled) {
        event.preventDefault()
        selectOption(option)
      }
      break
    }
    case 'Escape':
      if (open.value) {
        event.preventDefault()
        close()
        if (selectedOption.value) query.value = selectedOption.value.label
      }
      break
    case 'Tab':
      close()
      break
  }
}

const onDocumentPointerDown = (event: PointerEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

watch(
  () => props.options,
  () => {
    if (!props.loadOptions) {
      results.value = locallyFilteredOptions(query.value)
      ensureActiveOption()
    }
  },
  { deep: true, immediate: true }
)

watch(model, (value) => {
  if (syncingSelection) {
    syncingSelection = false
    return
  }
  if (value === null) {
    query.value = ''
    return
  }
  const option = [...props.options, ...results.value].find((entry) => entry.id === value)
  if (option) query.value = option.label
}, { immediate: true })

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  if (debounceTimer) clearTimeout(debounceTimer)
  requestController?.abort()
})
</script>

<template>
  <div
    ref="root"
    class="a-combobox"
    :class="{ 'a-combobox--disabled': disabled, 'a-combobox--error': !!errorMessage }"
  >
    <label :for="inputId" class="a-combobox__label">
      {{ label }}<span v-if="required" aria-hidden="true"> *</span>
    </label>
    <div class="a-combobox__control">
      <input
        :id="inputId"
        ref="input"
        class="a-combobox__input"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-activedescendant="activeOptionId"
        :aria-controls="listboxId"
        :aria-describedby="descriptionIds"
        :aria-expanded="open"
        :aria-invalid="errorMessage ? 'true' : undefined"
        :aria-required="required || undefined"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="placeholder"
        :value="query"
        @focus="show(true)"
        @input="onInput"
        @keydown="onKeydown"
      >
      <button
        v-if="clearable && (query || model !== null)"
        type="button"
        class="a-combobox__clear"
        aria-label="Limpiar selección"
        :disabled="disabled || readonly"
        @click="clearSelection"
      >
        <q-icon name="close" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="a-combobox__toggle"
        :aria-label="open ? 'Cerrar opciones' : 'Mostrar opciones'"
        :aria-expanded="open"
        :aria-controls="listboxId"
        :disabled="disabled || readonly"
        @click="open ? close() : show(true)"
      >
        <q-icon :name="open ? 'expand_less' : 'expand_more'" aria-hidden="true" />
      </button>
    </div>

    <p v-if="hint" :id="hintId" class="a-combobox__hint">{{ hint }}</p>
    <p v-if="errorMessage" :id="errorId" class="a-combobox__error">{{ errorMessage }}</p>

    <div v-if="open" class="a-combobox__popup">
      <div
        :id="listboxId"
        class="a-combobox__listbox"
        role="listbox"
        :aria-label="label"
        :aria-busy="loading"
      >
        <p v-if="loading" class="a-combobox__state" role="status">
          <q-icon name="progress_activity" aria-hidden="true" />
          {{ loadingLabel }}
        </p>
        <p v-else-if="loadError" class="a-combobox__state a-combobox__state--error" role="alert">
          {{ loadError }}
        </p>
        <p v-else-if="!results.length" class="a-combobox__state" role="status">
          {{ emptyLabel }}
        </p>
        <div
          v-for="(option, index) in results"
          v-else
          :id="`${listboxId}-option-${index}`"
          :key="option.id"
          class="a-combobox__option"
          :class="{
            'a-combobox__option--active': index === activeIndex,
            'a-combobox__option--disabled': option.disabled
          }"
          role="option"
          :aria-disabled="option.disabled || undefined"
          :aria-selected="model === option.id"
          @mouseenter="!option.disabled && (activeIndex = index)"
          @mousedown.prevent
          @click="selectOption(option)"
        >
          <q-icon v-if="option.icon" :name="option.icon" aria-hidden="true" />
          <span>
            <strong>{{ option.label }}</strong>
            <small v-if="option.description">{{ option.description }}</small>
          </span>
          <q-icon v-if="model === option.id" name="check" aria-hidden="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.a-combobox {
  position: relative;
  display: grid;
  gap: var(--a-space-2);
  color: var(--a-text-primary);
}

.a-combobox__label {
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
}

.a-combobox__control {
  display: flex;
  align-items: center;
  min-height: var(--a-control-md);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  transition: border-color var(--a-motion-fast), box-shadow var(--a-motion-fast);
}

.a-combobox__control:focus-within {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
}

.a-combobox--error .a-combobox__control {
  border-color: var(--a-negative);
}

.a-combobox__input {
  min-width: 0;
  min-height: var(--a-target-min);
  flex: 1;
  border: 0;
  outline: 0;
  padding: var(--a-space-3) var(--a-space-4);
  background: transparent;
  color: var(--a-text-primary);
}

.a-combobox__input::placeholder {
  color: var(--a-text-tertiary);
}

.a-combobox__clear,
.a-combobox__toggle {
  display: inline-grid;
  place-items: center;
  width: var(--a-target-min);
  min-width: var(--a-target-min);
  height: var(--a-target-min);
  border: 0;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-secondary);
  cursor: pointer;
}

.a-combobox__clear:hover,
.a-combobox__toggle:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-combobox__hint,
.a-combobox__error {
  margin: var(--a-space-0);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.a-combobox__error {
  color: var(--a-negative);
}

.a-combobox__popup {
  position: absolute;
  z-index: var(--a-z-dropdown);
  inset: calc(100% + var(--a-space-2)) 0 auto;
}

.a-combobox__listbox {
  max-height: min(var(--a-layout-aside), 50dvh);
  overflow-y: auto;
  padding: var(--a-space-1);
  border: var(--a-border-width) solid var(--a-border-strong);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  box-shadow: var(--a-shadow-2);
}

.a-combobox__option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--a-space-3);
  align-items: center;
  min-height: var(--a-target-min);
  padding: var(--a-space-2) var(--a-space-3);
  border-radius: var(--a-radius-xs);
  cursor: pointer;
}

.a-combobox__option--active {
  background: var(--a-bg-hover);
}

.a-combobox__option[aria-selected='true'] {
  background: var(--a-bg-selected);
  color: var(--a-primary);
}

.a-combobox__option--disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}

.a-combobox__option > span {
  display: grid;
  min-width: 0;
}

.a-combobox__option strong {
  font-size: var(--a-font-size-sm);
}

.a-combobox__option small {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.a-combobox__state {
  display: flex;
  gap: var(--a-space-2);
  align-items: center;
  min-height: var(--a-target-min);
  margin: var(--a-space-0);
  padding: var(--a-space-3);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}

.a-combobox__state--error {
  color: var(--a-negative);
}

.a-combobox--disabled {
  opacity: var(--a-opacity-disabled);
}
</style>
