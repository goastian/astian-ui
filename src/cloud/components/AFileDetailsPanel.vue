<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

import ADrawer from '../../components/ADrawer.vue'
import AEmptyState from '../../components/AEmptyState.vue'
import AErrorState from '../../components/AErrorState.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import type { ALoadState } from '../../types/core'
import type {
  ACloudItem,
  AFileDetailsSection,
  AFileDetailsSectionSpec
} from '../types'

type CloseReason = 'escape' | 'outside' | 'close-button'

interface MetadataEntry {
  label: string
  value: string
}

const open = defineModel<boolean>({ default: false })
const activeSection = defineModel<AFileDetailsSection>('activeSection', { default: 'details' })

const props = withDefaults(defineProps<{
  item?: ACloudItem | null
  sections?: AFileDetailsSectionSpec[]
  state?: ALoadState
  modal?: boolean
  title?: string
  description?: string
  label?: string
  closeLabel?: string
  disabled?: boolean
  retrying?: boolean
  errorTitle?: string
  errorDescription?: string
  emptyTitle?: string
  emptyDescription?: string
  sectionsLabel?: string
}>(), {
  item: null,
  sections: () => [
    { id: 'details', label: 'Detalles', icon: 'info' },
    { id: 'tags', label: 'Etiquetas', icon: 'label' },
    { id: 'permissions', label: 'Permisos', icon: 'group' },
    { id: 'comments', label: 'Comentarios', icon: 'comment' },
    { id: 'versions', label: 'Versiones', icon: 'history' },
    { id: 'activity', label: 'Actividad', icon: 'timeline' }
  ],
  state: 'ready',
  modal: true,
  label: 'Detalles del archivo',
  closeLabel: 'Cerrar detalles',
  disabled: false,
  retrying: false,
  errorTitle: 'No se pudieron cargar los detalles',
  errorDescription: 'Reintenta para consultar la información actualizada.',
  emptyTitle: 'No hay un elemento seleccionado',
  emptyDescription: 'Selecciona un archivo o una carpeta para ver sus detalles.',
  sectionsLabel: 'Secciones de detalles'
})

const emit = defineEmits<{
  close: [reason: CloseReason]
  retry: []
  sectionChange: [section: AFileDetailsSection]
}>()

const instanceId = useId()
const tabs = ref<HTMLElement | null>(null)
const panelTitle = computed(() => props.title ?? props.item?.name ?? 'Detalles')
const panelDescription = computed(() => props.description ?? props.item?.activityLabel)
const enabledSections = computed(() => props.sections.filter((section) => !section.disabled))
const currentSection = computed(() =>
  props.sections.find((section) => section.id === activeSection.value) ?? null
)

const visibilityLabels: Record<NonNullable<ACloudItem['visibility']>, string> = {
  private: 'Privado',
  shared: 'Compartido',
  link: 'Compartido mediante enlace'
}

const metadata = computed<MetadataEntry[]>(() => {
  const item = props.item
  if (!item) return []

  const entries: Array<MetadataEntry | null> = [
    {
      label: 'Tipo',
      value: item.kind === 'folder' ? 'Carpeta' : (item.mimeType ?? 'Archivo')
    },
    item.kind === 'file' && item.sizeLabel
      ? { label: 'Tamaño', value: item.sizeLabel }
      : null,
    item.kind === 'folder' && item.itemCount !== undefined
      ? {
          label: 'Elementos',
          value: new Intl.NumberFormat().format(item.itemCount)
        }
      : null,
    item.visibility
      ? { label: 'Visibilidad', value: visibilityLabels[item.visibility] }
      : null,
    item.kind === 'folder' && item.permissionLabel
      ? { label: 'Permiso', value: item.permissionLabel }
      : null,
    item.activityLabel
      ? { label: 'Actividad reciente', value: item.activityLabel }
      : null
  ]

  return entries.filter((entry): entry is MetadataEntry => entry !== null)
})

