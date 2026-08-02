<script setup lang="ts">
import { ref } from 'vue'

import AButton from '@/components/AButton.vue'
import ACheckbox from '@/components/ACheckbox.vue'
import AChip from '@/components/AChip.vue'
import AInput from '@/components/AInput.vue'
import ALinearProgress from '@/components/ALinearProgress.vue'
import ARadioGroup from '@/components/ARadioGroup.vue'
import ASelect from '@/components/ASelect.vue'
import ATextarea from '@/components/ATextarea.vue'
import AToggle from '@/components/AToggle.vue'
import type { ARadioOption } from '@/types/core'
import type { AstianOption } from '@/types/ui'

const workspaceName = ref('Sitio editorial')
const summary = ref('Publica con controles claros, estados explícitos y HTML semántico.')
const context = ref<string | number | null>('product')
const visibility = ref<string | null>('team')
const analyticsEnabled = ref(true)
const accepted = ref(true)
const copiedSnippet = ref('')

const contextOptions: AstianOption[] = [
  { label: 'Producto', value: 'product', description: 'Flujos de uso diario' },
  { label: 'Marketing', value: 'marketing', description: 'Experiencias públicas' },
  { label: 'Operaciones', value: 'operations', description: 'Herramientas internas' }
]

const visibilityOptions: ARadioOption<string>[] = [
  { label: 'Privado', description: 'Sólo tú puedes abrirlo.', value: 'private' },
  { label: 'Equipo', description: 'Miembros con permiso.', value: 'team' },
  { label: 'Enlace', description: 'El servidor valida el acceso.', value: 'link' }
]

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
  <div id="ui-components" class="ui-components-panel" data-ui-panel="components">
    <section id="ui-actions" class="ui-components-panel__section" aria-labelledby="ui-actions-title">
      <header class="ui-components-panel__heading">
        <div>
          <h2 id="ui-actions-title">Acciones y estados</h2>
          <p>La prioridad se entiende por contraste; cargar y desactivar conservan el mismo ancho.</p>
        </div>
        <button
          type="button"
          class="ui-components-panel__copy"
          :aria-label="copiedSnippet === 'actions' ? 'Import copiado' : 'Copiar import de AButton'"
          @click="copySnippet('actions', &quot;import AButton from '@goastian/astian-ui/button'&quot;)"
        >
          {{ copiedSnippet === 'actions' ? 'Copiado' : 'Copiar import' }}
        </button>
      </header>

      <div class="ui-components-panel__preview" aria-label="Variantes de botón">
        <AButton label="Guardar cambios" />
        <AButton label="Vista previa" type="secondary" />
        <AButton label="Más tarde" type="tertiary" />
        <AButton label="Eliminar" type="destructive" />
        <AButton label="Guardando" loading />
        <AButton label="No disponible" disabled />
      </div>

      <pre class="ui-components-panel__code"><code>&lt;AButton type="secondary"&gt;Vista previa&lt;/AButton&gt;</code></pre>
    </section>

    <section id="ui-forms" class="ui-components-panel__section" aria-labelledby="ui-fields-title">
      <header class="ui-components-panel__heading">
        <div>
          <h2 id="ui-fields-title">Campos con contexto</h2>
          <p>Etiqueta, ayuda y error permanecen unidos al dato y llegan al árbol accesible.</p>
        </div>
        <button
          type="button"
          class="ui-components-panel__copy"
          :aria-label="copiedSnippet === 'fields' ? 'Imports copiados' : 'Copiar imports de formulario'"
          @click="copySnippet('fields', &quot;import AInput from '@goastian/astian-ui/input'\nimport ATextarea from '@goastian/astian-ui/textarea'&quot;)"
        >
          {{ copiedSnippet === 'fields' ? 'Copiado' : 'Copiar imports' }}
        </button>
      </header>

      <div class="ui-components-panel__fields">
        <AInput
          v-model="workspaceName"
          label="Nombre del espacio"
          hint="Visible para las personas invitadas."
          autocomplete="organization"
          clearable
        />
        <ASelect
          v-model="context"
          :options="contextOptions"
          label="Contexto de uso"
        />
        <ATextarea
          v-model="summary"
          label="Descripción"
          :rows="3"
          :maxlength="180"
          hint="Máximo 180 caracteres."
        />
        <AInput
          model-value=""
          label="Dominio público"
          placeholder="equipo.astian.org"
          error
          error-message="Escribe un dominio válido."
          aria-invalid="true"
        />
      </div>
    </section>

    <section id="ui-selection" class="ui-components-panel__section" aria-labelledby="ui-selection-title">
      <header class="ui-components-panel__heading">
        <div>
          <h2 id="ui-selection-title">Selección y progreso</h2>
          <p>Los controles nativos siguen operables con teclado; el color nunca carga solo con el significado.</p>
        </div>
        <button
          type="button"
          class="ui-components-panel__copy"
          :aria-label="copiedSnippet === 'selection' ? 'Import copiado' : 'Copiar import SSR de ACheckbox'"
          @click="copySnippet('selection', &quot;import ACheckbox from '@goastian/astian-ui/checkbox'&quot;)"
        >
          {{ copiedSnippet === 'selection' ? 'Copiado' : 'Copiar import SSR' }}
        </button>
      </header>

      <div class="ui-components-panel__selection-grid">
        <div class="ui-components-panel__control-stack">
          <ACheckbox
            v-model="accepted"
            label="Confirmar antes de publicar"
            hint="Evita cambios accidentales en producción."
          />
          <ACheckbox
            :model-value="false"
            label="Configuración parcial"
            indeterminate
          />
          <AToggle v-model="analyticsEnabled" label="Métricas privadas" />
        </div>

        <ARadioGroup
          v-model="visibility"
          label="Visibilidad"
          :options="visibilityOptions"
          orientation="horizontal"
          hint="Usa flechas, Inicio y Fin para cambiar la opción."
        />
      </div>

      <div class="ui-components-panel__status-row" aria-label="Etiquetas y progreso">
        <div class="ui-components-panel__chips">
          <AChip label="Privado" color="green" selected />
          <AChip label="Sincronizado" color="blue" />
          <AChip label="Revisar" color="orange" />
        </div>
        <ALinearProgress :value="68" label="Configuración" value-label="2 de 3 pasos" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.ui-components-panel {
  display: grid;
}

