<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import type {
  AFileUploadLabels,
  AFileValidator,
  AUploadIssue
} from '../types/core'
import ADropzone from './ADropzone.vue'

const props = withDefaults(defineProps<{
  label: string
  description?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  busy?: boolean
  permission?: boolean
  maxSize?: number
  maxFiles?: number
  validators?: AFileValidator[]
  allowUrl?: boolean
  hideSubmit?: boolean
  labels?: AFileUploadLabels
  formatSize?: (bytes: number) => string
}>(), {
  description: '',
  accept: '',
  multiple: true,
  permission: true,
  validators: () => [],
  allowUrl: false,
  hideSubmit: false,
  labels: () => ({})
})

const emit = defineEmits<{
  accepted: [files: File[]]
  rejected: [issues: AUploadIssue[]]
  remove: [file: File, index: number]
  submit: [payload: { files: readonly File[]; url?: string }]
}>()

const files = defineModel<File[]>({ default: () => [] })
const url = defineModel<string>('url', { default: '' })
const announcement = ref('')
const urlId = `a-file-upload-url-${useId()}`

const copy = computed(() => ({
  browse: props.labels.browse ?? 'Seleccionar archivos',
  remove: props.labels.remove ?? 'Quitar',
  addUrl: props.labels.addUrl ?? 'Añadir mediante URL',
  urlLabel: props.labels.urlLabel ?? 'URL del archivo',
  submit: props.labels.submit ?? 'Añadir archivos'
}))

const canSubmit = computed(() =>
  !props.disabled &&
  !props.busy &&
  props.permission &&
  (files.value.length > 0 || (props.allowUrl && url.value.trim().length > 0))
)

