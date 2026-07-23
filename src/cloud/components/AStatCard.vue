<script setup lang="ts">
import { computed } from 'vue'

import AIcon from '../../components/AIcon.vue'
import ALinearProgress from '../../components/ALinearProgress.vue'
import type { AStatus } from '../../types/core'

const props = withDefaults(defineProps<{
  label: string
  value: string | number
  detail?: string
  icon?: string
  status?: AStatus
  trendLabel?: string
  progress?: number
  loading?: boolean
}>(), {
  status: 'neutral',
  loading: false
})

const progressValue = computed(() => Math.min(100, Math.max(0, props.progress ?? 0)))
</script>

<template>
  <article
    class="a-stat-card"
    :class="[`a-stat-card--${status}`, { 'a-stat-card--loading': loading }]"
    :aria-busy="loading"
  >
    <div class="a-stat-card__heading">
      <span class="a-stat-card__label">{{ label }}</span>
      <span v-if="icon" class="a-stat-card__icon" aria-hidden="true"><AIcon :name="icon" /></span>
    </div>

    <template v-if="loading">
      <span class="a-stat-card__skeleton a-stat-card__skeleton--value" aria-hidden="true" />
      <span class="a-stat-card__skeleton a-stat-card__skeleton--detail" aria-hidden="true" />
      <span class="a-visually-hidden">Cargando {{ label }}</span>
    </template>
    <template v-else>
      <strong class="a-stat-card__value a-tabular">{{ value }}</strong>
      <p v-if="detail" class="a-stat-card__detail">{{ detail }}</p>
      <span v-if="trendLabel" class="a-stat-card__trend">
        <span class="a-stat-card__status-mark" aria-hidden="true" />
        {{ trendLabel }}
      </span>
      <ALinearProgress
        v-if="progress !== undefined"
        class="a-stat-card__progress"
        :value="progressValue"
        :label="`${label}: ${progressValue}%`"
        :status="status"
      />
      <slot />
    </template>
  </article>
</template>

<style scoped>
.a-stat-card {
  --a-stat-color: var(--a-primary);
  display: grid;
  gap: var(--a-space-3);
  min-width: 0;
  min-height: var(--a-layout-stat-min);
  padding: var(--a-space-5);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-surface);
  color: var(--a-text-primary);
}
.a-stat-card--positive { --a-stat-color: var(--a-positive); }
.a-stat-card--warning { --a-stat-color: var(--a-warning); }
.a-stat-card--negative { --a-stat-color: var(--a-negative); }
.a-stat-card--info { --a-stat-color: var(--a-info); }
.a-stat-card__heading {
  display: flex;
  gap: var(--a-space-3);
  align-items: center;
  justify-content: space-between;
}
.a-stat-card__label {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
}
.a-stat-card__icon {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border-radius: var(--a-radius-sm);
  background: color-mix(in srgb, var(--a-stat-color) 12%, var(--a-bg-raised));
  color: var(--a-stat-color);
}
.a-stat-card__value {
  align-self: end;
  font-size: var(--a-font-size-metric);
  line-height: var(--a-line-height-tight);
  letter-spacing: var(--a-letter-spacing-metric);
}
.a-stat-card__detail {
  margin: var(--a-space-0);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}
.a-stat-card__trend {
  display: inline-flex;
  gap: var(--a-space-2);
  align-items: center;
  width: fit-content;
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}
.a-stat-card__status-mark {
  width: var(--a-space-2);
  height: var(--a-space-2);
  border-radius: var(--a-radius-round);
  background: var(--a-stat-color);
}
.a-stat-card__skeleton {
  display: block;
  border-radius: var(--a-radius-xs);
  background: var(--a-bg-muted);
  animation: a-stat-pulse var(--a-duration-progress) var(--a-easing-standard) alternate infinite;
}
.a-stat-card__skeleton--value { width: 55%; height: var(--a-space-10); }
.a-stat-card__skeleton--detail { width: 78%; height: var(--a-space-4); }
@keyframes a-stat-pulse {
  to { opacity: var(--a-opacity-disabled); }
}
@media (prefers-reduced-motion: reduce) {
  .a-stat-card__skeleton { animation: none; }
}
</style>
