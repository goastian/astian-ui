<script setup lang="ts">
import AButton from '@/components/AButton.vue'
import AMonoTag from '@/components/AMonoTag.vue'
</script>

<template><main class="not-found"><div><AMonoTag label="ERROR 404" color="orange" /><h1>Esta ruta no existe.</h1><p>El producto puede haberse movido o la dirección está incompleta.</p><AButton label="Volver a Astian UI" icon="arrow_back" to="/ui" /></div><span aria-hidden="true">404</span></main></template>

<style scoped>
.not-found { display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; min-height: 100dvh; padding: clamp(24px, 7vw, 100px); background: var(--a-bg-canvas); color: var(--a-text-primary); }.not-found h1 { margin: 20px 0 12px; font-size: clamp(3rem, 8vw, 7rem); line-height: .95; letter-spacing: -.07em; }.not-found p { margin: 0 0 28px; color: var(--a-text-secondary); font-size: 1rem; }.not-found > span { color: var(--a-bg-muted); font: 700 clamp(8rem, 24vw, 24rem)/1 var(--a-font-mono); letter-spacing: -.09em; user-select: none; }
@media (max-width: 720px) { .not-found { grid-template-columns: 1fr; }.not-found > span { position: absolute; z-index: -1; opacity: .5; } }
</style>
