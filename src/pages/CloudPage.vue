<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'

import {
  ACloudPageHeader,
  ACloudToolbar,
  AFileGrid,
  AFileTable,
  AStatCard
} from '@/cloud'
import type {
  ACloudDragPayload,
  ACloudDropState,
  ACloudDropTarget,
  ACloudItem,
  ACloudSortOption
} from '@/cloud'
import ABreadcrumbs from '@/components/ABreadcrumbs.vue'
import AButton from '@/components/AButton.vue'
import AContextMenu from '@/components/AContextMenu.vue'
import type {
  ABreadcrumbItem,
  AContextMenuItem,
  AId,
  ATableSort,
  AUploadQueueItem,
  AUploadStatus
} from '@/types/core'

const ADrawer = defineAsyncComponent(() => import('@/components/ADrawer.vue'))
const AFileUpload = defineAsyncComponent(() => import('@/components/AFileUpload.vue'))
const AUploadQueue = defineAsyncComponent(() => import('@/components/AUploadQueue.vue'))

const search = ref('')
const view = ref<'grid' | 'list'>('grid')
const sortChoice = ref<string | number | null>('activity')
const tableSort = ref<ATableSort | null>({ columnId: 'activity', direction: 'descending' })
const selectedIds = ref<AId[]>([])
const activeId = ref<AId | null>(null)
const uploadOpen = ref(false)
const uploadFiles = ref<File[]>([])
const uploadUrl = ref('')
const queue = ref<AUploadQueueItem[]>([])
const announcement = ref('')
const dropTarget = ref<ACloudDropTarget | null>(null)
const dropState = ref<ACloudDropState>('idle')
let dropResetTimer: ReturnType<typeof globalThis.setTimeout> | undefined

const breadcrumbs: ABreadcrumbItem[] = [
  { id: 'cloud', label: 'Cloud', to: '/cloud' },
  { id: 'files', label: 'Archivos', current: true }
]

const sortOptions: ACloudSortOption[] = [
  { id: 'activity', label: 'Actividad reciente', direction: 'descending' },
  { id: 'name-asc', label: 'Nombre A–Z', direction: 'ascending' },
  { id: 'name-desc', label: 'Nombre Z–A', direction: 'descending' }
]

const contextActions: AContextMenuItem[] = [
  { id: 'open', label: 'Abrir', icon: 'open_in_new' },
  { id: 'favorite', label: 'Cambiar favorito', icon: 'star_outline' },
  {
    id: 'organize',
    label: 'Organizar',
    icon: 'drive_file_move',
    children: [
      { id: 'move', label: 'Mover', icon: 'folder' },
      { id: 'copy', label: 'Copiar', icon: 'content_copy' }
    ]
  },
  { id: 'separator', separator: true },
  { id: 'delete', label: 'Mover a la papelera', icon: 'delete', destructive: true }
]

const items = ref<ACloudItem[]>([
  {
    id: 'strategy',
    kind: 'file',
    name: 'Estrategia producto 2026',
    mimeType: 'application/vnd.oasis.opendocument.text',
    size: 2_840_000,
    sizeLabel: '2,8 MB',
    activityLabel: 'Editado hace 12 min',
    visibility: 'shared',
    favorite: true,
    collaborators: [
      { id: 'lucia', name: 'Lucía Rivera', color: 'orange', active: true },
      { id: 'mina', name: 'Mina Park', color: 'blue', active: true }
    ]
  },
  {
    id: 'research',
    kind: 'folder',
    name: 'Research · navegación privada',
    itemCount: 18,
    activityLabel: 'Actualizado hoy',
    visibility: 'shared',
    permissionLabel: 'Puede editar',
    collaborators: [{ id: 'andres', name: 'Andrés Pardo', color: 'green', active: true }]
  },
  {
    id: 'visual-system',
    kind: 'file',
    name: 'Sistema visual Astian',
    mimeType: 'application/pdf',
    size: 12_400_000,
    sizeLabel: '12,4 MB',
    activityLabel: 'Editado ayer',
    visibility: 'private'
  },
  {
    id: 'launches',
    kind: 'file',
    name: 'Calendario de lanzamientos',
    mimeType: 'text/csv',
    size: 640_000,
    sizeLabel: '640 KB',
    activityLabel: 'Editado el 14 jul',
    visibility: 'shared',
    collaborators: [{ id: 'lucia', name: 'Lucía Rivera', color: 'orange' }]
  },
  {
    id: 'providers',
    kind: 'folder',
    name: 'Contratos proveedores',
    itemCount: 6,
    activityLabel: 'Actualizado el 10 jul',
    visibility: 'private',
    permissionLabel: 'Solo lectura'
  },
  {
    id: 'transparency',
    kind: 'file',
    name: 'Informe de transparencia',
    mimeType: 'application/pdf',
    size: 2_400_000,
    sizeLabel: '2,4 MB',
    activityLabel: 'Editado el 8 jul',
    visibility: 'link'
  }
])

