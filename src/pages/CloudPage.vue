<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import {
  ACloudPageHeader,
  ACloudToolbar,
  AFileGrid,
  AFileTable,
  AStatCard
} from '@/cloud'
import type { ACloudItem, ACloudSortOption } from '@/cloud'
import {
  ABreadcrumbs,
  AButton,
  AContextMenu,
  ADrawer,
  AFileUpload,
  AUploadQueue
} from '@/components'
import type {
  ABreadcrumbItem,
  AContextMenuItem,
  AId,
  ATableSort,
  AUploadQueueItem,
  AUploadStatus
} from '@/types/core'

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
</script>

<template>
  <q-page class="a-page cloud-page">
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

    <section class="cloud-page__stats" aria-label="Resumen del espacio">
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
    </section>

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
          @open="openItem"
          @menu="showItemMenu"
          @favorite="(item, favorite) => items = items.map((entry) => entry.id === item.id ? { ...entry, favorite } : entry)"
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
          @open="openItem"
          @menu="showItemMenu"
        >
          <template #empty>
            <AButton label="Añadir archivo" icon="add" @click="uploadOpen = true" />
          </template>
        </AFileTable>
      </AContextMenu>
    </section>

    <p class="a-visually-hidden" aria-live="polite">{{ announcement }}</p>

    <ADrawer
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
  </q-page>
</template>

<style scoped>
.cloud-page__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--a-space-3);
  padding-block: var(--a-space-4) var(--a-space-10);
}

.cloud-page__collection {
  display: grid;
  gap: var(--a-space-4);
}

.cloud-page__section-title {
  display: flex;
  gap: var(--a-space-4);
  align-items: end;
  justify-content: space-between;
}

.cloud-page__section-title h2,
.cloud-page__section-title p {
  margin: var(--a-space-0);
}

.cloud-page__section-title h2 {
  font-size: var(--a-font-size-xl);
  letter-spacing: var(--a-letter-spacing-heading);
}

.cloud-page__section-title p,
.cloud-page__section-title > span {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}

.cloud-page__section-title p {
  margin-top: var(--a-space-1);
}

.cloud-page__queue {
  margin-top: var(--a-space-6);
  padding-top: var(--a-space-6);
  border-top: var(--a-border-width) solid var(--a-border);
}

@media (max-width: 56rem) {
  .cloud-page__stats {
    grid-template-columns: 1fr 1fr;
  }

  .cloud-page__stats > :first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 36rem) {
  .cloud-page__stats {
    grid-template-columns: 1fr;
  }

  .cloud-page__stats > :first-child {
    grid-column: auto;
  }

  .cloud-page__section-title {
    align-items: start;
    flex-direction: column;
  }
}
</style>
