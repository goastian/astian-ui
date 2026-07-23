<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'

import type {
  AFileValidator,
  AUploadIssue,
  AUploadIssueCode
} from '../types/core'

const props = withDefaults(defineProps<{
  label: string
  description?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  permission?: boolean
  maxSize?: number
  maxFiles?: number
  append?: boolean
  validators?: AFileValidator[]
  browseLabel?: string
  validatingLabel?: string
  permissionMessage?: string
}>(), {
  description: '',
  accept: '',
  multiple: true,
  permission: true,
  append: true,
  validators: () => [],
  browseLabel: 'Seleccionar archivos',
  validatingLabel: 'Validando archivos',
  permissionMessage: 'No tienes permiso para añadir archivos'
})

const emit = defineEmits<{
  accepted: [files: File[]]
  rejected: [issues: AUploadIssue[]]
  validated: [result: { accepted: File[]; issues: AUploadIssue[] }]
}>()

const model = defineModel<File[]>({ default: () => [] })

const input = ref<HTMLInputElement | null>(null)
const dragDepth = ref(0)
const validating = ref(false)
const issues = ref<AUploadIssue[]>([])
const statusMessage = ref('')
const inputId = `a-dropzone-${useId()}`
const descriptionId = `${inputId}-description`
const issuesId = `${inputId}-issues`
const permissionId = `${inputId}-permission`
let validationController: AbortController | undefined

const isDragging = computed(() => dragDepth.value > 0)
const describedBy = computed(() => {
  const ids: string[] = []
  if (props.description) ids.push(descriptionId)
  if (!props.permission) ids.push(permissionId)
  if (issues.value.length) ids.push(issuesId)
  return ids.join(' ') || undefined
})

const issue = (file: File, code: AUploadIssueCode, message: string): AUploadIssue => ({
  file,
  code,
  message
})

const acceptsFile = (file: File) => {
  if (!props.accept.trim()) return true
  const acceptedTypes = props.accept.split(',').map((entry) => entry.trim().toLocaleLowerCase())
  const fileName = file.name.toLocaleLowerCase()
  const fileType = file.type.toLocaleLowerCase()
  return acceptedTypes.some((accepted) => {
    if (accepted.startsWith('.')) return fileName.endsWith(accepted)
    if (accepted.endsWith('/*')) return fileType.startsWith(accepted.slice(0, -1))
    return fileType === accepted
  })
}

const isUploadIssue = (value: unknown): value is AUploadIssue =>
  !!value &&
  typeof value === 'object' &&
  'file' in value &&
  'code' in value &&
  'message' in value

const runCustomValidators = async (
  file: File,
  files: readonly File[],
  signal: AbortSignal
) => {
  for (const validator of props.validators) {
    const result = await validator(file, { files, signal })
    if (signal.aborted) return undefined
    if (result === true) continue
    if (result === false) return issue(file, 'custom', `No se puede añadir ${file.name}`)
    if (typeof result === 'string') return issue(file, 'custom', result)
    if (isUploadIssue(result)) return { ...result, file }
  }
  return undefined
}

const validate = async (incoming: File[]) => {
  validationController?.abort()
  validationController = new AbortController()
  const { signal } = validationController
  validating.value = true
  issues.value = []
  statusMessage.value = props.validatingLabel

  const accepted: File[] = []
  const rejected: AUploadIssue[] = []
  const existingCount = props.append ? model.value.length : 0
  const availableSlots = props.maxFiles === undefined
    ? Number.POSITIVE_INFINITY
    : Math.max(props.maxFiles - existingCount, 0)

  if (!props.permission) {
    rejected.push(...incoming.map((file) => issue(file, 'permission', props.permissionMessage)))
  } else {
    for (const file of incoming) {
      if (signal.aborted) return { accepted: [], issues: [] }
      if ((!props.multiple && accepted.length >= 1) || accepted.length >= availableSlots) {
        rejected.push(issue(file, 'count', `Se alcanzó el límite de ${props.maxFiles ?? 1} archivo${(props.maxFiles ?? 1) === 1 ? '' : 's'}`))
        continue
      }
      if (!acceptsFile(file)) {
        rejected.push(issue(file, 'type', `${file.name} no tiene un tipo permitido`))
        continue
      }
      if (props.maxSize !== undefined && file.size > props.maxSize) {
        rejected.push(issue(file, 'size', `${file.name} supera el tamaño permitido`))
        continue
      }
      let customIssue: AUploadIssue | undefined
      try {
        customIssue = await runCustomValidators(file, incoming, signal)
      } catch {
        if (!signal.aborted) {
          customIssue = issue(file, 'custom', `No se pudo validar ${file.name}`)
        }
      }
      if (signal.aborted) return { accepted: [], issues: [] }
      if (customIssue) rejected.push(customIssue)
      else accepted.push(file)
    }
  }

  if (signal.aborted) return { accepted: [], issues: [] }

  if (accepted.length) {
    model.value = props.append && props.multiple
      ? [...model.value, ...accepted]
      : accepted.slice(0, props.multiple ? undefined : 1)
    emit('accepted', accepted)
  }
  if (rejected.length) emit('rejected', rejected)
  issues.value = rejected
  emit('validated', { accepted, issues: rejected })
  statusMessage.value = rejected.length
    ? `${accepted.length} archivos aceptados; ${rejected.length} rechazados`
    : `${accepted.length} archivos aceptados`
  validating.value = false
  return { accepted, issues: rejected }
}