const normalizedItems = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  const filtered = query
    ? items.value.filter((item) => (
      `${item.name} ${item.activityLabel ?? ''} ${item.kind}`.toLocaleLowerCase().includes(query)
    ))
    : [...items.value]

  const sort = tableSort.value
  if (!sort) return filtered

  const direction = sort.direction === 'ascending' ? 1 : -1
  const valueFor = (item: ACloudItem): string | number => {
    if (sort.columnId === 'name') return item.name
    if (sort.columnId === 'kind') return item.kind
    if (sort.columnId === 'activity') return item.activityLabel ?? ''
    if (sort.columnId === 'size') return item.kind === 'folder' ? item.itemCount ?? 0 : item.size ?? 0
    if (sort.columnId === 'visibility') return item.visibility ?? ''
    if (sort.columnId === 'collaborators') return item.collaborators?.length ?? 0
    return item.name
  }

  return filtered.sort((left: ACloudItem, right: ACloudItem) => {
    const leftValue = valueFor(left)
    const rightValue = valueFor(right)
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction
    }
    return String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: 'base' }) * direction
  })
})

watch(sortChoice, (value) => {
  if (value === 'name-asc') tableSort.value = { columnId: 'name', direction: 'ascending' }
  else if (value === 'name-desc') tableSort.value = { columnId: 'name', direction: 'descending' }
  else tableSort.value = { columnId: 'activity', direction: 'descending' }
})

const focusItem = (item: ACloudItem) => {
  activeId.value = item.id
}

const openItem = (item: ACloudItem) => {
  focusItem(item)
  announcement.value = `${item.name} listo para abrir`
}

const showItemMenu = (item: ACloudItem) => {
  focusItem(item)
}

const updateDropTarget = (target: ACloudDropTarget | null) => {
  if (dropState.value !== 'pending') dropTarget.value = target
}

const requestDrop = (payload: ACloudDragPayload) => {
  if (!payload.target) return
  dropTarget.value = payload.target
  dropState.value = 'pending'
  announcement.value = `Validando ${payload.effect === 'copy' ? 'copia' : 'movimiento'} de ${payload.sourceIds.length} elemento(s)`

  if (dropResetTimer) globalThis.clearTimeout(dropResetTimer)
  dropResetTimer = globalThis.setTimeout(() => {
    dropTarget.value = null
    dropState.value = 'idle'
    announcement.value = 'La referencia validó la intención sin modificar la colección'
    dropResetTimer = undefined
  }, 700)
}

const requestMove = (item: ACloudItem) => {
  focusItem(item)
  announcement.value = `Mover a… solicitado para ${item.name}`
}

const applyContextAction = (action: AContextMenuItem) => {
  const item = items.value.find((candidate) => candidate.id === activeId.value)
  if (!item || !action.label) return

  if (action.id === 'favorite') {
    items.value = items.value.map((candidate) => (
      candidate.id === item.id ? { ...candidate, favorite: !candidate.favorite } : candidate
    ))
  }
  announcement.value = `${action.label}: ${item.name}`
}

const setQueueStatus = (id: AId, status: AUploadStatus) => {
  queue.value = queue.value.map((item) => (
    item.id === id
      ? { ...item, status, error: status === 'error' ? item.error : undefined }
      : item
  ))
}

const enqueue = (payload: { files: readonly File[]; url?: string }) => {
  const now = Date.now()
  const fromFiles: AUploadQueueItem[] = payload.files.map((file, index) => ({
    id: `${now}-${index}`,
    name: file.name,
    size: file.size,
    progress: 0,
    status: 'queued'
  }))
  const fromUrl: AUploadQueueItem[] = payload.url
    ? [{
        id: `${now}-url`,
        name: payload.url,
        size: 0,
        progress: 0,
        status: 'queued'
      }]
    : []
  queue.value = [...queue.value, ...fromFiles, ...fromUrl]
  uploadFiles.value = []
  uploadUrl.value = ''
  announcement.value = `${fromFiles.length + fromUrl.length} elemento(s) añadido(s) a la cola`
}

onBeforeUnmount(() => {
  if (dropResetTimer) globalThis.clearTimeout(dropResetTimer)
})
</script>

