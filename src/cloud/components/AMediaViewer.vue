<script setup lang="ts">
import { watch } from 'vue'

import AFilePreview from './AFilePreview.vue'
import AIconButton from '../../components/AIconButton.vue'
import type { ALoadState } from '../../types/core'
import type { AFilePreviewSource } from '../types'

const open = defineModel<boolean>({ default: false })
const zoom = defineModel<number>('zoom', { default: 1 })

const props = withDefaults(defineProps<{
  source: AFilePreviewSource
  state?: ALoadState
  closeLabel?: string
  hasPrevious?: boolean
  hasNext?: boolean
  persistent?: boolean
  captionsSrc?: string
}>(), {
  state: 'ready',
  closeLabel: 'Cerrar visor',
  hasPrevious: false,
  hasNext: false,
  persistent: false
})

const emit = defineEmits<{
  close: []
  previous: []
  next: []
  retry: []
  download: [source: AFilePreviewSource]
}>()

const closeViewer = () => {
  open.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  const target = event.target
  if (
    target instanceof Element
    && target.closest(
      'a[href], button, input, select, textarea, video, audio, [contenteditable="true"], [role="slider"], [role="spinbutton"], [role="combobox"], [role="menuitem"]'
    )
  ) return

  if (event.key === 'ArrowLeft' && props.hasPrevious) {
    event.preventDefault()
    emit('previous')
  } else if (event.key === 'ArrowRight' && props.hasNext) {
    event.preventDefault()
    emit('next')
  }
}

watch(() => props.source.id, () => { zoom.value = 1 })
</script>

<template>
  <q-dialog
    v-model="open"
    maximized
    :persistent="persistent"
    transition-show="fade"
    transition-hide="fade"
    @hide="$emit('close')"
  >
    <section class="a-media-viewer" :aria-label="`Visor: ${source.name}`" @keydown="handleKeydown">
      <header class="a-media-viewer__header">
        <AIconButton
          icon="close"
          :label="closeLabel"
          type="secondary"
          variant="filled"
          @click="closeViewer"
        />
        <strong>{{ source.name }}</strong>
        <div>
          <AIconButton
            icon="chevron_left"
            label="Elemento anterior"
            :disabled="!hasPrevious"
            @click="$emit('previous')"
          />
          <AIconButton
            icon="chevron_right"
            label="Elemento siguiente"
            :disabled="!hasNext"
            @click="$emit('next')"
          />
        </div>
      </header>
      <AFilePreview
        v-model:zoom="zoom"
        class="a-media-viewer__preview"
        :source="source"
        :state="state"
        :captions-src="captionsSrc"
        :show-toolbar="true"
        @retry="$emit('retry')"
        @download="$emit('download', source)"
      >
        <template #actions><slot name="actions" :source="source" /></template>
      </AFilePreview>
    </section>
  </q-dialog>
</template>

<style scoped>
.a-media-viewer {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100%;
  min-height: 100dvh;
  padding: var(--a-space-3);
  background: var(--a-bg-canvas);
  color: var(--a-text-primary);
}
.a-media-viewer__header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--a-space-3);
  align-items: center;
  min-height: var(--a-layout-header);
  padding-inline: var(--a-space-2);
}
.a-media-viewer__header strong {
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.a-media-viewer__header > div { display: flex; }
.a-media-viewer__preview {
  width: min(100%, var(--a-layout-viewer-max));
  height: calc(100dvh - var(--a-layout-header) - var(--a-space-6));
  margin-inline: auto;
}
@media (max-width: 32rem) {
  .a-media-viewer { padding: var(--a-space-0); }
  .a-media-viewer__header { grid-template-columns: auto minmax(0, 1fr); }
  .a-media-viewer__header > div { grid-column: 1 / -1; justify-content: center; }
  .a-media-viewer__preview { height: calc(100dvh - var(--a-layout-header) * 2); border-radius: var(--a-space-0); }
}
</style>
