<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type {
  AId,
  AUploadQueueItem,
  AUploadStatus
} from '../types/core'

const props = withDefaults(defineProps<{
  items: readonly AUploadQueueItem[]
  label?: string
  compact?: boolean
  disabled?: boolean
  showGlobalProgress?: boolean
  clearCompleted?: boolean
}>(), {
  label: 'Cola de subida',
  showGlobalProgress: true,
  clearCompleted: false
})

const emit = defineEmits<{
  pause: [id: AId]
  resume: [id: AId]
  cancel: [id: AId]
  retry: [id: AId]
  'clear-completed': []
}>()

const announcement = ref('')
const previousStatuses = new Map<AId, AUploadStatus>()
let statusesInitialized = false

const statusLabels: Record<AUploadStatus, string> = {
  queued: 'En cola',
  uploading: 'Subiendo',
  paused: 'En pausa',
  success: 'Completado',
  error: 'Error',
  cancelled: 'Cancelado'
}

const statusIcons: Record<AUploadStatus, string> = {
  queued: 'schedule',
  uploading: 'upload',
  paused: 'pause_circle',
  success: 'check_circle',
  error: 'error',
  cancelled: 'cancel'
}

const boundedProgress = (item: AUploadQueueItem) => {
  if (item.status === 'success') return 100
  if (item.progress === undefined) return undefined
  return Math.max(0, Math.min(item.progress, 100))
}

const globalProgress = computed(() => {
  if (!props.items.length) return 0
  let completedWeight = 0
  let totalWeight = 0
  for (const item of props.items) {
    const weight = Math.max(item.size, 1)
    const progress = boundedProgress(item) ?? 0
    totalWeight += weight
    completedWeight += weight * progress
  }
  return totalWeight ? Math.round(completedWeight / totalWeight) : 0
})

const activeCount = computed(() =>
  props.items.filter((item) => item.status === 'uploading' || item.status === 'queued').length
)

const completedCount = computed(() =>
  props.items.filter((item) => item.status === 'success').length
)

const canPause = (item: AUploadQueueItem) => item.status === 'uploading'
const canResume = (item: AUploadQueueItem) => item.status === 'paused'
const canRetry = (item: AUploadQueueItem) =>
  item.status === 'error' || item.status === 'cancelled'
const canCancel = (item: AUploadQueueItem) =>
  item.status === 'queued' ||
  item.status === 'uploading' ||
  item.status === 'paused' ||
  item.status === 'error'

