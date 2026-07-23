<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AIcon from '../../components/AIcon.vue'
import AIconButton from '../../components/AIconButton.vue'
import type { ACloudMedia } from '../types'

const props = withDefaults(defineProps<{
  media: ACloudMedia
  selected?: boolean
  selectable?: boolean
  disabled?: boolean
  showMenu?: boolean
}>(), {
  selectable: true,
  disabled: false,
  showMenu: true
})

const emit = defineEmits<{
  open: [media: ACloudMedia]
  select: [media: ACloudMedia, selected: boolean]
  menu: [media: ACloudMedia, event: MouseEvent]
  focus: [media: ACloudMedia]
}>()

const failed = ref(false)
const isSelected = computed(() => props.selected ?? props.media.selected ?? false)
const isDisabled = computed(() => props.disabled || props.media.disabled)

const handleMenu = (event: Event) => {
  event.preventDefault()
  if (!isDisabled.value) emit('menu', props.media, event as MouseEvent)
}

watch(() => props.media.thumbnailUrl, () => {
  failed.value = false
})
</script>

<template>
  <article
    class="a-photo-tile"
    :class="{ 'a-photo-tile--selected': isSelected, 'a-photo-tile--disabled': isDisabled }"
    @contextmenu="handleMenu"
  >
    <button
      type="button"
      class="a-photo-tile__open"
      :aria-label="`Abrir ${media.name}`"
      :disabled="isDisabled"
      @click="emit('open', media)"
      @focus="emit('focus', media)"
    >
      <img
        v-if="!failed"
        :src="media.thumbnailUrl"
        :alt="media.alt"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
        @error="failed = true"
      >
      <span v-else class="a-photo-tile__fallback" role="img" :aria-label="`Vista previa no disponible para ${media.name}`">
        <AIcon name="broken_image" size="large" />
      </span>
    </button>

    <div class="a-photo-tile__top">
      <label v-if="selectable" class="a-photo-tile__select">
        <input
          type="checkbox"
          :checked="isSelected"
          :disabled="isDisabled"
          :aria-label="`Seleccionar ${media.name}`"
          @change="emit('select', media, ($event.target as HTMLInputElement).checked)"
        >
        <span aria-hidden="true"><AIcon name="check" /></span>
      </label>
      <span v-else />
      <slot name="menu" :media="media">
        <AIconButton
          v-if="showMenu"
          icon="more_horiz"
          :label="`Acciones para ${media.name}`"
          size="small"
          :disabled="isDisabled"
          @click="handleMenu"
        />
      </slot>
    </div>

    <footer class="a-photo-tile__meta">
      <strong>{{ media.name }}</strong>
      <span>{{ [media.dateLabel, media.albumLabel].filter(Boolean).join(' · ') }}</span>
    </footer>
  </article>
</template>

<style scoped>
.a-photo-tile {
  position: relative;
  display: grid;
  overflow: hidden;
  min-width: 0;
  min-height: var(--a-layout-media-min);
  aspect-ratio: 1;
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-muted);
  color: var(--a-text-primary);
}
.a-photo-tile--selected {
  border-color: var(--a-focus-ring);
  box-shadow: var(--a-shadow-focus);
}
.a-photo-tile--disabled { opacity: var(--a-opacity-disabled); }
.a-photo-tile__open {
  position: absolute;
  inset: var(--a-space-0);
  width: 100%;
  height: 100%;
  padding: var(--a-space-0);
  border: 0;
  background: transparent;
  cursor: pointer;
}
.a-photo-tile__open img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--a-motion-slow);
}
.a-photo-tile__open:hover img { transform: scale(1.035); }
.a-photo-tile__fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--a-text-secondary);
}
.a-photo-tile__top,
.a-photo-tile__meta {
  position: relative;
  z-index: var(--a-z-base);
  pointer-events: none;
}
.a-photo-tile__top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  padding: var(--a-space-2);
}
.a-photo-tile__top > * { pointer-events: auto; }
.a-photo-tile__select {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  cursor: pointer;
}
.a-photo-tile__select input {
  position: absolute;
  inset: var(--a-space-0);
  width: 100%;
  height: 100%;
  margin: var(--a-space-0);
  opacity: 0;
}
.a-photo-tile__select span {
  display: grid;
  place-items: center;
  width: var(--a-icon-lg);
  height: var(--a-icon-lg);
  border: var(--a-border-width-strong) solid var(--a-border-strong);
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-raised);
  color: transparent;
}
.a-photo-tile__select input:checked + span {
  border-color: var(--a-primary);
  background: var(--a-primary);
  color: var(--a-text-inverse);
}
.a-photo-tile__select:has(input:focus-visible) {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
  border-radius: var(--a-radius-xs);
  box-shadow: var(--a-shadow-focus);
}
.a-photo-tile__meta {
  align-self: end;
  display: grid;
  gap: var(--a-space-1);
  margin-top: auto;
  padding: var(--a-space-6) var(--a-space-3) var(--a-space-3);
  background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--a-text-primary) 88%, transparent));
  color: var(--a-text-inverse);
}
.a-photo-tile__meta strong,
.a-photo-tile__meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.a-photo-tile__meta strong { font-size: var(--a-font-size-sm); }
.a-photo-tile__meta span { font-size: var(--a-font-size-xs); }
@media (prefers-reduced-motion: reduce) {
  .a-photo-tile__open img { transition: none; }
  .a-photo-tile__open:hover img { transform: none; }
}
</style>
