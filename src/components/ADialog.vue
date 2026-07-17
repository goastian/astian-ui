<script setup lang="ts">
const open = defineModel<boolean>({ required: true })
withDefaults(defineProps<{ title?: string; description?: string; icon?: string; type?: 'default' | 'error' | 'promotional' | 'input' | 'confirm' | 'settings' | 'search' | 'fullscreen' | 'landscape'; persistent?: boolean; loading?: boolean; hideClose?: boolean }>(), { type: 'default' })
defineEmits<{ close: [] }>()
</script>

<template>
  <q-dialog v-model="open" :persistent="persistent" :maximized="type === 'fullscreen'" transition-show="fade" transition-hide="fade" @hide="$emit('close')">
    <q-card class="a-dialog" :class="[`a-dialog--${type}`]">
      <q-linear-progress v-if="loading" indeterminate color="primary" />
      <q-card-section class="a-dialog__header">
        <span v-if="icon" class="a-dialog__icon"><q-icon :name="icon" /></span>
        <div><h2 v-if="title">{{ title }}</h2><p v-if="description">{{ description }}</p></div>
        <q-btn v-if="!hideClose" round flat icon="close" aria-label="Cerrar" class="a-dialog__close" @click="open = false" />
      </q-card-section>
      <q-card-section class="a-dialog__content"><slot /></q-card-section>
      <q-card-actions v-if="$slots.actions" align="right" class="a-dialog__actions"><slot name="actions" /></q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.a-dialog { width: min(560px, calc(100vw - 32px)); max-height: min(820px, calc(100dvh - 32px)); border: 1px solid var(--a-border); border-radius: 20px; background: var(--a-bg-raised); color: var(--a-text-primary); box-shadow: var(--a-shadow-2); }.a-dialog--confirm { width: min(420px, calc(100vw - 32px)); }.a-dialog--settings { width: min(880px, calc(100vw - 32px)); }.a-dialog--search,.a-dialog--landscape { width: min(1080px, calc(100vw - 32px)); }.a-dialog--fullscreen { width: 100%; max-height: 100dvh; border-radius: 0; }.a-dialog__header { display: grid; grid-template-columns: auto 1fr auto; gap: 14px; align-items: start; padding: 24px 24px 10px; }.a-dialog__header h2 { margin: 0; font-size: 1.3rem; line-height: 1.25; letter-spacing: -.025em; }.a-dialog__header p { margin: 6px 0 0; max-width: 55ch; color: var(--a-text-secondary); line-height: 1.55; }.a-dialog__icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 11px; background: var(--a-primary-soft); color: var(--a-primary); font-size: 20px; }.a-dialog--error .a-dialog__icon { background: color-mix(in srgb, var(--a-negative) 12%, transparent); color: var(--a-negative); }.a-dialog__close { margin: -8px -8px 0 0; color: var(--a-text-secondary); }.a-dialog__content { padding: 16px 24px 24px; }.a-dialog__actions { gap: 8px; padding: 0 24px 24px; }
</style>
