<script setup lang="ts">
import { ref } from 'vue'
import { AButton, AIcon, AInput, ASurface, AToggle } from '@astian/astian-ui'

const name = ref('AstianGO')
const enabled = ref(true)
</script>

<template>
  <ASurface level="l2">
    <AIcon name="shield" label="Privacidad" />
    <AInput v-model="name" label="Producto" />
    <AToggle v-model="enabled" label="Activo" />
    <AButton label="Guardar" icon="save" />
  </ASurface>
</template>