const emptySectionTitles: Record<AFileDetailsSection, string> = {
  details: 'No hay metadatos disponibles',
  tags: 'Este elemento no tiene etiquetas',
  permissions: 'No hay permisos para mostrar',
  comments: 'Todavía no hay comentarios',
  versions: 'No hay versiones disponibles',
  activity: 'Todavía no hay actividad'
}

const tabId = (section: AFileDetailsSection) => `a-file-details-tab-${instanceId}-${section}`
const panelId = (section: AFileDetailsSection) => `a-file-details-panel-${instanceId}-${section}`

const selectSection = (section: AFileDetailsSectionSpec, focus = false) => {
  if (section.disabled || props.disabled) return
  activeSection.value = section.id
  emit('sectionChange', section.id)

  if (focus) {
    void nextTick(() => {
      const buttons = tabs.value?.querySelectorAll<HTMLElement>('[role="tab"]')
      Array.from(buttons ?? [])
        .find((button) => button.id === tabId(section.id))
        ?.focus({ preventScroll: true })
    })
  }
}

const handleTabKeydown = (event: KeyboardEvent, section: AFileDetailsSectionSpec) => {
  const available = enabledSections.value
  const currentIndex = available.findIndex((candidate) => candidate.id === section.id)
  if (currentIndex < 0 || available.length === 0) return

  let nextIndex: number | null = null
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      nextIndex = (currentIndex + 1) % available.length
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      nextIndex = (currentIndex - 1 + available.length) % available.length
      break
    case 'Home':
      nextIndex = 0
      break
    case 'End':
      nextIndex = available.length - 1
      break
  }

  if (nextIndex === null) return
  event.preventDefault()
  selectSection(available[nextIndex], true)
}

const handleClose = (reason: CloseReason) => {
  emit('close', reason)
}

