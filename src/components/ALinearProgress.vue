<script setup lang="ts">
import { computed } from 'vue'

import type { AProgressProps, AStatus } from '../types/core'

const props = withDefaults(defineProps<AProgressProps & {
  showValue?: boolean
  disabled?: boolean
}>(), {
  value: 0,
  min: 0,
  max: 100,
  indeterminate: false,
  status: 'primary',
  showValue: true,
  disabled: false
})

const safeMax = computed(() => props.max > props.min ? props.max : props.min + 1)
const normalizedValue = computed(() => Math.min(safeMax.value, Math.max(props.min, props.value)))
const ratio = computed(() => (normalizedValue.value - props.min) / (safeMax.value - props.min))
const percentage = computed(() => Math.round(ratio.value * 100))
const resolvedValueLabel = computed(() => props.valueLabel ?? `${percentage.value}%`)
const fillStyle = computed(() => ({ '--a-progress-scale': String(ratio.value) }))
const statusClass = computed<AStatus>(() => props.status)
</script>

<template>
  <div
    class="a-linear-progress"
    :class="[
      `a-linear-progress--${statusClass}`,
      {
        'a-linear-progress--indeterminate': indeterminate,
        'a-linear-progress--disabled': disabled
      }
    ]"
    role="progressbar"
    :aria-label="label"
    :aria-valuemin="indeterminate ? undefined : min"
    :aria-valuemax="indeterminate ? undefined : safeMax"
    :aria-valuenow="indeterminate ? undefined : normalizedValue"
    :aria-valuetext="indeterminate ? undefined : resolvedValueLabel"
    :aria-busy="indeterminate || undefined"
    :aria-disabled="disabled || undefined"
  >
    <div class="a-linear-progress__header">
      <span class="a-linear-progress__label"><slot name="label">{{ label }}</slot></span>
      <span v-if="showValue && !indeterminate" class="a-linear-progress__value">
        <slot name="value" :value="normalizedValue" :percentage="percentage">
          {{ resolvedValueLabel }}
        </slot>
      </span>
    </div>
    <span class="a-linear-progress__track" aria-hidden="true">
      <span class="a-linear-progress__fill" :style="fillStyle" />
    </span>
  </div>
</template>

<style scoped>
.a-linear-progress {
  --a-progress-color: var(--a-primary);

  display: grid;
  gap: var(--a-space-2);
  color: var(--a-text-primary);
}

.a-linear-progress--neutral {
  --a-progress-color: var(--a-text-secondary);
}

.a-linear-progress--positive {
  --a-progress-color: var(--a-positive);
}

.a-linear-progress--warning {
  --a-progress-color: var(--a-warning);
}

.a-linear-progress--negative {
  --a-progress-color: var(--a-negative);
}

.a-linear-progress--info {
  --a-progress-color: var(--a-info);
}

.a-linear-progress__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--a-space-3);
}

.a-linear-progress__label {
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-medium);
  line-height: var(--a-line-height-body);
}

.a-linear-progress__value {
  flex: none;
  color: var(--a-text-secondary);
  font-family: var(--a-font-mono);
  font-size: var(--a-font-size-xs);
  font-variant-numeric: tabular-nums;
}

.a-linear-progress__track {
  position: relative;
  display: block;
  height: var(--a-space-2);
  overflow: hidden;
  border-radius: var(--a-radius-round);
  background: var(--a-progress-track);
}

.a-linear-progress__fill {
  position: absolute;
  inset: var(--a-space-0);
  border-radius: inherit;
  background: var(--a-progress-color);
  transform: scaleX(var(--a-progress-scale));
  transform-origin: left center;
  transition: transform var(--a-motion-base);
}

.a-linear-progress--indeterminate .a-linear-progress__fill {
  animation: a-linear-progress-indeterminate var(--a-duration-progress) var(--a-easing-standard) infinite alternate;
  transform: scaleX(.38) translateX(-80%);
}

.a-linear-progress--disabled {
  opacity: var(--a-opacity-disabled);
}

@keyframes a-linear-progress-indeterminate {
  to {
    transform: scaleX(.38) translateX(210%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .a-linear-progress__fill {
    transition: none;
  }

  .a-linear-progress--indeterminate .a-linear-progress__fill {
    animation-duration: var(--a-duration-slow);
    animation-iteration-count: 1;
    transform: scaleX(.5);
  }
}
</style>
