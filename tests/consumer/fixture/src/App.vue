<script setup lang="ts">
import { ref } from 'vue'
import { AButton, AIcon, AInput, ASurface, AToggle } from '@goastian/astian-ui'
import { AStatCard } from '@goastian/astian-ui/cloud'
import type { ACloudMetric } from '@goastian/astian-ui/cloud'

const name = ref('AstianGO')
const enabled = ref(true)
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
    <AToggle v-model="enabled" label="Activo" />
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
