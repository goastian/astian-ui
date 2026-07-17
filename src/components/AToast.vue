<script setup lang="ts">
export interface ToastAction { label: string; action: () => void }
const visible = defineModel<boolean>({ required: true })
withDefaults(defineProps<{ title?: string; body?: string; icon?: string; imageSrc?: string; actions?: ToastAction[]; hideClose?: boolean }>(), {})
defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body"><Transition name="a-toast"><aside v-if="visible" class="a-toast" role="status"><button v-if="!hideClose" type="button" class="a-toast__close" aria-label="Cerrar notificación" @click="visible = false; $emit('close')"><q-icon name="close" /></button><div v-if="icon" class="a-toast__icon"><q-icon :name="icon" /></div><div class="a-toast__text"><strong v-if="title">{{ title }}</strong><p v-if="body">{{ body }}</p></div><img v-if="imageSrc" :src="imageSrc" alt="" /><div v-if="actions?.length" class="a-toast__actions"><button v-for="action in actions" :key="action.label" type="button" @click="action.action">{{ action.label }}</button></div></aside></Transition></Teleport>
</template>

<style scoped>
.a-toast { position: fixed; z-index: 4000; right: 20px; bottom: 20px; display: grid; grid-template-columns: auto 1fr auto; gap: 12px; width: min(380px, calc(100vw - 32px)); padding: 14px; border: 1px solid var(--a-border-strong); border-radius: 14px; background: var(--a-text-primary); color: var(--a-bg-raised); box-shadow: var(--a-shadow-2); }.a-toast__close { position: absolute; top: 7px; right: 7px; border: 0; background: transparent; color: inherit; opacity: .65; cursor: pointer; }.a-toast__icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 11px; background: rgb(255 255 255 / 10%); font-size: 21px; }.a-toast__text { padding-right: 20px; }.a-toast__text strong { font-size: .86rem; }.a-toast__text p { margin: 3px 0 0; opacity: .72; font-size: .75rem; line-height: 1.45; }.a-toast__actions { grid-column: 2 / -1; display: flex; gap: 8px; }.a-toast__actions button { border: 0; border-radius: 7px; padding: 6px 9px; background: rgb(255 255 255 / 12%); color: inherit; font-weight: 650; cursor: pointer; }.a-toast-enter-active,.a-toast-leave-active { transition: opacity var(--a-motion-base), transform var(--a-motion-base); }.a-toast-enter-from,.a-toast-leave-to { opacity: 0; transform: translateY(14px) scale(.98); }
@media (max-width: 520px) { .a-toast { right: 16px; bottom: 16px; } }
</style>