const formatSize = (bytes: number) => {
  if (bytes < 1000) return `${bytes} B`
  if (bytes < 1_000_000) {
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(bytes / 1000)} KB`
  }
  if (bytes < 1_000_000_000) {
    return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(bytes / 1_000_000)} MB`
  }
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(bytes / 1_000_000_000)} GB`
}

const announceStatusChanges = (items: readonly AUploadQueueItem[]) => {
  const messages: string[] = []
  for (const item of items) {
    const previous = previousStatuses.get(item.id)
    if (previous && previous !== item.status) {
      messages.push(`${item.name}: ${statusLabels[item.status]}`)
    }
    previousStatuses.set(item.id, item.status)
  }
  const currentIds = new Set(items.map((item) => item.id))
  for (const id of previousStatuses.keys()) {
    if (!currentIds.has(id)) previousStatuses.delete(id)
  }
  if (!statusesInitialized) {
    announcement.value = `${items.length} archivo${items.length === 1 ? '' : 's'} en la cola`
    statusesInitialized = true
  } else if (messages.length) {
    announcement.value = messages.join('. ')
  }
}

watch(
  () => props.items,
  (items) => announceStatusChanges(items),
  { deep: true, immediate: true }
)
</script>

<template>
  <section
    class="a-upload-queue"
    :class="{ 'a-upload-queue--compact': compact }"
    role="region"
    :aria-label="label"
  >
    <header class="a-upload-queue__header">
      <div>
        <h2>{{ label }}</h2>
        <p>
          {{ activeCount }} en curso · {{ completedCount }} completados
        </p>
      </div>
      <button
        v-if="clearCompleted && completedCount"
        type="button"
        class="a-upload-queue__clear"
        :disabled="disabled"
        @click="$emit('clear-completed')"
      >
        Limpiar completados
      </button>
    </header>

    <div v-if="showGlobalProgress && items.length" class="a-upload-queue__global">
      <div class="a-upload-queue__global-copy">
        <span>Progreso total</span>
        <strong>{{ globalProgress }}%</strong>
      </div>
      <div
        class="a-upload-queue__progress"
        role="progressbar"
        aria-label="Progreso total de la subida"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="globalProgress"
      >
        <span :style="{ width: `${globalProgress}%` }" />
      </div>
    </div>

    <ol v-if="items.length" class="a-upload-queue__items">
      <li
        v-for="item in items"
        :key="item.id"
        class="a-upload-queue__item"
        :class="`a-upload-queue__item--${item.status}`"
      >
        <span class="a-upload-queue__status-icon" aria-hidden="true">
          <q-icon :name="statusIcons[item.status]" />
        </span>

        <div class="a-upload-queue__content">
          <div class="a-upload-queue__file-copy">
            <strong>{{ item.name }}</strong>
            <span>{{ formatSize(item.size) }} · {{ statusLabels[item.status] }}</span>
          </div>

          <div
            v-if="item.status !== 'cancelled'"
            class="a-upload-queue__progress"
            :class="{ 'a-upload-queue__progress--indeterminate': item.status === 'uploading' && boundedProgress(item) === undefined }"
            role="progressbar"
            :aria-label="`Progreso de ${item.name}`"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="boundedProgress(item)"
            :aria-valuetext="boundedProgress(item) === undefined ? statusLabels[item.status] : undefined"
          >
            <span
              :style="{ width: boundedProgress(item) === undefined ? undefined : `${boundedProgress(item)}%` }"
            />
          </div>

          <p v-if="item.error" class="a-upload-queue__error" role="alert">
            {{ item.error }}
          </p>
        </div>

        <div class="a-upload-queue__actions">
          <button
            v-if="canPause(item)"
            type="button"
            :aria-label="`Pausar ${item.name}`"
            :disabled="disabled"
            @click="$emit('pause', item.id)"
          >
            <q-icon name="pause" aria-hidden="true" />
            <span>Pausar</span>
          </button>
          <button
            v-if="canResume(item)"
            type="button"
            :aria-label="`Continuar ${item.name}`"
            :disabled="disabled"
            @click="$emit('resume', item.id)"
          >
            <q-icon name="play_arrow" aria-hidden="true" />
            <span>Continuar</span>
          </button>
          <button
            v-if="canRetry(item)"
            type="button"
            :aria-label="`Reintentar ${item.name}`"
            :disabled="disabled"
            @click="$emit('retry', item.id)"
          >
            <q-icon name="refresh" aria-hidden="true" />
            <span>Reintentar</span>
          </button>
          <button
            v-if="canCancel(item)"
            type="button"
            :aria-label="`Cancelar ${item.name}`"
            :disabled="disabled"
            @click="$emit('cancel', item.id)"
          >
            <q-icon name="close" aria-hidden="true" />
            <span>Cancelar</span>
          </button>
        </div>
      </li>
    </ol>

    <p v-else class="a-upload-queue__empty">No hay archivos en la cola.</p>
    <p class="a-visually-hidden" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </p>
  </section>
</template>

<style scoped>
.a-upload-queue {
  display: grid;
  gap: var(--a-space-4);
  color: var(--a-text-primary);
}

.a-upload-queue__header,
.a-upload-queue__global-copy,
.a-upload-queue__actions {
  display: flex;
  gap: var(--a-space-3);
  align-items: center;
  justify-content: space-between;
}

.a-upload-queue__header {
  flex-wrap: wrap;
}

.a-upload-queue__header h2 {
  margin: var(--a-space-0);
  font-size: var(--a-font-size-lg);
  line-height: var(--a-line-height-tight);
}

.a-upload-queue__header p,
.a-upload-queue__file-copy span,
.a-upload-queue__empty {
  margin: var(--a-space-1) var(--a-space-0) var(--a-space-0);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.a-upload-queue__clear {
  min-height: var(--a-target-min);
  padding: var(--a-space-2) var(--a-space-3);
  border: 0;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-primary);
  font-weight: var(--a-font-weight-semibold);
  cursor: pointer;
}

.a-upload-queue__clear:hover {
  background: var(--a-bg-hover);
}

.a-upload-queue__global {
  display: grid;
  gap: var(--a-space-2);
  padding: var(--a-space-3);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-muted);
}

.a-upload-queue__global-copy {
  font-size: var(--a-font-size-sm);
}

.a-upload-queue__global-copy strong {
  font-variant-numeric: tabular-nums;
}

.a-upload-queue__items {
  display: grid;
  gap: var(--a-space-2);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}

.a-upload-queue__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--a-space-3);
  align-items: center;
  padding: var(--a-space-3);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}

.a-upload-queue__status-icon {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-muted);
  color: var(--a-text-secondary);
}

.a-upload-queue__item--uploading .a-upload-queue__status-icon,
.a-upload-queue__item--queued .a-upload-queue__status-icon {
  background: var(--a-primary-soft);
  color: var(--a-primary);
}

.a-upload-queue__item--success .a-upload-queue__status-icon {
  background: var(--a-bg-positive-soft);
  color: var(--a-positive);
}

.a-upload-queue__item--error .a-upload-queue__status-icon {
  background: var(--a-bg-negative-soft);
  color: var(--a-negative);
}

.a-upload-queue__content {
  display: grid;
  gap: var(--a-space-2);
  min-width: 0;
}

.a-upload-queue__file-copy {
  display: grid;
  gap: var(--a-space-1);
}

.a-upload-queue__file-copy strong {
  min-width: 0;
  overflow: hidden;
  font-size: var(--a-font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a-upload-queue__file-copy span {
  flex: none;
  margin: var(--a-space-0);
  font-variant-numeric: tabular-nums;
}

.a-upload-queue__progress {
  position: relative;
  height: var(--a-space-2);
  overflow: hidden;
  border-radius: var(--a-radius-round);
  background: var(--a-progress-track);
}

.a-upload-queue__progress > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--a-primary);
  transition: width var(--a-motion-base);
}

.a-upload-queue__progress--indeterminate > span {
  width: 40%;
  animation: a-upload-queue-indeterminate var(--a-duration-progress) var(--a-easing-standard) infinite alternate;
}

.a-upload-queue__error {
  margin: var(--a-space-0);
  color: var(--a-negative);
  font-size: var(--a-font-size-xs);
}

.a-upload-queue__actions {
  grid-column: 1 / -1;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.a-upload-queue__actions button {
  display: inline-flex;
  gap: var(--a-space-1);
  align-items: center;
  justify-content: center;
  min-width: var(--a-target-min);
  min-height: var(--a-target-min);
  padding: var(--a-space-2);
  border: 0;
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-secondary);
  cursor: pointer;
}

.a-upload-queue__actions button:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-upload-queue__actions button:disabled,
.a-upload-queue__clear:disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}

.a-upload-queue--compact .a-upload-queue__item {
  padding: var(--a-space-2);
}

.a-upload-queue--compact .a-upload-queue__actions button span {
  position: absolute;
  width: var(--a-border-width);
  height: var(--a-border-width);
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@keyframes a-upload-queue-indeterminate {
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
}

@media (prefers-reduced-motion: reduce) {
  .a-upload-queue__progress--indeterminate > span {
    width: 50%;
    animation: none;
  }
}
</style>
