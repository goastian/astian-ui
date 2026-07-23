<script setup lang="ts">
import { computed } from 'vue'

import AButton from '../../components/AButton.vue'
import AEmptyState from '../../components/AEmptyState.vue'
import AErrorState from '../../components/AErrorState.vue'
import AIcon from '../../components/AIcon.vue'
import ASkeleton from '../../components/ASkeleton.vue'
import type { ALoadState } from '../../types/core'
import type {
  ACloudNotification,
  ACloudNotificationAction,
  AConnectionState
} from '../types'

const props = withDefaults(defineProps<{
  notifications: ACloudNotification[]
  state?: ALoadState
  connection?: AConnectionState
  title?: string
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string
  markAllLabel?: string
  loadMoreLabel?: string
  hasMore?: boolean
  disabled?: boolean
}>(), {
  state: 'ready',
  connection: 'connected',
  title: 'Notificaciones',
  emptyTitle: 'No hay notificaciones',
  emptyDescription: 'Las novedades aparecerán aquí.',
  errorTitle: 'No se pudieron cargar las notificaciones',
  errorDescription: 'Revisa la conexión e inténtalo de nuevo.',
  markAllLabel: 'Marcar todo como leído',
  loadMoreLabel: 'Cargar más',
  hasMore: false,
  disabled: false
})

const emit = defineEmits<{
  markRead: [notification: ACloudNotification]
  markAllRead: []
  action: [notification: ACloudNotification, action: ACloudNotificationAction]
  retry: []
  loadMore: []
}>()

const unreadCount = computed(() => props.notifications.filter((notification) => !notification.read).length)
const groups = computed(() => {
  const grouped = new Map<string, ACloudNotification[]>()
  for (const notification of props.notifications) {
    const label = notification.group || 'Recientes'
    grouped.set(label, [...(grouped.get(label) ?? []), notification])
  }
  return [...grouped.entries()].map(([label, items]) => ({ label, items }))
})

const connectionCopy = computed<Record<AConnectionState, string>>(() => ({
  connected: 'Conectado',
  connecting: 'Conectando',
  offline: 'Sin conexión',
  error: 'Conexión interrumpida'
}))
</script>

<template>
  <section class="a-notification-center" :aria-busy="state === 'loading'">
    <header class="a-notification-center__header">
      <div>
        <h2>{{ title }}</h2>
        <p
          class="a-notification-center__connection"
          :class="`a-notification-center__connection--${connection}`"
        >
          <span aria-hidden="true" />
          {{ connectionCopy[connection] }}
        </p>
      </div>
      <AButton
        v-if="unreadCount"
        :label="markAllLabel"
        type="tertiary"
        size="small"
        :disabled="disabled || state === 'loading'"
        @click="emit('markAllRead')"
      />
    </header>

    <p class="a-visually-hidden" aria-live="polite">
      {{ connectionCopy[connection] }}.
      {{ unreadCount ? `${unreadCount} sin leer` : 'No hay notificaciones sin leer' }}
    </p>

    <div v-if="state === 'loading'" class="a-notification-center__loading" role="status">
      <div v-for="index in 3" :key="index" class="a-notification-center__skeleton">
        <ASkeleton type="circle" width="var(--a-target-min)" height="var(--a-target-min)" />
        <div><ASkeleton width="70%" /><ASkeleton width="90%" /></div>
      </div>
      <span class="a-visually-hidden">Cargando notificaciones</span>
    </div>

    <AErrorState
      v-else-if="state === 'error'"
      :title="errorTitle"
      :description="errorDescription"
      retry-label="Reintentar"
      :disabled="disabled"
      @retry="emit('retry')"
    />

    <AEmptyState
      v-else-if="state === 'empty' || !notifications.length"
      icon="notifications_none"
      :title="emptyTitle"
      :description="emptyDescription"
      :disabled="disabled"
    />

    <div v-else class="a-notification-center__groups">
      <section v-for="group in groups" :key="group.label" class="a-notification-center__group">
        <h3>{{ group.label }}</h3>
        <ul>
          <li
            v-for="notification in group.items"
            :key="notification.id"
            class="a-notification-center__item"
            :class="{ 'a-notification-center__item--unread': !notification.read }"
          >
            <button
              type="button"
              class="a-notification-center__content"
              :disabled="disabled"
              @click="emit('markRead', notification)"
            >
              <span class="a-notification-center__icon" aria-hidden="true">
                <AIcon :name="notification.icon || 'notifications'" />
              </span>
              <span>
                <strong>{{ notification.title }}</strong>
                <span v-if="notification.description">{{ notification.description }}</span>
                <small>{{ notification.timeLabel }}</small>
              </span>
              <span v-if="!notification.read" class="a-notification-center__unread">
                <span aria-hidden="true" />
                Sin leer
              </span>
            </button>
            <div v-if="notification.actions?.length" class="a-notification-center__actions">
              <button
                v-for="actionItem in notification.actions"
                :key="actionItem.id"
                type="button"
                :class="{ 'a-notification-center__action--destructive': actionItem.destructive }"
                :disabled="disabled || actionItem.disabled"
                @click="emit('action', notification, actionItem)"
              >
                {{ actionItem.label }}
              </button>
            </div>
          </li>
        </ul>
      </section>
      <AButton
        v-if="hasMore"
        class="a-notification-center__more"
        :label="loadMoreLabel"
        type="secondary"
        full-width
        :disabled="disabled"
        @click="emit('loadMore')"
      />
    </div>
  </section>
