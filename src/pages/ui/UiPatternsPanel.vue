<script setup lang="ts">
import { ref } from 'vue'

import ALocaleSwitch from '@/components/ALocaleSwitch.vue'
import AMarketingAction from '@/components/AMarketingAction.vue'
import AMarketingNavigation from '@/components/AMarketingNavigation.vue'
import AStepper from '@/components/AStepper.vue'
import type { AStepSpec } from '@/types/core'
import type {
  ALocaleOption,
  AMarketingLink,
  AMarketingNavEntry
} from '@/types/marketing'

const copiedSnippet = ref('')
const activeStep = ref('permissions')
const workflowStatus = ref('Edita el paso activo; el producto conserva validación y persistencia.')

const marketingEntries: AMarketingNavEntry[] = [
  { kind: 'link', id: 'overview', label: 'Inicio', href: '/ui', current: true },
  {
    kind: 'menu',
    id: 'products',
    label: 'Productos',
    columns: [
      {
        id: 'privacy',
        label: 'Privacidad',
        items: [
          { id: 'midori', label: 'Midori', description: 'Navegación privada y ligera', href: '/products/midori' },
          { id: 'vpn', label: 'MidoriVPN', description: 'Protección en cualquier red', href: '/products/vpn' }
        ]
      },
      {
        id: 'services',
        label: 'Servicios',
        items: [
          { id: 'search', label: 'AstianGO', description: 'Búsqueda con menos rastreo', href: '/products/search' },
          { id: 'cloud', label: 'Astian Cloud', description: 'Archivos seguros para equipos', href: '/products/cloud' }
        ]
      }
    ],
    cta: { id: 'ecosystem', label: 'Explorar el ecosistema', href: '/products' }
  },
  { kind: 'link', id: 'company', label: 'Empresa', href: '/company' }
]

const locales: ALocaleOption[] = [
  { locale: 'es', label: 'Español', shortLabel: 'ES', href: '/es/ui' },
  { locale: 'en', label: 'English', shortLabel: 'EN', href: '/en/ui' },
  { locale: 'pt', label: 'Português', shortLabel: 'PT', href: '/pt/ui' }
]

const workflowSteps: AStepSpec<string>[] = [
  { id: 'details', title: 'Detalles', description: 'Nombre y disponibilidad.', state: 'complete' },
  { id: 'permissions', title: 'Permisos', description: 'Quién puede publicar.' },
  { id: 'review', title: 'Revisión', description: 'Confirma antes de guardar.' }
]

function preventPreviewNavigation(_link: AMarketingLink | ALocaleOption, event: MouseEvent) {
  event.preventDefault()
}

function preventActionNavigation(event: MouseEvent) {
  event.preventDefault()
}

function requestStep(step: AStepSpec<string>) {
  activeStep.value = step.id
  workflowStatus.value = `Paso activo: ${step.title}.`
}

function moveBack(_current: AStepSpec<string>, previous?: AStepSpec<string>) {
  if (!previous) return
  activeStep.value = previous.id
  workflowStatus.value = `Volviste a ${previous.title}.`
}

function moveNext(_current: AStepSpec<string>, next?: AStepSpec<string>) {
  if (!next) return
  activeStep.value = next.id
  workflowStatus.value = `Continuaste a ${next.title}.`
}

function cancelWorkflow() {
  activeStep.value = 'details'
  workflowStatus.value = 'El flujo volvió al primer paso.'
}

function completeWorkflow() {
  workflowStatus.value = 'Configuración lista para que el producto la persista.'
}

async function copySnippet(id: string, snippet: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(snippet)
    copiedSnippet.value = id
  } catch {
    copiedSnippet.value = ''
  }
}
</script>

