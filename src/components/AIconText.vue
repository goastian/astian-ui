<script setup lang="ts">
import type { AstianSize, AstianTone, AstianVariant } from '../types/ui'

withDefaults(defineProps<{ label?: string; startIcon?: string; endIcon?: string; tone?: AstianTone; size?: Extract<AstianSize, 'small' | 'medium' | 'large'>; variant?: AstianVariant; disabled?: boolean; interactive?: boolean }>(), { tone: 'primary', size: 'medium', variant: 'unfilled' })
defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <component :is="interactive ? 'button' : 'span'" class="a-icon-text a-focusable" :class="[`a-icon-text--${tone}`, `a-icon-text--${size}`, `a-icon-text--${variant}`, { 'a-icon-text--interactive': interactive }]" :disabled="disabled" @click="interactive && $emit('click', $event)">
    <q-icon v-if="startIcon" :name="startIcon" /><span><slot>{{ label }}</slot></span><q-icon v-if="endIcon" :name="endIcon" />
  </component>
</template>

<style scoped>
.a-icon-text { display: inline-flex; align-items: center; gap: 7px; min-width: 0; color: var(--a-text-primary); }
.a-icon-text--small { font-size: .78rem; }.a-icon-text--large { font-size: 1rem; }
.a-icon-text--secondary { color: var(--a-text-secondary); }.a-icon-text--tertiary { color: var(--a-text-tertiary); }.a-icon-text--link { color: var(--a-primary); }.a-icon-text--destructive { color: var(--a-negative); }.a-icon-text--inverse { color: var(--a-text-inverse); }
.a-icon-text--interactive { appearance: none; border: 0; border-radius: 8px; background: transparent; cursor: pointer; padding: 7px 9px; transition: background var(--a-motion-fast), transform var(--a-motion-fast); }
.a-icon-text--interactive:hover { background: var(--a-bg-hover); }.a-icon-text--interactive:active { transform: translateY(1px); }
.a-icon-text--filled { background: var(--a-bg-muted); border-radius: 8px; padding: 7px 9px; }
</style>