<template>
  <main class="a-page cloud-page" aria-label="Astian Cloud">
    <ACloudPageHeader
      context="Astian Cloud / Archivos"
      title="Tu espacio de trabajo"
      description="8,7 GB de 25 GB utilizados · cifrado de extremo a extremo"
      primary-action-label="Nuevo"
      @primary="uploadOpen = true"
    >
      <template #breadcrumbs><ABreadcrumbs :items="breadcrumbs" /></template>
      <ACloudToolbar
        v-model:search="search"
        v-model:view="view"
        v-model:sort="sortChoice"
        :sort-options="sortOptions"
        @create="uploadOpen = true"
        @filters="announcement = 'Filtros solicitados'"
      />
    </ACloudPageHeader>

    <div class="cloud-page__workbench">
      <section class="cloud-page__collection" aria-labelledby="cloud-recents-title">
        <div class="cloud-page__section-title">
          <div>
            <h2 id="cloud-recents-title">Recientes</h2>
            <p>Archivos que abriste o editaste</p>
          </div>
          <span>{{ selectedIds.length }} seleccionados</span>
        </div>

        <AContextMenu :items="contextActions" @select="applyContextAction">
          <AFileGrid
            v-if="view === 'grid'"
            v-model:selected-ids="selectedIds"
            v-model:active-id="activeId"
            :items="normalizedItems"
            :state="normalizedItems.length ? 'ready' : 'empty'"
            selection-interaction="marquee"
            dnd
            source-container-id="root"
            :drop-target="dropTarget"
            :drop-state="dropState"
            @open="openItem"
            @menu="showItemMenu"
            @favorite="(item, favorite) => items = items.map((entry) => entry.id === item.id ? { ...entry, favorite } : entry)"
            @drop-target-change="updateDropTarget"
            @drop-request="requestDrop"
            @move-request="requestMove"
          >
            <template #empty-actions>
              <AButton label="Añadir archivo" icon="add" @click="uploadOpen = true" />
            </template>
          </AFileGrid>
          <AFileTable
            v-else
            v-model:selected-ids="selectedIds"
            v-model:active-id="activeId"
            v-model:sort="tableSort"
            :items="normalizedItems"
            :state="normalizedItems.length ? 'ready' : 'empty'"
            dnd
            source-container-id="root"
            :drop-target="dropTarget"
            :drop-state="dropState"
            @open="openItem"
            @menu="showItemMenu"
            @drop-target-change="updateDropTarget"
            @drop-request="requestDrop"
            @move-request="requestMove"
          >
            <template #empty>
              <AButton label="Añadir archivo" icon="add" @click="uploadOpen = true" />
            </template>
          </AFileTable>
        </AContextMenu>
      </section>

      <aside class="cloud-page__stats" aria-label="Resumen del espacio">
        <AStatCard
          label="Almacenamiento"
          value="8,7 GB"
          detail="16,3 GB disponibles"
          icon="cloud"
          :progress="34.8"
        />
        <AStatCard
          label="Actividad"
          value="27 cambios"
          detail="Esta semana, 11 compartidos"
          icon="history"
          status="info"
          trend-label="8 más que la semana pasada"
        />
        <AStatCard
          label="Equipo"
          value="3 personas"
          detail="Activas ahora"
          icon="group"
          status="positive"
        />
      </aside>
    </div>

    <p class="a-visually-hidden" aria-live="polite">{{ announcement }}</p>

    <ADrawer
      v-if="uploadOpen"
      v-model="uploadOpen"
      title="Añadir a Astian Cloud"
      description="Astian UI valida y presenta; Astian Cloud decide cómo transportar y cifrar."
      initial-focus=".a-dropzone__picker"
    >
      <AFileUpload
        v-model="uploadFiles"
        v-model:url="uploadUrl"
        label="Arrastra archivos o abre el selector"
        description="PDF, imágenes y documentos de hasta 50 MB"
        accept=".pdf,image/*,.odt,.csv"
        :max-size="50_000_000"
        :max-files="12"
        allow-url
        @submit="enqueue"
      />
      <AUploadQueue
        v-if="queue.length"
        class="cloud-page__queue"
        :items="queue"
        clear-completed
        @pause="setQueueStatus($event, 'paused')"
        @resume="setQueueStatus($event, 'uploading')"
        @retry="setQueueStatus($event, 'queued')"
        @cancel="setQueueStatus($event, 'cancelled')"
        @clear-completed="queue = queue.filter((item) => item.status !== 'success')"
      />
    </ADrawer>
  </main>