</template>

<style scoped>
.a-notification-center {
  display: grid;
  gap: var(--a-space-4);
  min-width: 0;
  color: var(--a-text-primary);
}
.a-notification-center__header {
  display: flex;
  gap: var(--a-space-4);
  align-items: start;
  justify-content: space-between;
}
.a-notification-center h2,
.a-notification-center h3,
.a-notification-center p { margin: var(--a-space-0); }
.a-notification-center h2 {
  font-size: var(--a-font-size-xl);
  letter-spacing: var(--a-letter-spacing-heading);
}
.a-notification-center h3 {
  padding-inline: var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  letter-spacing: var(--a-letter-spacing-eyebrow);
}
.a-notification-center__connection {
  display: flex;
  gap: var(--a-space-2);
  align-items: center;
  margin-top: var(--a-space-1) !important;
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}
.a-notification-center__connection > span,
.a-notification-center__unread > span {
  width: var(--a-space-2);
  height: var(--a-space-2);
  border-radius: var(--a-radius-round);
  background: var(--a-positive);
}
.a-notification-center__connection--connecting > span { background: var(--a-warning); }
.a-notification-center__connection--offline > span,
.a-notification-center__connection--error > span { background: var(--a-negative); }
.a-notification-center__loading,
.a-notification-center__groups,
.a-notification-center__group { display: grid; gap: var(--a-space-3); }
.a-notification-center__skeleton {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--a-space-3);
  align-items: center;
  min-height: var(--a-control-lg);
}
.a-notification-center__skeleton > div {
  display: grid;
  gap: var(--a-space-2);
}
.a-notification-center ul {
  display: grid;
  gap: var(--a-space-1);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}
.a-notification-center__item {
  overflow: hidden;
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}
.a-notification-center__item--unread {
  border-color: var(--a-border-strong);
  background: var(--a-bg-selected);
}
.a-notification-center__content {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--a-space-3);
  align-items: start;
  width: 100%;
  min-height: var(--a-target-min);
  padding: var(--a-space-3);
  border: 0;
  background: transparent;
  color: inherit;
  text-align: start;
  cursor: pointer;
}
.a-notification-center__content:hover { background: var(--a-bg-hover); }
.a-notification-center__content:disabled,
.a-notification-center__actions button:disabled {
  opacity: var(--a-opacity-disabled);
  cursor: not-allowed;
}
.a-notification-center__icon {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-muted);
  color: var(--a-primary);
}
.a-notification-center__content > span:nth-child(2) { display: grid; gap: var(--a-space-1); }
.a-notification-center__content strong { font-size: var(--a-font-size-sm); }
.a-notification-center__content span,
.a-notification-center__content small {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}
.a-notification-center__unread {
  display: inline-flex;
  gap: var(--a-space-1);
  align-items: center;
  color: var(--a-primary) !important;
  font-weight: var(--a-font-weight-semibold);
}
.a-notification-center__actions {
  display: flex;
  gap: var(--a-space-1);
  padding: var(--a-space-0) var(--a-space-3) var(--a-space-3) calc(var(--a-target-min) + var(--a-space-6));
}
.a-notification-center__actions button {
  min-height: var(--a-target-min);
  padding-inline: var(--a-space-3);
  border: 0;
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-muted);
  color: var(--a-text-primary);
  cursor: pointer;
}
.a-notification-center__action--destructive { color: var(--a-negative) !important; }
@media (max-width: 28rem) {
  .a-notification-center__content { grid-template-columns: auto minmax(0, 1fr); }
  .a-notification-center__unread { grid-column: 2; }
  .a-notification-center__actions { padding-left: var(--a-space-3); flex-wrap: wrap; }
}
</style>
