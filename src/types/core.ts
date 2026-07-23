export type AId = string | number

export type ALoadState = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export type AStatus = 'neutral' | 'primary' | 'positive' | 'warning' | 'negative' | 'info'

export type ANavigationLocation = string | Record<string, unknown>

export type ANavigationTarget =
  | {
      to: ANavigationLocation
      href?: never
      target?: never
    }
  | {
      href: string
      to?: never
      target?: '_self' | '_blank'
    }
  | {
      to?: never
      href?: never
      target?: never
    }

export type ANavItemSpec = ANavigationTarget & {
  id: AId
  label: string
  description?: string
  icon?: string
  badge?: string | number
  active?: boolean
  disabled?: boolean
}

export interface ANavGroup {
  id: AId
  label?: string
  items: ANavItemSpec[]
  collapsible?: boolean
  collapsed?: boolean
}

export type ABreadcrumbItem = ANavigationTarget & {
  id: AId
  label: string
  current?: boolean
  disabled?: boolean
}

export interface ACheckboxOption<T extends AId = AId> {
  label: string
  value: T
  hint?: string
  disabled?: boolean
}

export interface ARadioOption<T extends AId = AId> {
  label: string
  description?: string
  value: T
  disabled?: boolean
}

export type AStepState = 'pending' | 'active' | 'complete' | 'error' | 'disabled'

export interface AStepSpec<T extends AId = AId> {
  id: T
  title: string
  description?: string
  error?: string
  state?: AStepState
  disabled?: boolean
}

export interface AProgressProps {
  value?: number
  min?: number
  max?: number
  label: string
  valueLabel?: string
  indeterminate?: boolean
  status?: AStatus
}

export interface AQuotaFormatContext {
  value: number
  used: number
  limit: number
}

export interface ATableSort {
  columnId: string
  direction: 'ascending' | 'descending'
}

export type ADataRow = Record<string, unknown>

export interface ATableColumn<Row extends ADataRow = ADataRow> {
  id: string
  label: string
  value: keyof Row | ((row: Row) => unknown)
  sortValue?: keyof Row | ((row: Row) => string | number | Date | null | undefined)
  format?: (value: unknown, row: Row) => string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
  width?: string
  mobileLabel?: string
}

export type ARowKey<Row extends ADataRow = ADataRow> = keyof Row | ((row: Row) => AId)

export type APaginationModel = APagePaginationModel | ACursorPaginationModel

export interface APagePaginationModel {
  mode: 'page'
  page: number
  pageSize: number
}

export interface ACursorPaginationModel {
  mode: 'cursor'
  cursor?: string
  previousCursor?: string
  nextCursor?: string
  hasPrevious: boolean
  hasNext: boolean
}

export interface APaginationQuerySync {
  pageKey?: string
  sizeKey?: string
  history?: 'push' | 'replace'
}

export interface AComboboxOption<T extends AId = AId> {
  id: T
  label: string
  description?: string
  icon?: string
  disabled?: boolean
}

export type AComboboxLoader<T extends AId = AId> = (
  query: string,
  context: { signal: AbortSignal }
) => Promise<AComboboxOption<T>[]>

export interface AContextMenuItem {
  id: AId
  label?: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
  separator?: boolean
  children?: AContextMenuItem[]
}

export type ADrawerPosition = 'left' | 'right' | 'top' | 'bottom'

export type APopoverPlacement =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'left'
  | 'right'

export type AAnchorOrigin =
  | 'top left'
  | 'top middle'
  | 'top right'
  | 'center left'
  | 'center middle'
  | 'center right'
  | 'bottom left'
  | 'bottom middle'
  | 'bottom right'

export type AUploadIssueCode = 'type' | 'size' | 'count' | 'permission' | 'custom'

export interface AUploadIssue {
  file: File
  code: AUploadIssueCode
  message: string
}

export type AFileValidator = (
  file: File,
  context: { files: readonly File[]; signal: AbortSignal }
) => boolean | string | AUploadIssue | Promise<boolean | string | AUploadIssue>

export type AUploadStatus = 'queued' | 'uploading' | 'paused' | 'success' | 'error' | 'cancelled'

export interface AUploadQueueItem {
  id: AId
  name: string
  size: number
  progress?: number
  status: AUploadStatus
  error?: string
}

export interface AFileUploadLabels {
  browse?: string
  remove?: string
  addUrl?: string
  urlLabel?: string
  submit?: string
}
