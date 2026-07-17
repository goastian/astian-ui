<script setup lang="ts">
import type { QMenuProps } from 'quasar'

const open = defineModel<boolean>({ default: false })
withDefaults(defineProps<{ target?: QMenuProps['target']; anchor?: QMenuProps['anchor']; self?: QMenuProps['self']; offset?: [number, number]; maxHeight?: string; width?: string; noPadding?: boolean; autoClose?: boolean }>(), { anchor: 'bottom left', self: 'top left', offset: () => [0, 8] })
</script>

<template>
  <q-menu v-model="open" :target="target" :anchor="anchor" :self="self" :offset="offset" :auto-close="autoClose" class="a-dropdown" :style="{ maxHeight, width }"><div :class="{ 'a-dropdown__content': !noPadding }"><slot /></div></q-menu>
</template>

<style>
.a-dropdown { border: 1px solid var(--a-border); border-radius: 12px; background: var(--a-bg-raised); color: var(--a-text-primary); box-shadow: var(--a-shadow-2); }.a-dropdown__content { padding-block: 4px; }
</style>
