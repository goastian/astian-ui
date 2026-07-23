<script setup lang="ts">
import { computed } from 'vue'

import type { AQuotaFormatContext, AStatus } from '../types/core'
import ALinearProgress from './ALinearProgress.vue'

const props = withDefaults(defineProps<{
  label: string
  used: number
  limit: number
  format?: (context: AQuotaFormatContext) => string
  status?: AStatus
  warningAt?: number
  criticalAt?: number
  indeterminate?: boolean
  disabled?: boolean
}>(), {
  warningAt: 0.8,
  criticalAt: 0.95,
  indeterminate: false,
  disabled: false
})

const numberFormat = new Intl.NumberFormat()
const safeUsed = computed(() => Math.max(0, props.used))
const safeLimit = computed(() => Math.max(0, props.limit))
const ratio = computed(() => safeLimit.value > 0 ? safeUsed.value / safeLimit.value : 0)
const percentage = computed(() => Math.round(Math.max(0, ratio.value) * 100))

const resolvedStatus = computed<AStatus>(() => {
  if (props.status) return props.status
  if (ratio.value >= props.criticalAt) return 'negative'
  if (ratio.value >= props.warningAt) return 'warning'
  return 'primary'
})

const valueLabel = computed(() => {
  const context: AQuotaFormatContext = {
    value: percentage.value,
    used: safeUsed.value,
    limit: safeLimit.value
  }

  return props.format?.(context)
    ?? `${numberFormat.format(safeUsed.value)} / ${numberFormat.format(safeLimit.value)}`
})
</script>

<template>
  <div
    class="a-quota-meter"
    :class="{ 'a-quota-meter--disabled': disabled }"
  >
    <ALinearProgress
      :label="label"
      :value="safeUsed"
      :min="0"
      :max="safeLimit || 1"
      :value-label="valueLabel"
      :status="resolvedStatus"
      :indeterminate="indeterminate"
      :disabled="disabled"
    >
      <template #label><slot name="label">{{ label }}</slot></template>
      <template #value>
        <slot
          name="value"
          :used="safeUsed"
          :limit="safeLimit"
          :percentage="percentage"
        >
          {{ valueLabel }}
        </slot>
      </template>
    </ALinearProgress>
    <div v-if="$slots.default" class="a-quota-meter__detail">
      <slot :used="safeUsed" :limit="safeLimit" :percentage="percentage" />
    </div>
  </div>
</template>

<style scoped>
.a-quota-meter {
  display: grid;
  gap: var(--a-space-2);
}

.a-quota-meter__detail {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.a-quota-meter--disabled {
  cursor: not-allowed;
}
</style>