<template>
  <div id="ui-patterns" class="ui-patterns-panel" data-ui-panel="patterns">
    <section id="ui-marketing" class="ui-patterns-panel__section" aria-labelledby="ui-marketing-title">
      <header class="ui-patterns-panel__heading">
        <div>
          <h2 id="ui-marketing-title">Navegación de marketing</h2>
          <p>Enlaces reales, mega panel intencional y drawer móvil comparten foco, Escape y cierre exterior.</p>
        </div>
        <button
          type="button"
          class="ui-patterns-panel__copy"
          :aria-label="copiedSnippet === 'marketing' ? 'Import copiado' : 'Copiar import de navegación'"
          @click="copySnippet('marketing', &quot;import AMarketingNavigation from '@goastian/astian-ui/marketing-navigation'\nimport ALocaleSwitch from '@goastian/astian-ui/locale-switch'\nimport AMarketingAction from '@goastian/astian-ui/marketing-action'&quot;)"
        >
          {{ copiedSnippet === 'marketing' ? 'Copiado' : 'Copiar import' }}
        </button>
      </header>

      <div class="ui-patterns-panel__navigation-preview">
        <AMarketingNavigation
          :entries="marketingEntries"
          aria-label="Vista previa de navegación Astian"
          mobile-title="Productos Astian"
          @navigate="preventPreviewNavigation"
        >
          <template #brand>
            <a class="ui-patterns-panel__brand" href="/ui" aria-label="Astian, inicio" @click.prevent>
              <span aria-hidden="true">a</span><strong>astian</strong>
            </a>
          </template>
          <template #item-icon="{ item }">
            <span class="ui-patterns-panel__item-mark">{{ item.label.slice(0, 1) }}</span>
          </template>
          <template #header-actions>
            <ALocaleSwitch
              :locales="locales"
              current-locale="es"
              @navigate="preventPreviewNavigation"
            />
            <AMarketingAction href="/contact" variant="secondary" @click="preventActionNavigation">
              Contactar
            </AMarketingAction>
          </template>
        </AMarketingNavigation>
      </div>

      <div class="ui-patterns-panel__utility" aria-label="Acciones y selector de idioma">
        <div>
          <strong>URLs decididas por el servidor</strong>
          <span>Sin Vue Router; cada opción conserva <code>hreflang</code> y la ruta equivalente.</span>
        </div>
        <div class="ui-patterns-panel__utility-actions">
          <ALocaleSwitch
            :locales="locales"
            current-locale="es"
            @navigate="preventPreviewNavigation"
          />
          <AMarketingAction href="/docs/ssr" @click="preventActionNavigation">
            Leer guía SSR
            <template #icon-end>→</template>
          </AMarketingAction>
          <AMarketingAction
            href="https://astian.org"
            external
            target="_blank"
            variant="secondary"
            @click="preventActionNavigation"
          >
            Sitio externo
          </AMarketingAction>
        </div>
      </div>

      <pre class="ui-patterns-panel__code"><code>&lt;ALocaleSwitch :locales="serverLocales" current-locale="es" /&gt;</code></pre>
    </section>

    <section id="ui-workflow" class="ui-patterns-panel__section" aria-labelledby="ui-workflow-title">
      <header class="ui-patterns-panel__heading">
        <div>
          <h2 id="ui-workflow-title">Flujo controlado</h2>
          <p>El componente comunica intención; el CMS decide validación, rutas, red y persistencia.</p>
        </div>
        <button
          type="button"
          class="ui-patterns-panel__copy"
          :aria-label="copiedSnippet === 'workflow' ? 'Import copiado' : 'Copiar import de AStepper'"
          @click="copySnippet('workflow', &quot;import { AStepper } from '@goastian/astian-ui'&quot;)"
        >
          {{ copiedSnippet === 'workflow' ? 'Copiado' : 'Copiar import' }}
        </button>
      </header>

      <div class="ui-patterns-panel__workflow">
        <AStepper
          v-model:active-step="activeStep"
          :steps="workflowSteps"
          label="Preparar publicación"
          @step-request="requestStep"
          @back="moveBack"
          @next="moveNext"
          @cancel="cancelWorkflow"
          @complete="completeWorkflow"
        >
          <template #default="{ step }">
            <p class="ui-patterns-panel__step-copy">
              <strong>{{ step.title }}</strong>
              expone estado y eventos sin conocer el transporte del producto.
            </p>
          </template>
        </AStepper>
        <p class="ui-patterns-panel__status" aria-live="polite">{{ workflowStatus }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ui-patterns-panel {
  display: grid;
}

.ui-patterns-panel__section {
  display: grid;
  gap: var(--a-space-6);
  min-width: 0;
  padding-block: clamp(var(--a-space-6), 5vw, var(--a-space-10));
  border-block-start: var(--a-border-width) solid var(--a-border);
}

.ui-patterns-panel__section:last-child {
  border-block-end: var(--a-border-width) solid var(--a-border);
}

.ui-patterns-panel__heading {
  display: flex;
  gap: var(--a-space-4);
  align-items: start;
  justify-content: space-between;
}

.ui-patterns-panel__heading h2,
.ui-patterns-panel__heading p {
  margin: 0;
}

.ui-patterns-panel__heading h2 {
  color: var(--a-text-primary);
  font-size: var(--a-font-size-xl);
  line-height: var(--a-line-height-tight);
  letter-spacing: var(--a-letter-spacing-heading);
}

.ui-patterns-panel__heading p {
  max-width: var(--a-layout-copy-narrow);
  margin-block-start: var(--a-space-2);
  color: var(--a-text-secondary);
  line-height: var(--a-line-height-body);
}

.ui-patterns-panel__copy {
  flex: none;
  min-width: calc(var(--a-space-16) * 2);
  min-height: var(--a-target-min);
  padding-inline: var(--a-space-3);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: var(--a-text-secondary);
  font: inherit;
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
  white-space: nowrap;
  cursor: pointer;
}

.ui-patterns-panel__copy:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.ui-patterns-panel__copy:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
}

