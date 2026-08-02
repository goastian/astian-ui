<script setup lang="ts">
import { computed } from 'vue'

import type { AstianAccent, AstianSize } from '../types/ui'

const props = withDefaults(defineProps<{
  label?: string
  icon?: string
  imageSrc?: string
  size?: AstianSize
  color?: AstianAccent
  active?: boolean
  rounded?: boolean
  showBadge?: boolean
  badgeIcon?: string
  disabled?: boolean
}>(), { size: 'medium', color: 'green', active: true })

const dimensions: Record<AstianSize, string> = { xsmall: '16px', small: '20px', medium: '24px', xmedium: '32px', large: '36px', xlarge: '124px' }
const initials = computed(() => props.label?.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '')
</script>

<template>
  <span
    class="a-avatar"
    :class="[`a-avatar--${color}`, { 'a-avatar--inactive': !active, 'a-avatar--rounded': rounded, 'a-avatar--disabled': disabled }]"
    :style="{ width: dimensions[size], height: dimensions[size] }"
    :aria-label="label"
  >
    <img v-if="imageSrc" :src="imageSrc" :alt="label ? `Avatar de ${label}` : 'Avatar'" />
    <q-icon v-else-if="icon" :name="icon" />
    <span v-else class="a-avatar__initials">{{ initials }}</span>
    <span v-if="showBadge" class="a-avatar__badge"><q-icon v-if="badgeIcon" :name="badgeIcon" size="9px" /></span>
  </span>
</template>

<style scoped>
.a-avatar { --avatar-color: var(--a-primary); position: relative; display: inline-grid; place-items: center; flex: none; overflow: visible; border-radius: 25%; background: color-mix(in srgb, var(--avatar-color) 17%, var(--a-bg-raised)); color: var(--avatar-color); font-size: clamp(8px, 45%, 18px); font-weight: 700; user-select: none; }
.a-avatar--rounded { border-radius: 50%; }
.a-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
.a-avatar--orange { --avatar-color: var(--a-accent); }
.a-avatar--blue, .a-avatar--dark-blue { --avatar-color: var(--a-info); }
.a-avatar--red { --avatar-color: var(--a-negative); }
.a-avatar--yellow { --avatar-color: var(--a-warning); }
.a-avatar--pink { --avatar-color: var(--a-color-pink); }
.a-avatar--inactive { opacity: .45; }
.a-avatar--disabled { filter: grayscale(1); opacity: .38; }
.a-avatar__badge { position: absolute; right: -2px; bottom: -2px; display: grid; place-items: center; width: 28%; aspect-ratio: 1; min-width: 7px; border: var(--a-border-width-strong) solid var(--a-bg-raised); border-radius: var(--a-radius-round); background: var(--a-positive); color: var(--a-text-inverse); }
</style>
