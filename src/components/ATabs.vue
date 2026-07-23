<script setup lang="ts">
import type { AstianTab } from '../types/ui'
const model = defineModel<string>({ required: true })
withDefaults(defineProps<{ tabs: AstianTab[]; size?: 'small' | 'medium' | 'large'; fullWidth?: boolean; vertical?: boolean }>(), { size: 'medium' })
</script>

<template>
  <q-tabs v-model="model" no-caps dense narrow-indicator active-color="primary" indicator-color="primary" class="a-tabs" :class="[`a-tabs--${size}`, { 'a-tabs--full': fullWidth }]" :vertical="vertical" align="left">
    <q-tab v-for="tab in tabs" :key="tab.value" :name="tab.value" :icon="tab.icon" :label="tab.label"><q-badge v-if="tab.badge" floating color="primary">{{ tab.badge }}</q-badge></q-tab>
  </q-tabs>
</template>

<style scoped>
.a-tabs { color: var(--a-text-secondary); border-bottom: 1px solid var(--a-border); }.a-tabs :deep(.q-tab) { min-height: 42px; padding-inline: 12px; font-weight: 600; }.a-tabs--small :deep(.q-tab) { min-height: 34px; font-size: .76rem; }.a-tabs--large :deep(.q-tab) { min-height: 50px; font-size: 1rem; }.a-tabs--full :deep(.q-tabs__content) { width: 100%; }.a-tabs--full :deep(.q-tab) { flex: 1; }
</style>
