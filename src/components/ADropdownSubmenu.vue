<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{ label: string; icon?: string; disabled?: boolean }>(), {})
const open = ref(false)
</script>

<template>
  <q-item clickable :disable="disabled" class="a-dropdown-submenu" @mouseenter="open = true" @mouseleave="open = false" @click="open = !open">
    <q-item-section v-if="icon" avatar><q-icon :name="icon" /></q-item-section><q-item-section>{{ label }}</q-item-section><q-item-section side><q-icon name="chevron_right" /></q-item-section>
    <q-menu v-model="open" anchor="top right" self="top left" :offset="[4, 0]" class="a-dropdown"><div class="a-dropdown__content"><slot /></div></q-menu>
  </q-item>
</template>

<style scoped>
.a-dropdown-submenu { min-height: 40px; margin: 2px 4px; border-radius: 8px; color: var(--a-text-primary); }.a-dropdown-submenu:hover { background: var(--a-bg-hover); }.a-dropdown-submenu :deep(.q-item__section--avatar) { min-width: 34px; color: var(--a-text-secondary); }
</style>