</template>

<style scoped>
/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
.cloud-page {
  min-width: var(--a-space-0);
  padding-block-end: var(--space-xl);
}

.cloud-page :deep(.a-cloud-page-header) {
  gap: var(--space-sm);
  padding-block: var(--space-lg) var(--space-md);
}

.cloud-page :deep(.a-cloud-page-header__context) {
  gap: var(--space-xs);
}

.cloud-page :deep(.a-cloud-page-header__title) {
  align-items: center;
}

.cloud-page :deep(.a-cloud-page-header h1) {
  max-width: none;
  font-size: var(--text-2xl);
  font-weight: var(--a-font-weight-medium);
  letter-spacing: var(--a-letter-spacing-heading);
}

.cloud-page :deep(.a-cloud-page-header p) {
  margin-block-start: var(--space-xs);
  font-size: var(--text-sm);
}

.cloud-page :deep(.a-cloud-toolbar) {
  gap: var(--space-xs);
  padding: var(--space-xs);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--radius-lg);
  background: var(--a-bg-surface);
}

.cloud-page__workbench {
  display: grid;
  grid-template-columns: minmax(var(--a-space-0), 1fr) var(--a-layout-nav);
  gap: var(--space-xl);
  align-items: start;
  padding-block-start: var(--space-md);
}

.cloud-page__stats {
  display: grid;
  position: sticky;
  top: calc(var(--a-layout-header) + var(--space-lg));
  gap: var(--space-lg);
  min-width: var(--a-space-0);
  padding-inline-start: var(--space-lg);
  border-inline-start: var(--a-border-width) solid var(--a-border);
}

.cloud-page__stats :deep(.a-stat-card) {
  gap: var(--space-xs);
  min-height: var(--a-space-0);
  padding: var(--a-space-0) var(--a-space-0) var(--space-lg);
  border: var(--a-space-0);
  border-bottom: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-space-0);
  background: transparent;
}

.cloud-page__stats :deep(.a-stat-card__value) {
  font-size: var(--text-xl);
}

.cloud-page__stats :deep(.a-stat-card__icon) {
  width: var(--a-target-min);
  height: var(--a-target-min);
}

.cloud-page__collection {
  display: grid;
  gap: var(--space-md);
  min-width: var(--a-space-0);
}

.cloud-page__section-title {
  display: flex;
  gap: var(--space-md);
  align-items: end;
  justify-content: space-between;
  padding-block-end: var(--space-sm);
  border-block-end: var(--a-border-width) solid var(--a-border);
}

.cloud-page__section-title h2,
.cloud-page__section-title p {
  margin: var(--a-space-0);
}

.cloud-page__section-title h2 {
  font-size: var(--text-lg);
  font-weight: var(--a-font-weight-semibold);
  letter-spacing: var(--a-letter-spacing-heading);
}

.cloud-page__section-title p,
.cloud-page__section-title > span {
  color: var(--a-text-secondary);
  font-size: var(--text-sm);
}

.cloud-page__section-title p {
  margin-top: var(--space-2xs);
}

.cloud-page__section-title > span {
  flex: none;
  font-family: var(--font-mono);
  white-space: nowrap;
}

.cloud-page__queue {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: var(--a-border-width) solid var(--a-border);
}

@media (max-width: 72rem) {
  .cloud-page__workbench {
    grid-template-columns: minmax(var(--a-space-0), 1fr);
    gap: var(--space-xl);
  }

  .cloud-page__stats {
    position: static;
    grid-template-columns: repeat(3, minmax(var(--a-space-0), 1fr));
    gap: var(--space-md);
    padding-block-start: var(--space-lg);
    padding-inline-start: var(--a-space-0);
    border-block-start: var(--a-border-width) solid var(--a-border);
    border-inline-start: var(--a-space-0);
  }
}

@media (max-width: 48rem) {
  .cloud-page :deep(.a-cloud-page-header__title) {
    align-items: stretch;
  }

  .cloud-page__stats {
    grid-template-columns: minmax(var(--a-space-0), 1fr);
  }
}

@media (max-width: 36rem) {
  .cloud-page :deep(.a-cloud-page-header h1) {
    overflow-wrap: anywhere;
  }

  .cloud-page__workbench {
    gap: var(--space-lg);
  }

  .cloud-page__section-title {
    align-items: start;
    flex-direction: column;
    gap: var(--space-xs);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cloud-page :deep(.a-file-card:hover),
  .cloud-page :deep(.a-file-card:active) {
    transform: none;
  }
}
</style>
