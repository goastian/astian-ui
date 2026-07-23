<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AButton from '../../components/AButton.vue'
import AErrorState from '../../components/AErrorState.vue'
import AIcon from '../../components/AIcon.vue'
import AIconButton from '../../components/AIconButton.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import type { ALoadState } from '../../types/core'
import type { AFilePreviewSource } from '../types'

const zoom = defineModel<number>('zoom', { default: 1 })

const props = withDefaults(defineProps<{
  source: AFilePreviewSource
  state?: ALoadState
  errorTitle?: string
  errorDescription?: string
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
  captionsSrc?: string
  captionsLabel?: string
  showToolbar?: boolean
}>(), {
  state: 'ready',
  errorTitle: 'No se pudo abrir la vista previa',
  errorDescription: 'Descarga el archivo o reintenta.',
  minZoom: 0.5,
  maxZoom: 3,
  zoomStep: 0.25,
  captionsLabel: 'Subtítulos',
  showToolbar: true
})

const emit = defineEmits<{
  retry: []
  download: [source: AFilePreviewSource]
  load: [source: AFilePreviewSource]
  error: [source: AFilePreviewSource]
}>()

const mediaFailed = ref(false)
const boundedZoom = computed(() => Math.min(props.maxZoom, Math.max(props.minZoom, zoom.value)))
const canZoom = computed(() => props.source.kind === 'image')

const updateZoom = (next: number) => {
  zoom.value = Math.min(props.maxZoom, Math.max(props.minZoom, next))
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!canZoom.value) return
  const target = event.target
  if (
    target instanceof Element
    && target !== event.currentTarget
    && target.closest('a[href], button, input, select, textarea, video, audio, [contenteditable="true"]')
  ) return

  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    updateZoom(zoom.value + props.zoomStep)
  } else if (event.key === '-') {
    event.preventDefault()
    updateZoom(zoom.value - props.zoomStep)
  } else if (event.key === '0') {
    event.preventDefault()
    updateZoom(1)
  }
}

watch(() => [props.source.id, props.source.src], () => {
  mediaFailed.value = false
  zoom.value = 1
})
</script>

