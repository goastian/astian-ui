<script setup lang="ts">
import { computed } from 'vue'
import AAvatar from './AAvatar.vue'
import type { AstianPerson, AstianSize } from '../types/ui'

const props = withDefaults(defineProps<{ people: AstianPerson[]; maxDisplayed?: number; size?: Extract<AstianSize, 'xsmall' | 'small' | 'medium' | 'xmedium' | 'large'>; layout?: 'inline' | 'stacked' }>(), { maxDisplayed: 4, size: 'medium', layout: 'stacked' })
const visible = computed(() => props.people.slice(0, props.maxDisplayed))
const remaining = computed(() => Math.max(props.people.length - props.maxDisplayed, 0))
defineEmits<{ more: [] }>()
</script>

<template>
  <span class="a-facepile" :class="`a-facepile--${layout}`">
    <AAvatar v-for="person in visible" :key="person.id" :label="person.name" :image-src="person.imageSrc" :color="person.color" :active="person.active" :size="size" rounded />
    <button v-if="remaining" class="a-facepile__more a-focusable" type="button" :aria-label="`Ver ${remaining} personas más`" @click="$emit('more')">+{{ remaining }}</button>
  </span>
</template>

<style scoped>
.a-facepile { display: inline-flex; align-items: center; }.a-facepile--stacked > * + * { margin-left: -7px; }.a-facepile--inline { gap: 7px; }.a-facepile :deep(.a-avatar) { box-shadow: 0 0 0 2px var(--a-bg-raised); }
.a-facepile__more { z-index: 1; min-width: 28px; height: 28px; border: 2px solid var(--a-bg-raised); border-radius: 50%; background: var(--a-bg-muted); color: var(--a-text-secondary); font: 700 .7rem var(--a-font-mono); cursor: pointer; }
</style>
