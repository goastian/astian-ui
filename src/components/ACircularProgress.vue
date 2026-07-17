<script setup lang="ts">
import { computed } from 'vue'
import type { AstianSize } from '@/types/ui'

const props = withDefaults(defineProps<{ progress?: number; size?: Extract<AstianSize, 'small' | 'medium' | 'xmedium' | 'large' | 'xlarge'>; spinner?: boolean; label?: string }>(), { progress: 0, size: 'medium' })
const px = computed(() => ({ small: '16px', medium: '24px', xmedium: '30px', large: '40px', xlarge: '100px' } as const)[props.size])
</script>

<template>
  <q-spinner v-if="spinner" :size="px" color="primary" :aria-label="label || 'Cargando'" />
  <q-circular-progress v-else show-value :value="progress" :size="px" color="primary" track-color="grey-4" :aria-label="label || `${progress}%`"><slot /></q-circular-progress>
</template>
