<script setup lang="ts">
import { computed } from 'vue'

import type { AstianActionType } from '@/types/ui'

const props = withDefaults(defineProps<{
  label?: string
  type?: AstianActionType
  size?: 'small' | 'medium' | 'large'
  icon?: string
  iconRight?: string
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  compact?: boolean
  rounded?: boolean
  to?: string
}>(), { type: 'primary', size: 'medium' })

defineEmits<{ click: [event: Event] }>()

const sizeName = computed(() => ({ small: 'sm', medium: 'md', large: 'lg' } as const)[props.size])
</script>

<template>
  <q-btn
    no-caps
    unelevated
    class="a-button a-focusable"
    :class="[`a-button--${type}`, `a-button--${size}`, { 'a-button--full': fullWidth, 'a-button--compact': compact }]"
    :label="label"
    :icon="icon"
    :icon-right="iconRight"
    :size="sizeName"
    :loading="loading"
    :disable="disabled"
    :rounded="rounded"
    :to="to"
    @click="$emit('click', $event)"
  ><slot /></q-btn>
</template>

<style scoped>
.a-button { min-height: 40px; border-radius: var(--a-radius-sm); font-weight: 650; letter-spacing: -.01em; transition: transform var(--a-motion-fast), background var(--a-motion-fast), color var(--a-motion-fast), box-shadow var(--a-motion-fast); }
.a-button:hover { transform: translateY(-1px); }
.a-button:active { transform: translateY(1px) scale(.99); }
.a-button--small { min-height: 32px; padding-inline: 10px; }
.a-button--large { min-height: 48px; padding-inline: 18px; border-radius: 12px; }
.a-button--full { width: 100%; }
.a-button--compact { min-height: 30px; padding-inline: 8px; }
.a-button--primary { background: var(--a-primary); color: var(--a-text-inverse); box-shadow: 0 8px 18px color-mix(in srgb, var(--a-primary) 18%, transparent); }
.a-button--primary:hover { background: var(--a-primary-hover); }
.a-button--secondary { background: var(--a-bg-raised); color: var(--a-text-primary); box-shadow: inset 0 0 0 1px var(--a-border), var(--a-shadow-1); }
.a-button--secondary:hover { background: var(--a-bg-muted); }
.a-button--tertiary { background: transparent; color: var(--a-text-secondary); }
.a-button--tertiary:hover { background: var(--a-bg-hover); color: var(--a-text-primary); }
.a-button--destructive { background: color-mix(in srgb, var(--a-negative) 11%, transparent); color: var(--a-negative); }
.a-button--destructive:hover { background: color-mix(in srgb, var(--a-negative) 18%, transparent); }
</style>
