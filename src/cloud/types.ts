import type { AId, ALoadState, AStatus } from '../types/core'
import type { AstianPerson } from '../types/ui'

export type ACloudViewMode = 'grid' | 'list'

export type ACloudVisibility = 'private' | 'shared' | 'link'

export type ACloudDropPosition = 'before' | 'inside' | 'after'

export type ACloudDropEffect = 'move' | 'copy'

export type ACloudDropState = 'idle' | 'active' | 'pending' | 'invalid'

export interface ACloudDragModifiers {
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export interface ACloudDropTarget {
  id: AId
  containerId: AId | null
  position: ACloudDropPosition
  kind: 'item' | 'container'
}

export interface ACloudDragPayload {
  sourceIds: AId[]
  sourceContainerId: AId | null
  target?: ACloudDropTarget
  effect: ACloudDropEffect
  modifiers: ACloudDragModifiers
}

export type ACloudSelectionInteraction = 'individual' | 'marquee'

export type ACloudSelectionMode = 'replace' | 'add' | 'toggle'

export interface ACloudSelectionRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ACloudSelectionDetail {
  selectedIds: AId[]
  mode: ACloudSelectionMode
  rect: ACloudSelectionRect
  cancelled?: boolean
}

export interface ACloudSortOption {
  id: string
  label: string
  direction?: 'ascending' | 'descending'
}

export interface ACloudItemBase {
  id: AId
  name: string
  icon?: string
  activityLabel?: string
  visibility?: ACloudVisibility
  favorite?: boolean
  selected?: boolean
  disabled?: boolean
  collaborators?: AstianPerson[]
  tags?: string[]
}

export interface ACloudFile extends ACloudItemBase {
  kind: 'file'
  mimeType?: string
  size?: number
  sizeLabel?: string
  thumbnailUrl?: string
  previewUrl?: string
}

export interface ACloudFolder extends ACloudItemBase {
  kind: 'folder'
  itemCount?: number
  permissionLabel?: string
}

export type ACloudItem = ACloudFile | ACloudFolder

export interface AFolderTreeNode {
  id: AId
  label: string
  icon?: string
  disabled?: boolean
  expanded?: boolean
  selected?: boolean
  loading?: boolean
  hasChildren?: boolean
  children?: AFolderTreeNode[]
}

export interface ACloudMedia {
  id: AId
  name: string
  thumbnailUrl: string
  previewUrl?: string
  alt: string
  dateLabel?: string
  albumLabel?: string
  selected?: boolean
  disabled?: boolean
}

export type APreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'unsupported'

export interface AFilePreviewSource {
  id: AId
  name: string
  kind: APreviewKind
  src?: string
  mimeType?: string
  alt?: string
  downloadUrl?: string
  metadata?: Array<{ label: string; value: string }>
}

export type AFileDetailsSection =
  | 'details'
  | 'tags'
  | 'permissions'
  | 'comments'
  | 'versions'
  | 'activity'

export interface AFileDetailsSectionSpec {
  id: AFileDetailsSection
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

export interface ACloudNotificationAction {
  id: string
  label: string
  destructive?: boolean
  disabled?: boolean
}

export interface ACloudNotification {
  id: AId
  title: string
  description?: string
  timeLabel: string
  read: boolean
  group?: string
  icon?: string
  actions?: ACloudNotificationAction[]
}

export type AConnectionState = 'connected' | 'connecting' | 'offline' | 'error'

export interface ACloudMetric {
  id: AId
  label: string
  value: string | number
  detail?: string
  icon?: string
  status?: AStatus
  trendLabel?: string
  progress?: number
}

export interface AColorSwatch {
  id: AId
  label: string
  token: `--a-${string}`
  description?: string
  disabled?: boolean
}

export interface ACloudCollectionState {
  state?: ALoadState
  errorTitle?: string
  errorDescription?: string
  emptyTitle?: string
  emptyDescription?: string
}