const defaultFormatSize = (bytes: number) => {
  if (bytes < 1000) return `${bytes} B`
  if (bytes < 1_000_000) {
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(bytes / 1000)} KB`
  }
  if (bytes < 1_000_000_000) {
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(bytes / 1_000_000)} MB`
  }
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(bytes / 1_000_000_000)} GB`
}

const formattedSize = (bytes: number) =>
  props.formatSize?.(bytes) ?? defaultFormatSize(bytes)

const onAccepted = (accepted: File[]) => {
  announcement.value = `${accepted.length} archivo${accepted.length === 1 ? '' : 's'} añadido${accepted.length === 1 ? '' : 's'}`
  emit('accepted', accepted)
}

const onRejected = (issues: AUploadIssue[]) => {
  announcement.value = `${issues.length} archivo${issues.length === 1 ? '' : 's'} rechazado${issues.length === 1 ? '' : 's'}`
  emit('rejected', issues)
}

const removeFile = (index: number) => {
  const file = files.value[index]
  if (!file) return
  files.value = files.value.filter((_, fileIndex) => fileIndex !== index)
  announcement.value = `${file.name} se quitó de la selección`
  emit('remove', file, index)
}

const onSubmit = () => {
  if (!canSubmit.value) return
  const normalizedUrl = props.allowUrl ? url.value.trim() : ''
  emit('submit', {
    files: files.value,
    ...(normalizedUrl ? { url: normalizedUrl } : {})
  })
}
</script>

<template>
  <form
    class="a-file-upload"
    :aria-busy="busy"
    :aria-disabled="disabled || !permission || undefined"
    @submit.prevent="onSubmit"
  >
    <ADropzone
      v-model="files"
      :label="label"
      :description="description"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled || busy"
      :permission="permission"
      :max-size="maxSize"
      :max-files="maxFiles"
      :validators="validators"
      :browse-label="copy.browse"
      @accepted="onAccepted"
      @rejected="onRejected"
    >
      <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    </ADropzone>

    <ol v-if="files.length" class="a-file-upload__files" aria-label="Archivos seleccionados">
      <li
        v-for="(file, index) in files"
        :key="`${file.name}-${file.size}-${file.lastModified}-${index}`"
        class="a-file-upload__file"
      >
        <span class="a-file-upload__file-icon" aria-hidden="true">
          <q-icon name="draft" />
        </span>
        <span class="a-file-upload__file-copy">
          <strong>{{ file.name }}</strong>
          <small>{{ formattedSize(file.size) }}</small>
        </span>
        <button
          type="button"
          class="a-file-upload__remove"
          :aria-label="`${copy.remove} ${file.name}`"
          :disabled="disabled || busy || !permission"
          @click="removeFile(index)"
        >
          <q-icon name="close" aria-hidden="true" />
        </button>
      </li>
    </ol>

    <div v-if="allowUrl" class="a-file-upload__url">
      <label :for="urlId">{{ copy.urlLabel }}</label>
      <div class="a-file-upload__url-control">
        <q-icon name="link" aria-hidden="true" />
        <input
          :id="urlId"
          v-model="url"
          type="url"
          inputmode="url"
          autocomplete="url"
          :placeholder="copy.addUrl"
          :disabled="disabled || busy"
        >
      </div>
    </div>

    <div v-if="!hideSubmit" class="a-file-upload__actions">
      <button
        type="submit"
        class="a-file-upload__submit"
        :disabled="!canSubmit"
      >
        <q-icon v-if="busy" name="progress_activity" aria-hidden="true" />
        {{ copy.submit }}
      </button>
    </div>

    <p class="a-visually-hidden" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </p>
  </form>
</template>

<style scoped>
.a-file-upload {
  display: grid;
  gap: var(--a-space-4);
  color: var(--a-text-primary);
}

.a-file-upload__files {
  display: grid;
  gap: var(--a-space-2);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}

.a-file-upload__file {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--a-space-3);
  align-items: center;
  min-height: var(--a-control-lg);
  padding: var(--a-space-2);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}

.a-file-upload__file-icon {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border-radius: var(--a-radius-xs);
  background: var(--a-primary-soft);
  color: var(--a-primary);
}

.a-file-upload__file-copy {
  display: grid;
  min-width: 0;
}

.a-file-upload__file-copy strong {
  overflow: hidden;
  font-size: var(--a-font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a-file-upload__file-copy small {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  font-variant-numeric: tabular-nums;
}

.a-file-upload__remove {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border: 0;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-secondary);
  cursor: pointer;
}

.a-file-upload__remove:hover {
  background: var(--a-bg-hover);
  color: var(--a-negative);
}

.a-file-upload__remove:disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}

.a-file-upload__url {
  display: grid;
  gap: var(--a-space-2);
}

.a-file-upload__url > label {
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
}

.a-file-upload__url-control {
  display: flex;
  gap: var(--a-space-2);
  align-items: center;
  min-height: var(--a-control-md);
  padding-inline: var(--a-space-3);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  color: var(--a-text-secondary);
}

.a-file-upload__url-control:focus-within {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
}

.a-file-upload__url-control input {
  min-width: 0;
  min-height: var(--a-target-min);
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--a-text-primary);
}

.a-file-upload__url-control input::placeholder {
  color: var(--a-text-tertiary);
}

.a-file-upload__actions {
  display: flex;
  justify-content: flex-end;
}

.a-file-upload__submit {
  display: inline-flex;
  gap: var(--a-space-2);
  align-items: center;
  justify-content: center;
  min-height: var(--a-target-min);
  padding: var(--a-space-2) var(--a-space-4);
  border: 0;
  border-radius: var(--a-radius-sm);
  background: var(--a-primary);
  color: var(--a-text-inverse);
  font-weight: var(--a-font-weight-semibold);
  cursor: pointer;
  transition: background var(--a-motion-fast), transform var(--a-motion-fast);
}

.a-file-upload__submit:hover {
  background: var(--a-primary-hover);
}

.a-file-upload__submit:active {
  transform: translateY(var(--a-border-width));
}

.a-file-upload__submit:disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}
</style>
