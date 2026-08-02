<script setup lang="ts">
import { ref } from 'vue'

import AButton from '@/components/AButton.vue'
import AIconButton from '@/components/AIconButton.vue'
import AInput from '@/components/AInput.vue'
import AMonoTag from '@/components/AMonoTag.vue'
import AToggle from '@/components/AToggle.vue'

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
  <main class="a-page go-page" aria-label="AstianGO">
    <header class="go-page__header">
      <div class="go-page__heading">
        <span class="a-eyebrow">ASTIANGO / BÚSQUEDA</span>
        <h1>Busca la web sin entregar tu perfil.</h1>
        <p>Resultados útiles sin historial personal ni identificadores publicitarios.</p>
      </div>

      <section class="go-page__privacy-summary" aria-label="Estado de privacidad">
        <div class="go-page__privacy-state">
          <span aria-hidden="true" />
          <div>
            <strong>Privacidad activa</strong>
            <small>Bloqueo de parámetros de rastreo activo</small>
          </div>
        </div>
        <AToggle v-model="privateMode" label="Modo privado" size="small" />
      </section>
    </header>

    <section class="go-page__cockpit" aria-labelledby="go-search-title">
      <h2 id="go-search-title" class="a-visually-hidden">Buscar en AstianGO</h2>
      <form class="go-page__search" role="search" @submit.prevent>
        <AInput
          v-model="query"
          type="search"
          aria-label="Consulta de búsqueda"
          placeholder="¿Qué quieres encontrar?"
          icon="search"
          end-icon="tune"
          end-action-label="Alternar modo privado"
          size="large"
          autocomplete="off"
          @end-click="privateMode = !privateMode"
        />
        <AButton native-type="submit" label="Buscar" size="large" icon-right="arrow_forward" />
      </form>

      <nav class="go-page__scopes" aria-label="Tipo de resultado">
        <div>
          <button
            v-for="scope in ['Web','Noticias','Imágenes','Mapas']"
            :key="scope"
            type="button"
            :class="{ active: activeScope === scope }"
            :aria-pressed="activeScope === scope"
            @click="activeScope = scope"
          >
            {{ scope }}
          </button>
        </div>
        <span>Índice: global · idioma: ES</span>
      </nav>
    </section>

    <div class="go-page__workspace">
      <section class="go-page__results" aria-labelledby="go-results-title">
        <header class="go-page__results-header">
          <div>
            <span class="a-eyebrow">RESULTADOS / {{ activeScope }}</span>
            <h2 id="go-results-title">Resultados</h2>
          </div>
          <p>Aproximadamente 18.420 resultados · 0,41 s</p>
        </header>

        <ol class="go-page__result-list">
          <li v-for="result in results" :key="result.title">
            <article class="go-page__result">
              <div class="go-page__result-meta">
                <span>{{ result.domain }}</span>
                <AMonoTag :label="result.tag" color="green" />
                <AIconButton icon="more_horiz" :label="`Más opciones para ${result.title}`" size="small" />
              </div>
              <h3>{{ result.title }}</h3>
              <p>{{ result.text }}</p>
            </article>
          </li>
        </ol>
      </section>

      <aside class="go-page__aside" aria-label="Privacidad y accesos rápidos">
        <section class="go-page__insight">
          <div class="go-page__insight-heading">
            <span class="go-page__insight-icon" aria-hidden="true"><q-icon name="policy" /></span>
            <span class="a-eyebrow">CONTROL DE PRIVACIDAD</span>
          </div>
          <h2>Esta búsqueda no se añade a un perfil.</h2>
          <p>AstianGO elimina parámetros conocidos de rastreo antes de abrir un resultado.</p>
          <div class="go-page__protection">
            <span aria-hidden="true" />
            <strong>Protección activa</strong>
          </div>
        </section>

        <section class="go-page__shortcuts" aria-labelledby="go-shortcuts-title">
          <h2 id="go-shortcuts-title">Accesos rápidos</h2>
          <button type="button" @click="shortcutMessage = 'Configuración de búsqueda solicitada'">
            <span>Configuración de búsqueda</span>
            <q-icon name="arrow_forward" aria-hidden="true" />
          </button>
          <button type="button" @click="shortcutMessage = 'Informe de transparencia solicitado'">
            <span>Informe de transparencia</span>
            <q-icon name="arrow_forward" aria-hidden="true" />
          </button>
          <span class="a-visually-hidden" aria-live="polite">{{ shortcutMessage }}</span>
        </section>
      </aside>
    </div>
  </main>
</template>

<style scoped>
/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
.go-page {
  display: grid;
  gap: var(--a-space-6);
}

.go-page__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(var(--a-layout-search-min), 0.42fr);
  gap: var(--a-space-8);
  align-items: end;
  padding-block: var(--a-space-8) var(--a-space-4);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.go-page__heading {
  min-width: 0;
}

.go-page__heading h1,
.go-page__heading p,
.go-page__results-header h2,
.go-page__results-header p,
.go-page__result h3,
.go-page__result p,
.go-page__insight h2,
.go-page__insight p,
.go-page__shortcuts h2 {
  margin: var(--a-space-0);
}

.go-page__heading h1 {
  max-width: var(--a-layout-title);
  margin-block-start: var(--a-space-2);
  font-size: clamp(var(--text-xl), 4vw, var(--text-2xl));
  font-weight: var(--a-font-weight-semibold);
  line-height: var(--a-line-height-tight);
  letter-spacing: var(--a-letter-spacing-heading);
  text-wrap: balance;
}

.go-page__heading p {
  max-width: var(--a-layout-copy-narrow);
  margin-block-start: var(--a-space-3);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}

.go-page__privacy-summary {
  display: grid;
  gap: var(--a-space-3);
  min-width: 0;
  padding: var(--a-space-4);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}

