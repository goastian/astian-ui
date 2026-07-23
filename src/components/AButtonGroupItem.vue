<script setup lang="ts">
import AButton from './AButton.vue'
import type { AstianActionType } from '../types/ui'

withDefaults(defineProps<{ label: string; icon?: string; type?: AstianActionType; disabled?: boolean; loading?: boolean; hidden?: boolean }>(), { type: 'secondary' })
defineEmits<{ click: [event: Event] }>()
</script>

<template><AButton v-if="!hidden" :label="label" :icon="icon" :type="type" :disabled="disabled" :loading="loading" @click="$emit('click', $event)" /></template>