.ui-components-panel__section {
  display: grid;
  gap: var(--a-space-6);
  padding-block: clamp(var(--a-space-6), 5vw, var(--a-space-10));
  border-block-start: var(--a-border-width) solid var(--a-border);
}

.ui-components-panel__section:last-child {
  border-block-end: var(--a-border-width) solid var(--a-border);
}

.ui-components-panel__heading {
  display: flex;
  gap: var(--a-space-4);
  align-items: start;
  justify-content: space-between;
}

.ui-components-panel__heading h2,
.ui-components-panel__heading p {
  margin: 0;
}

.ui-components-panel__heading h2 {
  color: var(--a-text-primary);
  font-size: var(--a-font-size-xl);
  line-height: var(--a-line-height-tight);
  letter-spacing: var(--a-letter-spacing-heading);
}

.ui-components-panel__heading p {
  max-width: var(--a-layout-copy-narrow);
  margin-block-start: var(--a-space-2);
  color: var(--a-text-secondary);
  line-height: var(--a-line-height-body);
}

.ui-components-panel__copy {
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

.ui-components-panel__copy:hover {
  background: var(--a-bg-hover);
  color: var(--a-text-primary);
}

.ui-components-panel__copy:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
}

.ui-components-panel__preview,
.ui-components-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--a-space-3);
  align-items: center;
}

.ui-components-panel__fields,
.ui-components-panel__selection-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--a-space-5);
  align-items: start;
}

.ui-components-panel__control-stack {
  display: grid;
  gap: var(--a-space-4);
}

.ui-components-panel__status-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 1fr);
  gap: var(--a-space-6);
  align-items: center;
  padding-block-start: var(--a-space-5);
  border-block-start: var(--a-border-width) solid var(--a-border);
}

.ui-components-panel__code {
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

@media (max-width: 47.99rem) {
  .ui-components-panel__heading {
    align-items: stretch;
    flex-direction: column;
  }

  .ui-components-panel__copy {
    width: fit-content;
  }

  .ui-components-panel__fields,
  .ui-components-panel__selection-grid,
  .ui-components-panel__status-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

</style>
