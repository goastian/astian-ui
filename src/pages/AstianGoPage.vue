<script setup lang="ts">
import { ref } from 'vue'
import { AButton, AChip, AIconButton, AInput, AMonoTag, ASurface, AToggle } from '@/components'

const query = ref('')
const privateMode = ref(true)
const activeScope = ref('Web')
const shortcutMessage = ref('')
const results = [
  { domain: 'developer.mozilla.org', title: 'Privacidad en la Web — MDN', text: 'Controles, permisos y tecnologías que ayudan a reducir la exposición de datos durante la navegación.', tag: 'Documentación' },
  { domain: 'eff.org', title: 'Surveillance Self-Defense', text: 'Guías prácticas para proteger tus comunicaciones y entender el rastreo en línea.', tag: 'Guía' },
  { domain: 'astian.org', title: 'Cómo AstianGO procesa una búsqueda', text: 'Una explicación clara de qué datos se usan, durante cuánto tiempo y qué nunca guardamos.', tag: 'Astian' }
]
</script>

<template>
  <q-page class="a-page go-page">
    <header class="go-page__hero">
      <div><span class="a-eyebrow">ASTIANGO / SEARCH</span><h1>Busca la web.<br><em>No entregues tu perfil.</em></h1><p>Resultados útiles sin historial personal ni identificadores publicitarios.</p></div>
      <div class="go-page__privacy"><AToggle v-model="privateMode" label="Modo privado" /><small>Bloqueo de parámetros de rastreo activo</small></div>
    </header>

    <form class="go-page__search" @submit.prevent>
      <AInput v-model="query" placeholder="¿Qué quieres encontrar?" icon="search" end-icon="tune" size="large" @end-click="privateMode = !privateMode" />
      <AButton label="Buscar" size="large" icon-right="arrow_forward" />
    </form>

    <div class="go-page__scopes"><button v-for="scope in ['Web','Noticias','Imágenes','Mapas']" :key="scope" type="button" :class="{ active: activeScope === scope }" @click="activeScope = scope">{{ scope }}</button><span>Índice: global · idioma: ES</span></div>

    <div class="go-page__layout">
      <main class="go-page__results">
        <p class="go-page__result-count">Aproximadamente 18.420 resultados · 0,41 s</p>
        <article v-for="result in results" :key="result.title" class="go-page__result">
          <div class="go-page__result-meta"><span>{{ result.domain }}</span><AMonoTag :label="result.tag" color="green" /><AIconButton icon="more_horiz" label="Más opciones" size="small" /></div>
          <h2>{{ result.title }}</h2><p>{{ result.text }}</p>
        </article>
      </main>
      <aside>
        <ASurface level="l2" class="go-page__insight"><div class="go-page__insight-icon"><q-icon name="policy" /></div><span class="a-eyebrow">CONTROL DE PRIVACIDAD</span><h3>Esta búsqueda no se añade a un perfil.</h3><p>AstianGO elimina parámetros conocidos de rastreo antes de abrir un resultado.</p><AChip label="Protección activa" icon="verified_user" color="green" selected /></ASurface>
        <ASurface class="go-page__shortcuts">
          <strong>Accesos rápidos</strong>
          <button type="button" @click="shortcutMessage = 'Configuración de búsqueda solicitada'">Configuración de búsqueda <q-icon name="arrow_forward" /></button>
          <button type="button" @click="shortcutMessage = 'Informe de transparencia solicitado'">Informe de transparencia <q-icon name="arrow_forward" /></button>
          <span class="a-visually-hidden" aria-live="polite">{{ shortcutMessage }}</span>
        </ASurface>
      </aside>
    </div>
  </q-page>
</template>

<style scoped>
.go-page__hero { display: grid; grid-template-columns: 1fr auto; gap: 30px; align-items: end; padding: clamp(54px, 9vw, 120px) 0 38px; }.go-page__hero h1 { margin: 12px 0 18px; font-size: clamp(2.6rem, 6vw, 5.7rem); line-height: .96; letter-spacing: -.065em; }.go-page__hero h1 em { color: var(--a-primary); font-style: normal; }.go-page__hero p { max-width: 55ch; color: var(--a-text-secondary); font-size: 1.05rem; }.go-page__privacy { display: grid; justify-items: end; padding: 12px 0; }.go-page__privacy small { color: var(--a-text-tertiary); font-size: .68rem; }
.go-page__search { display: grid; grid-template-columns: 1fr auto; gap: 10px; max-width: 940px; padding: 8px; border: 1px solid var(--a-border); border-radius: 18px; background: var(--a-bg-surface); box-shadow: var(--a-shadow-1); }.go-page__search :deep(.a-input .q-field__control::before) { border-color: transparent; }.go-page__scopes { display: flex; align-items: center; gap: 4px; margin: 14px 0 24px; padding-bottom: 14px; border-bottom: 1px solid var(--a-border); }.go-page__scopes button { min-height: var(--a-target-min); border: 0; border-radius: 7px; padding: 7px 10px; background: transparent; color: var(--a-text-secondary); cursor: pointer; }.go-page__scopes button.active { background: var(--a-primary-soft); color: var(--a-primary); font-weight: 700; }.go-page__scopes span { margin-left: auto; color: var(--a-text-tertiary); font: .66rem var(--a-font-mono); }
.go-page__layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: clamp(32px, 6vw, 90px); }.go-page__result-count { color: var(--a-text-tertiary); font-size: .72rem; }.go-page__result { max-width: 760px; padding: 24px 0; border-bottom: 1px solid var(--a-border); }.go-page__result-meta { display: flex; gap: 10px; align-items: center; color: var(--a-text-secondary); font-size: .72rem; }.go-page__result-meta :last-child { margin-left: auto; }.go-page__result h2 { margin: 10px 0 7px; color: var(--a-primary); font-size: 1.3rem; letter-spacing: -.02em; }.go-page__result p { margin: 0; color: var(--a-text-secondary); line-height: 1.65; }.go-page__layout aside { display: grid; gap: 14px; align-content: start; }.go-page__insight { display: grid; gap: 14px; }.go-page__insight-icon { display: grid; place-items: center; width: 50px; height: 50px; border-radius: 14px; background: var(--a-primary-soft); color: var(--a-primary); font-size: 25px; }.go-page__insight h3,.go-page__insight p { margin: 0; }.go-page__insight p { color: var(--a-text-secondary); line-height: 1.55; }.go-page__shortcuts { display: grid; gap: 12px; }.go-page__shortcuts button { display: flex; min-height: var(--a-target-min); align-items: center; justify-content: space-between; border: 0; background: transparent; color: var(--a-text-secondary); font-size: .78rem; text-align: start; cursor: pointer; }.go-page__shortcuts button:hover { color: var(--a-primary); }
@media (max-width: 880px) { .go-page__layout { grid-template-columns: 1fr; }.go-page__layout aside { grid-template-columns: 1fr 1fr; }.go-page__hero { grid-template-columns: 1fr; }.go-page__privacy { justify-items: start; } }
@media (max-width: 600px) { .go-page__search { grid-template-columns: 1fr; }.go-page__scopes { overflow-x: auto; }.go-page__scopes span { display: none; }.go-page__layout aside { grid-template-columns: 1fr; } }
</style>
