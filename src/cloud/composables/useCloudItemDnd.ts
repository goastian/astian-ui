import { toValue, type MaybeRefOrGetter } from 'vue'

import type { AId } from '../../types/core'
import type {
  ACloudDragModifiers,
  ACloudDragPayload,
  ACloudDropEffect,
  ACloudDropPosition,
  ACloudDropState,
  ACloudDropTarget
} from '../types'

export const ASTIAN_CLOUD_DND_MIME = 'application/x-astian-cloud-items+json'

export interface ACloudItemDndOptions {
  sourceIds?: MaybeRefOrGetter<readonly AId[]>
  sourceContainerId?: MaybeRefOrGetter<AId | null>
  effect?: MaybeRefOrGetter<ACloudDropEffect>
}

let activeCloudDrag: ACloudDragPayload | null = null

const modifiersFrom = (event: Pick<MouseEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>): ACloudDragModifiers => ({
  altKey: event.altKey,
  ctrlKey: event.ctrlKey,
  metaKey: event.metaKey,
  shiftKey: event.shiftKey
})

const effectFrom = (
  event: Pick<MouseEvent, 'altKey' | 'ctrlKey' | 'metaKey'>,
  fallback: ACloudDropEffect
): ACloudDropEffect => event.altKey || event.ctrlKey || event.metaKey ? 'copy' : fallback

const isId = (value: unknown): value is AId =>
  typeof value === 'string' || typeof value === 'number'

export function useCloudItemDnd(options: ACloudItemDndOptions = {}) {
  const defaultEffect = () => toValue(options.effect) ?? 'move'
  const sourceContainerId = () => toValue(options.sourceContainerId) ?? null
  const configuredSourceIds = () => [...(toValue(options.sourceIds) ?? [])]

  function createPayload(
    event: Pick<MouseEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'>,
    sourceId?: AId,
    target?: ACloudDropTarget
  ): ACloudDragPayload {
    const configured = configuredSourceIds()
    const sourceIds = sourceId === undefined
      ? configured
      : configured.some((id) => id === sourceId) ? configured : [sourceId]

    return {
      sourceIds,
      sourceContainerId: sourceContainerId(),
      target,
      effect: effectFrom(event, defaultEffect()),
      modifiers: modifiersFrom(event)
    }
  }

  function beginDrag(event: DragEvent, sourceId: AId) {
    const payload = createPayload(event, sourceId)
    activeCloudDrag = payload

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copyMove'
      event.dataTransfer.setData(ASTIAN_CLOUD_DND_MIME, JSON.stringify(payload))
      event.dataTransfer.setData('text/plain', payload.sourceIds.map(String).join(', '))
    }

    return payload
  }

  function readPayload(event: DragEvent, target?: ACloudDropTarget) {
    let payload = activeCloudDrag
    const serialized = event.dataTransfer?.getData(ASTIAN_CLOUD_DND_MIME)

    if (serialized) {
      try {
        const parsed = JSON.parse(serialized) as Partial<ACloudDragPayload>
        if (
          Array.isArray(parsed.sourceIds)
          && parsed.sourceIds.every(isId)
          && (parsed.sourceContainerId === null || isId(parsed.sourceContainerId))
        ) {
          payload = {
            sourceIds: parsed.sourceIds,
            sourceContainerId: parsed.sourceContainerId,
            effect: parsed.effect === 'copy' ? 'copy' : 'move',
            modifiers: parsed.modifiers ?? modifiersFrom(event)
          }
        }
      } catch {
        return null
      }
    }

    if (!payload) return null
    return {
      ...payload,
      target,
      effect: effectFrom(event, payload.effect),
      modifiers: modifiersFrom(event)
    } satisfies ACloudDragPayload
  }

  function allowDrop(
    event: DragEvent,
    target: ACloudDropTarget,
    state: ACloudDropState = 'active'
  ) {
    if (state === 'invalid' || state === 'pending') return null
    const payload = readPayload(event, target)
    if (!payload || payload.sourceIds.length === 0) return null

    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = payload.effect
    return payload
  }

  function endDrag(event: DragEvent) {
    const payload = activeCloudDrag
      ? {
          ...activeCloudDrag,
          effect: effectFrom(event, activeCloudDrag.effect),
          modifiers: modifiersFrom(event)
        }
      : null
    activeCloudDrag = null
    return payload
  }

  return {
    allowDrop,
    beginDrag,
    createPayload,
    endDrag,
    readPayload
  }
}

export function cloudDropPosition(
  event: DragEvent,
  element: HTMLElement,
  allowInside = false
): ACloudDropPosition {
  const rect = element.getBoundingClientRect()
  const ratio = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0.5

  if (allowInside && ratio >= 0.25 && ratio <= 0.75) return 'inside'
  return ratio < 0.5 ? 'before' : 'after'
}
