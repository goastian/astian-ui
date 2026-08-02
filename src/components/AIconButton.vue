<script setup lang="ts">
import type { AstianActionType, AstianVariant } from '../types/ui'

withDefaults(defineProps<{
  icon: string
  label: string
  type?: AstianActionType
  variant?: AstianVariant
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}>(), { type: 'tertiary', variant: 'unfilled', size: 'medium' })

defineEmits<{ click: [event: Event] }>()
</script>

<template>
  <q-btn
    round
    flat
    class="a-icon-button a-focusable"
    :class="[`a-icon-button--${type}`, `a-icon-button--${size}`, `a-icon-button--${variant}`]"
    :icon="icon"
    :aria-label="label"
    :disable="disabled"
    @click="$emit('click', $event)"
  ><q-tooltip>{{ label }}</q-tooltip></q-btn>
</template>

<style scoped>
.a-icon-button { min-width: var(--a-target-min); min-height: var(--a-target-min); color: var(--a-text-secondary); transition: background var(--a-motion-fast), color var(--a-motion-fast); }
.a-icon-button:hover { color: var(--a-text-primary); background: var(--a-bg-hover); }
.a-icon-button:active { transform: translateY(var(--a-border-width)); }
.a-icon-button--small { font-size: var(--a-font-size-xs); }
.a-icon-button--medium { font-size: var(--a-font-size-sm); }
.a-icon-button--large { min-width: var(--a-control-lg); min-height: var(--a-control-lg); font-size: var(--a-font-size-md); }
.a-icon-button--filled { background: var(--a-bg-muted); }
.a-icon-button--primary { color: var(--a-primary); }
.a-icon-button--destructive { color: var(--a-negative); }

@media (prefers-reduced-motion: reduce) {
  .a-icon-button:active { transform: none; }
}
</style>
