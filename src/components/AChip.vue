<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'

import type { AstianAccent, AstianSize, AstianVariant } from '../types/ui'

const props = withDefaults(defineProps<{
  label?: string
  icon?: string
  avatar?: string
  color?: AstianAccent
  size?: Extract<AstianSize, 'small' | 'medium' | 'large'>
  variant?: AstianVariant
  removable?: boolean
  selected?: boolean
  clickable?: boolean
}>(), { color: 'green', size: 'medium', variant: 'unfilled' })

defineEmits<{ click: [event: Event]; remove: [] }>()
const instance = getCurrentInstance()
const interactive = computed(() => props.clickable ?? Boolean(instance?.vnode.props?.onClick || props.removable))
</script>

<template>
  <q-chip
    :clickable="interactive"
    class="a-chip a-focusable"
    :class="[`a-chip--${color}`, `a-chip--${size}`, `a-chip--${variant}`, { 'a-chip--selected': selected, 'a-chip--interactive': interactive }]"
    :icon="icon"
    :removable="removable"
    @click="$emit('click', $event)"
    @remove="$emit('remove')"
  >
    <q-avatar v-if="avatar"><img :src="avatar" alt="" /></q-avatar>
    <slot>{{ label }}</slot>
  </q-chip>
</template>

<style scoped>
.a-chip { --chip-color: var(--a-primary); margin: 0; border-radius: 8px; background: color-mix(in srgb, var(--chip-color) 10%, var(--a-bg-raised)); color: var(--a-text-primary); font-weight: 600; transition: transform var(--a-motion-fast), background var(--a-motion-fast); }
.a-chip:hover { transform: translateY(-1px); background: color-mix(in srgb, var(--chip-color) 16%, var(--a-bg-raised)); }
.a-chip--filled, .a-chip--selected { background: var(--chip-color); color: var(--a-text-inverse); }
.a-chip--interactive { min-height: var(--a-target-min); }
.a-chip--small { font-size: var(--a-font-size-xs); }
.a-chip--large { min-height: var(--a-target-min); font-size: var(--a-font-size-sm); }
.a-chip--orange { --chip-color: var(--a-accent); }
.a-chip--blue, .a-chip--dark-blue { --chip-color: var(--a-info); }
.a-chip--red { --chip-color: var(--a-negative); }
.a-chip--yellow { --chip-color: var(--a-warning); }
.a-chip--pink { --chip-color: var(--a-color-pink); }
</style>