watch(
  [() => props.sections, activeSection],
  ([sections]) => {
    const current = sections.find((section) => section.id === activeSection.value)
    if (current && !current.disabled) return

    const fallback = sections.find((section) => !section.disabled)
    if (fallback) activeSection.value = fallback.id
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <ADrawer
    v-model="open"
    position="right"
    :modal="modal"
    :title="panelTitle"
    :description="panelDescription"
    :label="label"
    :close-label="closeLabel"
    @close="handleClose"
  >
    <div
      class="a-file-details-panel"
      :class="{ 'a-file-details-panel--disabled': disabled }"
      :aria-busy="state === 'loading' || retrying || undefined"
      :aria-disabled="disabled || undefined"
      :inert="disabled ? true : undefined"
    >
      <div
        v-if="state === 'loading'"
        class="a-file-details-panel__loading"
        role="status"
        aria-live="polite"
      >
        <span class="a-file-details-panel__sr-only">Cargando detalles</span>
        <div class="a-file-details-panel__loading-tabs" aria-hidden="true">
          <ASkeleton
            v-for="index in 3"
            :key="index"
            type="rect"
            width="var(--a-layout-search-min)"
            height="var(--a-target-min)"
          />
        </div>
        <ASkeleton type="text" width="38%" height="var(--a-space-5)" aria-hidden="true" />
        <ASkeleton
          v-for="index in 5"
          :key="`detail-${index}`"
          type="rect"
          width="100%"
          height="var(--a-control-lg)"
          aria-hidden="true"
        />
      </div>

      <AErrorState
        v-else-if="state === 'error'"
        compact
        :title="errorTitle"
        :description="errorDescription"
        retry-label="Reintentar"
        :retrying="retrying"
        :disabled="disabled"
        @retry="emit('retry')"
      />

      <AEmptyState
        v-else-if="state === 'empty' || !item"
        compact
        icon="drafts"
        :title="emptyTitle"
        :description="emptyDescription"
        :disabled="disabled"
        announce="polite"
      >
        <template v-if="$slots.emptyAction" #primary="{ disabled: actionDisabled }">
          <slot name="emptyAction" :disabled="actionDisabled" />
        </template>
      </AEmptyState>

      <template v-else>
        <div class="a-file-details-panel__summary">
          <div class="a-file-details-panel__item-icon" aria-hidden="true">
            <q-icon :name="item.icon ?? (item.kind === 'folder' ? 'folder' : 'draft')" />
          </div>
          <div class="a-file-details-panel__item-copy">
            <p class="a-file-details-panel__item-name">{{ item.name }}</p>
            <p v-if="item.activityLabel" class="a-file-details-panel__item-detail">
              {{ item.activityLabel }}
            </p>
          </div>
        </div>

        <div
          ref="tabs"
          class="a-file-details-panel__tabs"
          role="tablist"
          :aria-label="sectionsLabel"
          aria-orientation="horizontal"
        >
          <button
            v-for="section in sections"
            :id="tabId(section.id)"
            :key="section.id"
            class="a-file-details-panel__tab"
            :class="{ 'a-file-details-panel__tab--active': section.id === activeSection }"
            type="button"
            role="tab"
            :disabled="disabled || section.disabled"
            :aria-selected="section.id === activeSection"
            :aria-controls="panelId(section.id)"
            :tabindex="section.id === activeSection && !section.disabled ? 0 : -1"
            @click="selectSection(section)"
            @keydown="handleTabKeydown($event, section)"
          >
            <q-icon
              v-if="section.icon"
              class="a-file-details-panel__tab-icon"
              :name="section.icon"
              aria-hidden="true"
            />
            <span>{{ section.label }}</span>
            <span
              v-if="section.badge !== undefined"
              class="a-file-details-panel__badge"
              :aria-label="`${section.badge} en ${section.label}`"
            >
              {{ section.badge }}
            </span>
          </button>
        </div>

        <section
          v-if="currentSection"
          :id="panelId(currentSection.id)"
          class="a-file-details-panel__section"
          role="tabpanel"
          :aria-labelledby="tabId(currentSection.id)"
          tabindex="0"
        >
          <slot :name="activeSection" :item="item" :section="currentSection">
            <dl
              v-if="activeSection === 'details' && metadata.length"
              class="a-file-details-panel__metadata"
            >
              <div
                v-for="entry in metadata"
                :key="entry.label"
                class="a-file-details-panel__metadata-row"
              >
                <dt>{{ entry.label }}</dt>
                <dd>{{ entry.value }}</dd>
              </div>
            </dl>

            <ul
              v-else-if="activeSection === 'tags' && item.tags?.length"
              class="a-file-details-panel__tags"
              aria-label="Etiquetas del elemento"
            >
              <li v-for="tag in item.tags" :key="tag" class="a-file-details-panel__tag">
                <q-icon name="label" aria-hidden="true" />
                {{ tag }}
              </li>
            </ul>

            <AEmptyState
              v-else
              compact
              :title="emptySectionTitles[activeSection]"
              :heading-level="3"
              announce="polite"
            />
          </slot>
        </section>
      </template>
    </div>

    <template v-if="$slots.actions" #actions>
      <slot name="actions" :item="item" :disabled="disabled || retrying" />
    </template>
  </ADrawer>
</template>

<style scoped>
.a-file-details-panel {
  display: grid;
  gap: var(--a-space-5);
  min-width: var(--a-space-0);
  color: var(--a-text-primary);
}

.a-file-details-panel__loading {
  display: grid;
  gap: var(--a-space-3);
}

.a-file-details-panel__loading-tabs {
  display: flex;
  gap: var(--a-space-2);
  overflow: hidden;
}

.a-file-details-panel__summary {
  display: grid;
  grid-template-columns: var(--a-control-lg) minmax(0, 1fr);
  align-items: center;
  gap: var(--a-space-3);
}

.a-file-details-panel__item-icon {
  display: grid;
  place-items: center;
  width: var(--a-control-lg);
  height: var(--a-control-lg);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-muted);
  color: var(--a-text-secondary);
  font-size: var(--a-icon-lg);
}

.a-file-details-panel__item-copy {
  min-width: var(--a-space-0);
}

.a-file-details-panel__item-name,
.a-file-details-panel__item-detail {
  margin: var(--a-space-0);
}

.a-file-details-panel__item-name {
  overflow: hidden;
  font-size: var(--a-font-size-md);
  font-weight: var(--a-font-weight-semibold);
  line-height: var(--a-line-height-tight);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a-file-details-panel__item-detail {
  margin-block-start: var(--a-space-1);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.a-file-details-panel__tabs {
  display: flex;
  gap: var(--a-space-1);
  min-width: var(--a-space-0);
  overflow-x: auto;
  padding: var(--a-space-1);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-muted);
  scrollbar-width: thin;
}

.a-file-details-panel__tab {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  min-height: var(--a-target-min);
  border: var(--a-space-0);
  border-radius: var(--a-radius-sm);
  padding: var(--a-space-2) var(--a-space-3);
  background: transparent;
  color: var(--a-text-secondary);
  font: var(--a-font-weight-medium) var(--a-font-size-sm) / var(--a-line-height-tight) var(--a-font-sans);
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--a-motion-fast),
    color var(--a-motion-fast),
    box-shadow var(--a-motion-fast);
}

.a-file-details-panel__tab:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.a-file-details-panel__tab--active {
  background: var(--a-bg-surface);
  color: var(--a-primary);
  box-shadow: var(--a-shadow-1);
}

.a-file-details-panel__tab:focus-visible,
.a-file-details-panel__section:focus-visible {
  outline: none;
  box-shadow: var(--a-shadow-focus);
}

.a-file-details-panel__tab:disabled {
  opacity: var(--a-opacity-disabled);
  cursor: default;
}

.a-file-details-panel__tab-icon {
  font-size: var(--a-icon-sm);
}

.a-file-details-panel__badge {
  display: inline-grid;
  place-items: center;
  min-width: var(--a-space-5);
  min-height: var(--a-space-5);
  border-radius: var(--a-radius-round);
  padding-inline: var(--a-space-1);
  background: var(--a-bg-selected);
  color: var(--a-primary);
  font-size: var(--a-font-size-xs);
  font-variant-numeric: tabular-nums;
}

.a-file-details-panel__section {
  min-width: var(--a-space-0);
  border-radius: var(--a-radius-sm);
  outline: none;
}

.a-file-details-panel__metadata {
  display: grid;
  gap: var(--a-space-0);
  margin: var(--a-space-0);
}

.a-file-details-panel__metadata-row {
  display: grid;
  grid-template-columns: minmax(var(--a-layout-table-label), 1fr) minmax(0, 2fr);
  gap: var(--a-space-4);
  padding-block: var(--a-space-3);
  border-block-end: var(--a-border-width) solid var(--a-border);
}

.a-file-details-panel__metadata-row dt {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-medium);
}

.a-file-details-panel__metadata-row dd {
  min-width: var(--a-space-0);
  margin: var(--a-space-0);
  overflow-wrap: anywhere;
  color: var(--a-text-primary);
  font-size: var(--a-font-size-sm);
  text-align: end;
}

.a-file-details-panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--a-space-2);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}

.a-file-details-panel__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--a-space-1);
  min-height: var(--a-target-min);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-round);
  padding-inline: var(--a-space-3);
  background: var(--a-bg-muted);
  color: var(--a-text-primary);
  font-size: var(--a-font-size-sm);
}

.a-file-details-panel--disabled {
  opacity: var(--a-opacity-disabled);
  pointer-events: none;
}

.a-file-details-panel__sr-only {
  position: absolute;
  width: var(--a-space-1);
  height: var(--a-space-1);
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 30rem) {
  .a-file-details-panel {
    gap: var(--a-space-4);
  }

  .a-file-details-panel__metadata-row {
    grid-template-columns: 1fr;
    gap: var(--a-space-1);
  }

  .a-file-details-panel__metadata-row dd {
    text-align: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .a-file-details-panel__tab {
    transition: none;
  }
}
</style>