<template>
  <section
    class="a-file-preview"
    :aria-label="`Vista previa de ${source.name}`"
    :aria-busy="state === 'loading'"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <header v-if="showToolbar" class="a-file-preview__toolbar">
      <div>
        <strong>{{ source.name }}</strong>
        <span v-if="source.mimeType">{{ source.mimeType }}</span>
      </div>
      <div class="a-file-preview__actions">
        <template v-if="canZoom">
          <AIconButton
            icon="remove"
            label="Alejar"
            :disabled="boundedZoom <= minZoom"
            @click="updateZoom(zoom - zoomStep)"
          />
          <output class="a-file-preview__zoom" aria-live="polite">{{ Math.round(boundedZoom * 100) }}%</output>
          <AIconButton
            icon="add"
            label="Acercar"
            :disabled="boundedZoom >= maxZoom"
            @click="updateZoom(zoom + zoomStep)"
          />
          <AIconButton icon="fit_screen" label="Restablecer zoom" @click="updateZoom(1)" />
        </template>
        <slot name="actions" />
        <AButton
          v-if="source.downloadUrl"
          label="Descargar"
          icon="download"
          type="secondary"
          @click="emit('download', source)"
        />
      </div>
    </header>

    <div class="a-file-preview__stage">
      <ASkeleton v-if="state === 'loading'" width="100%" height="100%" />
      <AErrorState
        v-else-if="state === 'error' || mediaFailed"
        :title="errorTitle"
        :description="errorDescription"
        retry-label="Reintentar"
        @retry="mediaFailed = false; emit('retry')"
      />
      <img
        v-else-if="source.kind === 'image' && source.src"
        class="a-file-preview__image"
        :src="source.src"
        :alt="source.alt || source.name"
        decoding="async"
        referrerpolicy="no-referrer"
        :style="{ transform: `scale(${boundedZoom})` }"
        @load="emit('load', source)"
        @error="mediaFailed = true; emit('error', source)"
      >
      <iframe
        v-else-if="source.kind === 'pdf' && source.src"
        class="a-file-preview__document"
        :src="source.src"
        :title="`PDF: ${source.name}`"
        sandbox=""
        referrerpolicy="no-referrer"
        @load="emit('load', source)"
      />
      <video
        v-else-if="source.kind === 'video' && source.src"
        class="a-file-preview__media"
        :src="source.src"
        controls
        playsinline
        preload="metadata"
        @loadeddata="emit('load', source)"
        @error="mediaFailed = true; emit('error', source)"
      >
        <track v-if="captionsSrc" kind="captions" :src="captionsSrc" srclang="es" :label="captionsLabel" default>
      </video>
      <audio
        v-else-if="source.kind === 'audio' && source.src"
        class="a-file-preview__audio"
        :src="source.src"
        controls
        preload="metadata"
        @loadeddata="emit('load', source)"
        @error="mediaFailed = true; emit('error', source)"
      />
      <div v-else class="a-file-preview__fallback">
        <AIcon name="draft" size="xlarge" />
        <strong>Vista previa no disponible</strong>
        <p>Descarga el archivo para abrirlo en una aplicación compatible.</p>
        <AButton
          v-if="source.downloadUrl"
          label="Descargar archivo"
          icon="download"
          @click="emit('download', source)"
        />
      </div>
    </div>

    <dl v-if="source.metadata?.length" class="a-file-preview__metadata">
      <div v-for="entry in source.metadata" :key="entry.label">
        <dt>{{ entry.label }}</dt>
        <dd>{{ entry.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.a-file-preview {
  display: grid;
  grid-template-rows: auto minmax(var(--a-layout-preview-min), 1fr) auto;
  min-width: 0;
  min-height: var(--a-layout-preview-min);
  overflow: hidden;
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-surface);
  color: var(--a-text-primary);
}
.a-file-preview__toolbar {
  display: flex;
  gap: var(--a-space-4);
  align-items: center;
  justify-content: space-between;
  padding: var(--a-space-3);
  border-bottom: var(--a-border-width) solid var(--a-border);
}
.a-file-preview__toolbar > div:first-child { display: grid; gap: var(--a-space-1); min-width: 0; }
.a-file-preview__toolbar strong,
.a-file-preview__toolbar span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.a-file-preview__toolbar span {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}
.a-file-preview__actions {
  display: flex;
  gap: var(--a-space-1);
  align-items: center;
  flex-wrap: wrap;
}
.a-file-preview__zoom {
  min-width: var(--a-target-min);
  color: var(--a-text-secondary);
  font: var(--a-font-size-xs) var(--a-font-mono);
  text-align: center;
}
.a-file-preview__stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: var(--a-layout-preview-min);
  overflow: auto;
  background: var(--a-bg-muted);
}
.a-file-preview__image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center;
  transition: transform var(--a-motion-base);
}
.a-file-preview__document,
.a-file-preview__media {
  width: 100%;
  height: 100%;
  min-height: var(--a-layout-preview-min);
  border: 0;
}
.a-file-preview__media { background: var(--a-text-primary); }
.a-file-preview__audio { width: min(100%, var(--a-layout-field-sm)); }
.a-file-preview__fallback {
  display: grid;
  gap: var(--a-space-3);
  justify-items: center;
  max-width: var(--a-layout-copy);
  padding: var(--a-space-8);
  color: var(--a-text-secondary);
  text-align: center;
}
.a-file-preview__fallback strong { color: var(--a-text-primary); }
.a-file-preview__fallback p { margin: var(--a-space-0); }
.a-file-preview__metadata {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--a-layout-search-min), 1fr));
  gap: var(--a-space-3);
  margin: var(--a-space-0);
  padding: var(--a-space-3);
  border-top: var(--a-border-width) solid var(--a-border);
}
.a-file-preview__metadata div { display: grid; gap: var(--a-space-1); }
.a-file-preview__metadata dt {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}
.a-file-preview__metadata dd { margin: var(--a-space-0); font-size: var(--a-font-size-sm); }
@media (max-width: 42rem) {
  .a-file-preview__toolbar { align-items: stretch; flex-direction: column; }
  .a-file-preview__actions { justify-content: space-between; }
}
@media (prefers-reduced-motion: reduce) {
  .a-file-preview__image { transition: none; }
}
</style>