.go-page__privacy-state {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--a-space-3);
}

.go-page__privacy-state > span,
.go-page__protection > span {
  flex: none;
  width: var(--a-space-2);
  height: var(--a-space-2);
  border-radius: var(--a-radius-round);
  background: var(--a-positive);
}

.go-page__privacy-state > div {
  display: grid;
  min-width: 0;
  gap: var(--a-space-1);
}

.go-page__privacy-state strong {
  font-size: var(--a-font-size-sm);
}

.go-page__privacy-state small {
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-tight);
}

.go-page__privacy-summary :deep(.a-toggle) {
  justify-self: start;
  min-height: var(--a-target-min);
}

.go-page__cockpit {
  overflow: hidden;
  border: var(--a-border-width) solid var(--a-border-strong);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-surface);
}

.go-page__search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--a-space-2);
  padding: var(--a-space-3);
}

.go-page__search :deep(.a-form-field) {
  min-width: 0;
}

.go-page__search :deep(.a-form-field__control) {
  min-height: var(--a-control-lg);
  background: var(--a-bg-raised);
}

.go-page__scopes {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-4);
  padding: var(--a-space-2) var(--a-space-3);
  border-top: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-muted);
}

.go-page__scopes > div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--a-space-1);
  min-width: 0;
}

.go-page__scopes button {
  min-height: var(--a-target-min);
  padding-inline: var(--a-space-3);
  border: 0;
  border-radius: var(--a-radius-xs);
  background: transparent;
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  white-space: nowrap;
  cursor: pointer;
}

.go-page__scopes button:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.go-page__scopes button.active {
  background: var(--a-bg-selected);
  color: var(--a-text-primary);
  font-weight: var(--a-font-weight-semibold);
}

.go-page__scopes > span {
  flex: none;
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
  white-space: nowrap;
}

.go-page__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(var(--a-layout-search-min), var(--a-layout-aside));
  gap: clamp(var(--a-space-6), 5vw, var(--a-space-16));
  align-items: start;
  min-width: 0;
}

.go-page__results {
  min-width: 0;
}

.go-page__results-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--a-space-4);
  padding-block-end: var(--a-space-3);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.go-page__results-header h2 {
  margin-block-start: var(--a-space-2);
  font-size: var(--a-font-size-lg);
  letter-spacing: var(--a-letter-spacing-heading);
}

.go-page__results-header p {
  flex: none;
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
  white-space: nowrap;
}

.go-page__result-list {
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}

.go-page__result-list > li {
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.go-page__result {
  display: grid;
  gap: var(--a-space-2);
  max-width: var(--a-layout-copy);
  padding-block: var(--a-space-6);
}

.go-page__result-meta {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.go-page__result-meta > span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.go-page__result-meta :deep(.a-icon-button) {
  margin-inline-start: auto;
}

.go-page__result h3 {
  font-size: var(--a-font-size-lg);
  font-weight: var(--a-font-weight-semibold);
  letter-spacing: var(--a-letter-spacing-heading);
}

.go-page__result p {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
}

.go-page__aside {
  display: grid;
  gap: var(--a-space-4);
  min-width: 0;
}

.go-page__insight,
.go-page__shortcuts {
  min-width: 0;
  padding: var(--a-space-4);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}

.go-page__insight {
  display: grid;
  gap: var(--a-space-3);
  border-block-start-color: var(--a-positive);
}

.go-page__insight-heading {
  display: flex;
  align-items: center;
  gap: var(--a-space-3);
}

.go-page__insight-icon {
  display: grid;
  width: var(--a-target-min);
  height: var(--a-target-min);
  place-items: center;
  flex: none;
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-positive-soft);
  color: var(--a-positive);
  font-size: var(--a-icon-lg);
}

.go-page__insight h2 {
  font-size: var(--a-font-size-lg);
  letter-spacing: var(--a-letter-spacing-heading);
}

.go-page__insight p {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
}

.go-page__protection {
  display: flex;
  align-items: center;
  gap: var(--a-space-2);
  padding-block-start: var(--a-space-3);
  border-top: var(--a-border-width) solid var(--a-border);
  color: var(--a-positive);
  font-size: var(--a-font-size-xs);
}

.go-page__shortcuts {
  display: grid;
}

.go-page__shortcuts h2 {
  padding-block-end: var(--a-space-3);
  font-size: var(--a-font-size-sm);
}

.go-page__shortcuts button {
  display: flex;
  min-width: 0;
  min-height: var(--a-target-min);
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-3);
  padding: var(--a-space-2) var(--a-space-1);
  border: 0;
  border-top: var(--a-border-width) solid var(--a-border);
  background: transparent;
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  text-align: start;
  cursor: pointer;
}

.go-page__shortcuts button span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.go-page__shortcuts button:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

@media (max-width: 56rem) {
  .go-page__header,
  .go-page__workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .go-page__privacy-summary {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .go-page__aside {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 48rem) {
  .go-page {
    gap: var(--a-space-4);
  }

  .go-page__header {
    gap: var(--a-space-4);
    padding-block-start: var(--a-space-6);
  }

  .go-page__scopes {
    align-items: start;
    flex-direction: column;
  }

  .go-page__scopes > span {
    white-space: normal;
  }

  .go-page__results-header {
    display: grid;
    align-items: start;
  }

  .go-page__results-header p {
    white-space: normal;
  }
}

@media (max-width: 34rem) {
  .go-page__privacy-summary,
  .go-page__search,
  .go-page__aside {
    grid-template-columns: minmax(0, 1fr);
  }

  .go-page__search :deep(.a-button) {
    width: 100%;
  }

  .go-page__privacy-summary :deep(.a-toggle) {
    justify-self: stretch;
  }
}
</style>
