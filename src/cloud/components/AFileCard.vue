<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AFacepile from '../../components/AFacepile.vue'
import AIcon from '../../components/AIcon.vue'
import AIconButton from '../../components/AIconButton.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import type { ACloudItem, ACloudVisibility } from '../types'

const props = withDefaults(defineProps<{
  item: ACloudItem
  selected?: boolean
  loading?: boolean
  disabled?: boolean
  selectable?: boolean
  showFavorite?: boolean
  showMenu?: boolean
}>(), {
  loading: false,
  disabled: false,
  selectable: true,
  showFavorite: true,
  showMenu: true
})

const emit = defineEmits<{
  open: [item: ACloudItem]
  select: [item: ACloudItem, selected: boolean]
  favorite: [item: ACloudItem, favorite: boolean]
  menu: [item: ACloudItem, event: MouseEvent]
  focus: [item: ACloudItem]
}>()

const thumbnailFailed = ref(false)
const isSelected = computed(() => props.selected ?? props.item.selected ?? false)
const itemDisabled = computed(() => props.disabled || props.item.disabled)
const visibilityCopy: Record<ACloudVisibility, string> = {
  private: 'Privado',
  shared: 'Compartido',
  link: 'Con enlace'
}

const resolvedIcon = computed(() => {
  if (props.item.icon) return props.item.icon
  if (props.item.kind === 'folder') return 'folder'
  if (props.item.mimeType?.startsWith('image/')) return 'image'
  if (props.item.mimeType?.startsWith('video/')) return 'movie'
  if (props.item.mimeType === 'application/pdf') return 'picture_as_pdf'
  return 'description'
})

const handleMenu = (event: Event) => {
  event.preventDefault()
  if (!itemDisabled.value) emit('menu', props.item, event as MouseEvent)
}

watch(() => props.item.kind === 'file' ? props.item.thumbnailUrl : undefined, () => {
  thumbnailFailed.value = false
})
</script>

<template>
  <article
    class="a-file-card"
    :class="{
      'a-file-card--selected': isSelected,
      'a-file-card--disabled': itemDisabled,
      'a-file-card--loading': loading
    }"
    :aria-busy="loading"
    @contextmenu="handleMenu"
  >
    <template v-if="loading">
      <ASkeleton class="a-file-card__preview" height="100%" />
      <ASkeleton width="72%" />
      <ASkeleton width="48%" />
      <span class="a-visually-hidden">Cargando elemento</span>
    </template>

    <template v-else>
      <div class="a-file-card__top">
        <label v-if="selectable" class="a-file-card__select">
          <input
            type="checkbox"
            :checked="isSelected"
            :disabled="itemDisabled"
            :aria-label="`Seleccionar ${item.name}`"
            @change="emit('select', item, ($event.target as HTMLInputElement).checked)"
          >
          <span aria-hidden="true"><AIcon name="check" /></span>
        </label>
        <span v-else />
        <div class="a-file-card__actions">
          <AIconButton
            v-if="showFavorite"
            :icon="item.favorite ? 'star' : 'star_outline'"
            :label="item.favorite ? `Quitar ${item.name} de favoritos` : `Añadir ${item.name} a favoritos`"
            size="small"
            :aria-pressed="Boolean(item.favorite)"
            :disabled="itemDisabled"
            @click="emit('favorite', item, !item.favorite)"
          />
          <slot name="menu" :item="item">
            <AIconButton
              v-if="showMenu"
              icon="more_horiz"
              :label="`Acciones para ${item.name}`"
              size="small"
              :disabled="itemDisabled"
              @click="handleMenu"
            />
          </slot>
        </div>
      </div>

      <button
        type="button"
        class="a-file-card__open"
        :disabled="itemDisabled"
        @click="emit('open', item)"
        @focus="emit('focus', item)"
      >
        <span class="a-file-card__preview">
          <img
            v-if="item.kind === 'file' && item.thumbnailUrl && !thumbnailFailed"
            :src="item.thumbnailUrl"
            alt=""
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="thumbnailFailed = true"
          >
          <span v-else class="a-file-card__fallback" aria-hidden="true"><AIcon :name="resolvedIcon" size="large" /></span>
        </span>
        <span class="a-file-card__copy">
          <strong>{{ item.name }}</strong>
          <span>{{ item.activityLabel || (item.kind === 'folder' ? `${item.itemCount ?? 0} elementos` : item.sizeLabel) }}</span>
        </span>
      </button>

      <footer class="a-file-card__meta">
        <span v-if="item.visibility" class="a-file-card__visibility">
          <AIcon :name="item.visibility === 'private' ? 'lock' : item.visibility === 'link' ? 'link' : 'group'" size="small" />
          {{ visibilityCopy[item.visibility] }}
        </span>
        <AFacepile
          v-if="item.collaborators?.length"
          :people="item.collaborators"
          :max-displayed="3"
          size="medium"
        />
      </footer>
    </template>
  </article>
