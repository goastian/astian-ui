import { computed, onBeforeUnmount, ref, type Ref } from 'vue'

import type { AId } from '../../types/core'
import type {
  ACloudSelectionDetail,
  ACloudSelectionMode,
  ACloudSelectionRect
} from '../types'

interface SelectionItem {
  id: AId
  disabled?: boolean
}

interface SelectionMarqueeOptions {
  root: Ref<HTMLElement | null>
  selectedIds: Ref<AId[]>
  items: () => readonly SelectionItem[]
  enabled: () => boolean
  onStart?: (detail: ACloudSelectionDetail) => void
  onChange?: (detail: ACloudSelectionDetail) => void
  onEnd?: (detail: ACloudSelectionDetail) => void
}

const domKey = (id: AId) => `${typeof id}:${String(id)}`

const selectionMode = (event: PointerEvent): ACloudSelectionMode => {
  if (event.ctrlKey || event.metaKey) return 'toggle'
  if (event.shiftKey) return 'add'
  return 'replace'
}

const rectFromPoints = (
  start: { x: number; y: number },
  end: { x: number; y: number }
): ACloudSelectionRect => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y)
})

const intersects = (left: ACloudSelectionRect, right: DOMRect) =>
  left.x < right.right
  && left.x + left.width > right.left
  && left.y < right.bottom
  && left.y + left.height > right.top

const sameIds = (left: readonly AId[], right: readonly AId[]) =>
  left.length === right.length && left.every((id, index) => id === right[index])

const scrollParent = (element: HTMLElement) => {
  let parent = element.parentElement
  while (parent) {
    const style = getComputedStyle(parent)
    if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) {
      return parent
    }
    parent = parent.parentElement
  }
  return document.scrollingElement as HTMLElement | null
}

export function useSelectionMarquee(options: SelectionMarqueeOptions) {
  const active = ref(false)
  const rectangle = ref<ACloudSelectionRect | null>(null)
  let pointerId: number | null = null
  let start = { x: 0, y: 0 }
  let latest = { x: 0, y: 0 }
  let baseSelection: AId[] = []
  let mode: ACloudSelectionMode = 'replace'
  let frame = 0

  const rectangleStyle = computed(() => {
    if (!rectangle.value) return undefined
    return {
      left: `${rectangle.value.x}px`,
      top: `${rectangle.value.y}px`,
      width: `${rectangle.value.width}px`,
      height: `${rectangle.value.height}px`
    }
  })

  function detail(cancelled = false): ACloudSelectionDetail {
    return {
      selectedIds: [...options.selectedIds.value],
      mode,
      rect: rectangle.value ?? rectFromPoints(start, latest),
      ...(cancelled ? { cancelled: true } : {})
    }
  }

  function updateSelection() {
    const rect = rectangle.value
    const root = options.root.value
    if (!rect || !root) return

    const itemByKey = new Map(options.items().map((item) => [domKey(item.id), item]))
    const intersected = [...root.querySelectorAll<HTMLElement>('[data-selection-id]')]
      .filter((element) => {
        const item = itemByKey.get(element.dataset.selectionId ?? '')
        return item && !item.disabled && intersects(rect, element.getBoundingClientRect())
      })
      .map((element) => itemByKey.get(element.dataset.selectionId ?? '')!.id)

    const base = new Set(baseSelection)
    let next: AId[]
    if (mode === 'add') {
      next = [...new Set([...baseSelection, ...intersected])]
    } else if (mode === 'toggle') {
      for (const id of intersected) {
        if (base.has(id)) base.delete(id)
        else base.add(id)
      }
      next = [...base]
    } else {
      next = intersected
    }

    if (!sameIds(options.selectedIds.value, next)) {
      options.selectedIds.value = next
      options.onChange?.(detail())
    }
  }

  function autoScroll() {
    frame = 0
    if (!active.value || !options.root.value) return
    const host = scrollParent(options.root.value)
    if (!host) return

    const viewport = host === document.scrollingElement
      ? { top: 0, bottom: window.innerHeight }
      : host.getBoundingClientRect()
    const edge = 40
    const delta = latest.y < viewport.top + edge
      ? -Math.min(16, viewport.top + edge - latest.y)
      : latest.y > viewport.bottom - edge
        ? Math.min(16, latest.y - (viewport.bottom - edge))
        : 0

    if (delta !== 0) {
      host.scrollTop += delta
      rectangle.value = rectFromPoints(start, latest)
      updateSelection()
      frame = requestAnimationFrame(autoScroll)
    }
  }

  function scheduleAutoScroll() {
    if (!frame) frame = requestAnimationFrame(autoScroll)
  }

  function finish(cancelled = false) {
    const root = options.root.value
    if (pointerId !== null && root?.hasPointerCapture(pointerId)) {
      root.releasePointerCapture(pointerId)
    }
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    pointerId = null
    document.removeEventListener('keydown', handleEscape)

    if (!active.value) {
      rectangle.value = null
      return
    }

    if (cancelled) options.selectedIds.value = [...baseSelection]
    const endDetail = detail(cancelled)
    active.value = false
    rectangle.value = null
    options.onEnd?.(endDetail)
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !active.value) return
    event.preventDefault()
    finish(true)
  }

  function onPointerDown(event: PointerEvent) {
    const root = options.root.value
    const target = event.target
    if (
      !root
      || !options.enabled()
      || event.button !== 0
      || event.pointerType === 'touch'
      || !(target instanceof Element)
      || target.closest('button, input, a, select, textarea, [role="button"], [role="menu"]')
    ) {
      return
    }

    pointerId = event.pointerId
    start = { x: event.clientX, y: event.clientY }
    latest = { ...start }
    baseSelection = [...options.selectedIds.value]
    mode = selectionMode(event)
    root.setPointerCapture(pointerId)
    document.addEventListener('keydown', handleEscape)
  }

  function onPointerMove(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    latest = { x: event.clientX, y: event.clientY }
    const distance = Math.hypot(latest.x - start.x, latest.y - start.y)
    if (!active.value && distance < 5) return

    event.preventDefault()
    rectangle.value = rectFromPoints(start, latest)
    if (!active.value) {
      active.value = true
      options.onStart?.(detail())
    }
    updateSelection()
    scheduleAutoScroll()
  }

  function onPointerUp(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    finish(false)
  }

  function onPointerCancel(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    finish(true)
  }

  onBeforeUnmount(() => finish(true))

  return {
    active,
    rectangleStyle,
    onPointerCancel,
    onPointerDown,
    onPointerMove,
    onPointerUp
  }
}
