<script setup lang="ts">
import type { AstianActionType, AstianVariant } from '@/types/ui'

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
.a-icon-button { color: var(--a-text-secondary); transition: transform var(--a-motion-fast), background var(--a-motion-fast), color var(--a-motion-fast); }
.a-icon-button:hover { color: var(--a-text-primary); background: var(--a-bg-hover); transform: translateY(-1px); }
.a-icon-button:active { transform: translateY(1px) scale(.96); }
.a-icon-button--small { font-size: 10px; }
.a-icon-button--medium { font-size: 13px; }
.a-icon-button--large { font-size: 16px; }
.a-icon-button--filled { background: var(--a-bg-muted); }
.a-icon-button--primary { color: var(--a-primary); }
.a-icon-button--destructive { color: var(--a-negative); }
</style>