.ui-patterns-panel__navigation-preview,
.ui-patterns-panel__workflow {
  min-width: 0;
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}

.ui-patterns-panel__navigation-preview {
  position: relative;
}

.ui-patterns-panel__navigation-preview :deep(.a-marketing-navigation) {
  background: var(--a-bg-raised);
}

.ui-patterns-panel__navigation-preview :deep(.a-marketing-navigation__panel) {
  inset-inline: var(--a-space-4);
  width: auto;
  transform: none;
}

.ui-patterns-panel__brand {
  display: inline-flex;
  gap: var(--a-space-2);
  align-items: center;
  min-height: var(--a-target-min);
  color: var(--a-text-primary);
  text-decoration: none;
}

.ui-patterns-panel__brand > span,
.ui-patterns-panel__item-mark {
  display: grid;
  place-items: center;
  flex: none;
  width: var(--a-space-8);
  height: var(--a-space-8);
  border-radius: var(--a-radius-xs);
  background: var(--a-text-primary);
  color: var(--a-bg-raised);
  font-weight: var(--a-font-weight-bold);
}

.ui-patterns-panel__brand strong {
  letter-spacing: var(--a-letter-spacing-heading);
}

.ui-patterns-panel__item-mark {
  width: var(--a-space-6);
  height: var(--a-space-6);
  font-size: var(--a-font-size-xs);
}

.ui-patterns-panel__utility {
  display: flex;
  gap: var(--a-space-5);
  align-items: center;
  justify-content: space-between;
  padding-block: var(--a-space-5);
  border-block: var(--a-border-width) solid var(--a-border);
}

.ui-patterns-panel__utility > div:first-child {
  display: grid;
  gap: var(--a-space-1);
  max-width: var(--a-layout-copy-narrow);
}

.ui-patterns-panel__utility span,
.ui-patterns-panel__status {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
}

.ui-patterns-panel__utility code {
  font-family: var(--a-font-mono);
}

.ui-patterns-panel__utility-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--a-space-2);
  align-items: center;
  justify-content: flex-end;
}

.ui-patterns-panel__code {
  max-width: 100%;
  margin: 0;
  padding: var(--a-space-3) var(--a-space-4);
  overflow-x: auto;
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-muted);
  color: var(--a-text-primary);
  font-family: var(--a-font-mono);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.ui-patterns-panel__workflow {
  overflow: clip;
  padding: clamp(var(--a-space-4), 4vw, var(--a-space-8));
}

.ui-patterns-panel__step-copy,
.ui-patterns-panel__status {
  margin: 0;
}

.ui-patterns-panel__step-copy {
  line-height: var(--a-line-height-body);
}

.ui-patterns-panel__status {
  margin-block-start: var(--a-space-5);
  padding-block-start: var(--a-space-4);
  border-block-start: var(--a-border-width) solid var(--a-border);
}

@media (max-width: 47.99rem) {
  .ui-patterns-panel__heading,
  .ui-patterns-panel__utility {
    align-items: stretch;
    flex-direction: column;
  }

  .ui-patterns-panel__copy {
    width: fit-content;
  }

  .ui-patterns-panel__utility-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .ui-patterns-panel__utility-actions :deep(.a-marketing-action) {
    width: 100%;
  }
}

</style>