const pick = () => {
  if (!props.disabled && props.permission && !validating.value) input.value?.click()
}

const onInputChange = (event: Event) => {
  const element = event.target as HTMLInputElement
  const files = Array.from(element.files ?? [])
  if (files.length) void validate(files)
  element.value = ''
}

const onDragEnter = (event: DragEvent) => {
  event.preventDefault()
  if (props.disabled || !props.permission) return
  dragDepth.value += 1
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (props.disabled || !props.permission) return
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

const onDragLeave = (event: DragEvent) => {
  event.preventDefault()
  if (props.disabled || !props.permission) return
  dragDepth.value = Math.max(0, dragDepth.value - 1)
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  if (props.disabled || !props.permission) return
  dragDepth.value = 0
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) void validate(files)
}

onBeforeUnmount(() => validationController?.abort())

defineExpose({ openPicker: pick, validate })
</script>

<template>
  <section
    class="a-dropzone"
    :class="{
      'a-dropzone--dragging': isDragging,
      'a-dropzone--disabled': disabled,
      'a-dropzone--error': issues.length || !permission
    }"
    :aria-busy="validating"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <input
      :id="inputId"
      ref="input"
      class="a-dropzone__input"
      type="file"
      :accept="accept || undefined"
      :multiple="multiple"
      :disabled="disabled || !permission"
      tabindex="-1"
      @change="onInputChange"
    >

    <button
      type="button"
      class="a-dropzone__picker"
      :disabled="disabled || !permission || validating"
      :aria-describedby="describedBy"
      @click="pick"
    >
      <span class="a-dropzone__icon" aria-hidden="true">
        <slot name="icon"><q-icon name="upload_file" /></slot>
      </span>
      <span class="a-dropzone__copy">
        <strong><slot name="label">{{ label }}</slot></strong>
        <small v-if="description" :id="descriptionId">
          <slot name="description">{{ description }}</slot>
        </small>
        <span class="a-dropzone__action">{{ browseLabel }}</span>
      </span>
    </button>

    <ul v-if="issues.length" :id="issuesId" class="a-dropzone__issues" role="alert">
      <li v-for="entry in issues" :key="`${entry.file.name}-${entry.code}`">
        {{ entry.message }}
      </li>
    </ul>
    <p v-if="!permission" :id="permissionId" class="a-dropzone__permission" role="alert">
      {{ permissionMessage }}
    </p>

    <p class="a-visually-hidden" aria-live="polite" aria-atomic="true">
      {{ statusMessage }}
    </p>
  </section>
</template>

<style scoped>
.a-dropzone {
  display: grid;
  gap: var(--a-space-3);
  border: var(--a-border-width-strong) dashed var(--a-border-strong);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-surface);
  color: var(--a-text-primary);
  transition: border-color var(--a-motion-fast), background var(--a-motion-fast);
}

.a-dropzone--dragging {
  border-color: var(--a-primary);
  background: var(--a-primary-soft);
}

.a-dropzone--error {
  border-color: var(--a-negative);
}

.a-dropzone--disabled {
  opacity: var(--a-opacity-disabled);
}

.a-dropzone__input {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.a-dropzone__picker {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--a-space-4);
  align-items: center;
  width: 100%;
  min-height: calc(var(--a-target-min) * 3);
  padding: var(--a-space-5);
  border: 0;
  border-radius: calc(var(--a-radius-md) - var(--a-border-width-strong));
  background: transparent;
  color: inherit;
  text-align: start;
  cursor: pointer;
}

.a-dropzone__picker:hover {
  background: var(--a-bg-hover);
}

.a-dropzone__picker:disabled {
  cursor: not-allowed;
}

.a-dropzone__icon {
  display: grid;
  place-items: center;
  width: var(--a-control-lg);
  height: var(--a-control-lg);
  border-radius: var(--a-radius-sm);
  background: var(--a-primary-soft);
  color: var(--a-primary);
  font-size: var(--a-icon-lg);
}

.a-dropzone__copy {
  display: grid;
  gap: var(--a-space-1);
}

.a-dropzone__copy strong {
  font-size: var(--a-font-size-md);
}

.a-dropzone__copy small {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}

.a-dropzone__action {
  width: fit-content;
  margin-top: var(--a-space-2);
  color: var(--a-primary);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
  text-decoration: underline;
  text-underline-offset: var(--a-space-1);
}

.a-dropzone__issues {
  display: grid;
  gap: var(--a-space-1);
  margin: var(--a-space-0) var(--a-space-4) var(--a-space-4);
  padding: var(--a-space-3) var(--a-space-4);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-negative-soft);
  color: var(--a-negative);
  font-size: var(--a-font-size-sm);
}

.a-dropzone__permission {
  margin: var(--a-space-0) var(--a-space-4) var(--a-space-4);
  padding: var(--a-space-3) var(--a-space-4);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-negative-soft);
  color: var(--a-negative);
  font-size: var(--a-font-size-sm);
}
</style>
