<script setup lang="ts">
import { ref } from 'vue'
import {
  AButton,
  AIcon,
  AInput,
  ARadioGroup,
  AStepper,
  ASurface,
  AToggle
} from '@goastian/astian-ui'
import { AStatCard } from '@goastian/astian-ui/cloud'
import type { ACloudMetric } from '@goastian/astian-ui/cloud'
import type { ARadioOption, AStepSpec } from '@goastian/astian-ui'

const name = ref('AstianGO')
const enabled = ref(true)
const visibility = ref<string | null>('private')
const date = ref('2026-08-04')
const activeStep = ref('details')
const visibilityOptions: ARadioOption<string>[] = [
  { label: 'Privado', value: 'private' },
  { label: 'Equipo', value: 'team', description: 'Disponible para el espacio.' }
]
const steps: AStepSpec<string>[] = [
  { id: 'details', title: 'Detalles' },
  { id: 'review', title: 'Revisión' }
]
const storage: ACloudMetric = {
  id: 'storage',
  label: 'Almacenamiento',
  value: '8,7 GB',
  detail: 'de 25 GB utilizados',
  icon: 'cloud',
  status: 'positive',
  progress: 35
}
</script>

<template>
  <ASurface level="l2">
    <AIcon name="shield" label="Privacidad" />
    <AInput v-model="name" label="Producto" />
    <AInput v-model="date" type="date" label="Fecha" min="2026-08-01" />
    <ARadioGroup v-model="visibility" label="Visibilidad" :options="visibilityOptions" />
    <AToggle v-model="enabled" label="Activo" />
    <AStepper v-model:active-step="activeStep" :steps="steps" :show-actions="false" />
    <AButton label="Guardar" icon="save" />
    <AStatCard
      :label="storage.label"
      :value="storage.value"
      :detail="storage.detail"
      :icon="storage.icon"
      :status="storage.status"
      :progress="storage.progress"
    />
  </ASurface>
</template>