</template>

<style scoped>
.a-file-card {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: var(--a-space-3);
  min-width: 0;
  min-height: calc(var(--a-layout-stat-min) + var(--a-space-16));
  padding: var(--a-space-3);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-surface);
  color: var(--a-text-primary);
  transition: transform var(--a-motion-base), border-color var(--a-motion-base), box-shadow var(--a-motion-base);
}
.a-file-card:hover {
  border-color: var(--a-border-strong);
  box-shadow: var(--a-shadow-1);
  transform: translateY(calc(var(--a-space-1) * -1));
}
.a-file-card--selected {
  border-color: var(--a-focus-ring);
  background: var(--a-bg-selected);
}
.a-file-card--disabled {
  opacity: var(--a-opacity-disabled);
}
.a-file-card__top,
.a-file-card__actions,
.a-file-card__meta {
  display: flex;
  gap: var(--a-space-1);
  align-items: center;
  justify-content: space-between;
}
.a-file-card__select {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  cursor: pointer;
}
.a-file-card__select input {
  position: absolute;
  inset: var(--a-space-0);
  width: 100%;
  height: 100%;
  margin: var(--a-space-0);
  opacity: 0;
  cursor: inherit;
}
.a-file-card__select > span {
  display: grid;
  place-items: center;
  width: var(--a-icon-lg);
  height: var(--a-icon-lg);
  border: var(--a-border-width-strong) solid var(--a-border-strong);
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-raised);
  color: transparent;
  pointer-events: none;
}
.a-file-card__select input:checked + span {
  border-color: var(--a-primary);
  background: var(--a-primary);
  color: var(--a-text-inverse);
}
.a-file-card__select:has(input:focus-visible) {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
  border-radius: var(--a-radius-xs);
  box-shadow: var(--a-shadow-focus);
}
.a-file-card__open {
  display: grid;
  gap: var(--a-space-3);
  min-width: 0;
  min-height: var(--a-target-min);
  padding: var(--a-space-0);
  border: 0;
  background: transparent;
  color: inherit;
  text-align: start;
  cursor: pointer;
}
.a-file-card__open:disabled { cursor: not-allowed; }
.a-file-card__preview {
  display: grid;
  place-items: center;
  overflow: hidden;
  min-height: calc(var(--a-control-lg) * 2);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-muted);
}
.a-file-card__preview img {
  width: 100%;
  height: 100%;
  max-height: calc(var(--a-layout-stat-min) + var(--a-space-6));
  object-fit: cover;
}
.a-file-card__fallback {
  display: grid;
  place-items: center;
  width: var(--a-control-lg);
  height: var(--a-control-lg);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-raised);
  color: var(--a-primary);
  box-shadow: var(--a-shadow-1);
}
.a-file-card__copy { display: grid; gap: var(--a-space-1); min-width: 0; }
.a-file-card__copy strong {
  overflow: hidden;
  font-size: var(--a-font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.a-file-card__copy span,
.a-file-card__visibility {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}
.a-file-card__visibility {
  display: inline-flex;
  gap: var(--a-space-1);
  align-items: center;
}
.a-file-card--loading { align-content: start; }
@media (prefers-reduced-motion: reduce) {
  .a-file-card { transition: none; }
  .a-file-card:hover { transform: none; }
}
</style>
