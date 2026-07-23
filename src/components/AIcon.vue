<script setup lang="ts">
import { computed } from 'vue'
import type { AstianSize, AstianTone } from '../types/ui'

const props = withDefaults(defineProps<{ name: string; size?: AstianSize | number; tone?: AstianTone; rotate?: number; disabled?: boolean; label?: string; legacy?: boolean }>(), { size: 'medium', tone: 'primary' })
const resolvedSize = computed(() => typeof props.size === 'number' ? `${props.size}px` : ({ xsmall: '12px', small: '16px', medium: '20px', xmedium: '24px', large: '32px', xlarge: '48px' } as const)[props.size])
</script>

<template>
  <img v-if="legacy" :src="`/icons/${name}.svg`" :alt="label || ''" class="a-icon a-icon--legacy" :class="{ 'a-icon--disabled': disabled }" :style="{ width: resolvedSize, height: resolvedSize, transform: rotate ? `rotate(${rotate}deg)` : undefined }" />
  <q-icon v-else :name="name" :size="resolvedSize" :aria-label="label" :aria-hidden="label ? undefined : 'true'" class="a-icon" :class="[`a-icon--${tone}`, { 'a-icon--disabled': disabled }]" :style="{ transform: rotate ? `rotate(${rotate}deg)` : undefined }" />
</template>

<style scoped>
.a-icon { transition: color var(--a-motion-fast), transform var(--a-motion-fast); }.a-icon--legacy { display: inline-block; object-fit: contain; }.a-icon--primary { color: var(--a-text-primary); }.a-icon--secondary { color: var(--a-text-secondary); }.a-icon--tertiary { color: var(--a-text-tertiary); }.a-icon--inverse { color: var(--a-text-inverse); }.a-icon--link { color: var(--a-primary); }.a-icon--destructive { color: var(--a-negative); }.a-icon--disabled { opacity: .38; }
</style>
