<script setup lang="ts">
import { ref } from 'vue'

import {
  AAvatar, ABanner, AButton, AButtonGroup, AButtonGroupItem, AChip, ACircularProgress,
  ACodeInput, ADialog, ADivider, ADropdown, ADropdownItem, ADropdownSubmenu, AFacepile,
  AIcon, AIconButton, AIconText, AInput, AKeyCodeSequence, AMonoTag, APortal,
  ARadioGroup, ASelect, ASkeleton, AStepper, ASurface, ATabs, ATextarea, AToast,
  AToggle, ATooltip, ATypography
} from '@/components'
import { useAstianNotify } from '@/composables/useAstianNotify'
import { componentParity } from '@/migration/componentParity'
import type { ARadioOption, AStepSpec } from '@/types/core'
import type { AstianOption, AstianPerson, AstianTab } from '@/types/ui'

const { notify } = useAstianNotify()
const dialogOpen = ref(false)
const menuOpen = ref(false)
const toastVisible = ref(false)
const bannerVisible = ref(true)
const toggleValue = ref(true)
const code = ref('')
const input = ref('')
const message = ref('Los componentes deben hablar con claridad y respetar el contexto del producto.')
const selectValue = ref<string | number | null>('product')
const visibility = ref<string | null>('team')
const deliveryDate = ref('2026-08-04')
const deliveryTime = ref('2026-08-04T09:30')
const activeStep = ref('details')
const activeTab = ref('foundations')

const visibilityOptions: ARadioOption<string>[] = [
  { label: 'Privado', description: 'Sólo tú puedes abrirlo.', value: 'private' },
  { label: 'Equipo', description: 'Personas del espacio con permiso.', value: 'team' },
  { label: 'Con enlace', description: 'El producto valida el acceso antes de compartir.', value: 'link' }
]

const setupSteps: AStepSpec<string>[] = [
  { id: 'details', title: 'Detalles', description: 'Nombre y disponibilidad.', state: 'complete' },
  { id: 'access', title: 'Acceso', description: 'Quién puede abrirlo.' },
  { id: 'review', title: 'Revisión', description: 'Confirma antes de guardar.' }
]

const options: AstianOption[] = [
  { label: 'Producto', value: 'product', description: 'Interfaces de uso diario', icon: 'category' },
  { label: 'Marketing', value: 'marketing', description: 'Experiencias públicas', icon: 'campaign' },
  { label: 'Operaciones', value: 'operations', description: 'Herramientas internas', icon: 'build' }
]

const tabs: AstianTab[] = [
  { label: 'Fundamentos', value: 'foundations', icon: 'grid_view' },
  { label: 'Componentes', value: 'components', icon: 'widgets', badge: 26 },
  { label: 'Patrones', value: 'patterns', icon: 'account_tree' }
]

const people: AstianPerson[] = [
  { id: '1', name: 'Lucía Rivera', color: 'orange', active: true },
  { id: '2', name: 'Andrés Pardo', color: 'green', active: true },
  { id: '3', name: 'Mina Park', color: 'blue', active: true },
  { id: '4', name: 'João Costa', color: 'pink', active: false },
  { id: '5', name: 'Amara Okafor', color: 'yellow', active: true }
]

const migrationFoundations = [
  { name: 'AAppShell', purpose: 'Shell persistente con header, navegación, main y aside.', contract: 'Skip link, foco de ruta, reflow y slots sin lógica de negocio.' },
  { name: 'ANavigationRail / ASidebar', purpose: 'Navegación agrupada, colapsable y móvil.', contract: 'Roving focus, badges, destino activo y targets de 44 px.' },
  { name: 'ANavItem', purpose: 'Destino de router, URL o acción.', contract: 'Nombre accesible, icono, badge, active y disabled.' },
  { name: 'ABreadcrumbs', purpose: 'Orientación jerárquica responsive.', contract: 'Landmark nav, página actual y rutas intermedias operables.' },
  { name: 'ADrawer / ASidePanel', purpose: 'Panel lateral modal o no modal.', contract: 'Escape, focus trap modal, dismiss y restauración de foco.' },
  { name: 'ACheckbox / ACheckboxGroup', purpose: 'Selección booleana o de colección.', contract: 'Indeterminado, fieldset, hint, error y disabled.' },
  { name: 'ARadio / ARadioGroup', purpose: 'Preferencias mutuamente excluyentes visibles.', contract: 'Modelo tipado, descripción, readonly, flechas, Home/End y espacio.' },
  { name: 'AInput date / datetime-local', purpose: 'Fecha nativa sin conversión de zona horaria.', contract: 'min, max, step, label, hint, error, disabled y readonly.' },
  { name: 'AStepper', purpose: 'Pasos controlados para flujos sucesivos.', contract: 'Estados, orientación, anuncios e intenciones sin navegación de producto.' },
  { name: 'ALinearProgress / AQuotaMeter', purpose: 'Progreso y consumo de cuota.', contract: 'Determinado, indeterminado, estados y valores ARIA.' },
  { name: 'ADataTable', purpose: 'Datos tipados y acciones por fila.', contract: 'Sorting controlado, selección, sticky header y vista móvil.' },
  { name: 'APagination', purpose: 'Páginas o cursores persistibles.', contract: 'Tamaños, total, query string y labels accesibles.' },
  { name: 'AEmptyState / AErrorState', purpose: 'Ausencia, fallo y recuperación.', contract: 'Copy externo, acciones, retry y regiones anunciables.' },
  { name: 'ACombobox / ASearchAutocomplete', purpose: 'Búsqueda y selección asíncrona.', contract: 'Debounce, cancelación, listbox, teclado y aria-activedescendant.' },
  { name: 'AContextMenu', purpose: 'Acciones contextuales consistentes.', contract: 'Clic derecho, Shift+F10, roving focus, submenús y retorno de foco.' },
  { name: 'APopover', purpose: 'Contenido interactivo no modal anclado.', contract: 'Click o foco, posicionamiento, dismiss y Escape.' },
  { name: 'ADropzone / AFileUpload', purpose: 'Selección, arrastre y URL.', contract: 'Tipos, tamaño, permisos y validadores sin transporte.' },
  { name: 'AUploadQueue', purpose: 'Estado de cargas controlado por producto.', contract: 'Progreso, pausa, cancelación, reintento y live region.' }
] as const

const cloudPatterns = [
  { name: 'ACloudPageHeader / ACloudToolbar', purpose: 'Contexto, búsqueda, Nuevo, filtros, orden y vista.' },
  { name: 'AFileItem / AFileCard', purpose: 'Archivo operable, selección, favorito, privacidad y colaboradores.' },
  { name: 'AFolderItem', purpose: 'Carpeta con recuento, permiso, compartición y navegación.' },
  { name: 'AFileGrid / AFileTable', purpose: 'Cambio de vista conservando selección y elemento activo.' },
  { name: 'AFolderTree / AFolderPicker', purpose: 'Jerarquía lazy y selección para mover o copiar.' },
  { name: 'AMediaGrid / APhotoTile', purpose: 'Galería responsive con selección y miniaturas seguras.' },
  { name: 'AMediaViewer / AFilePreview', purpose: 'Imagen, PDF, video, audio, zoom, metadata y fallback.' },
  { name: 'AFileDetailsPanel', purpose: 'Detalles progresivos: tags, permisos, comentarios, versiones y actividad.' },
  { name: 'ANotificationCenter', purpose: 'Unread, grupos, acciones y estado de conexión sin transporte.' },
  { name: 'AStatCard / AMetricCard', purpose: 'Cuota, actividad y equipo con números tabulares.' },
  { name: 'AColorPicker / ASwatchPicker', purpose: 'Swatches con nombre visible; nunca solo color.' }
] as const

const showNotification = () => notify({
  title: 'Cambios guardados',
  body: 'La preferencia ya está disponible en todos los productos.',
  type: 'positive',
  icon: 'check_circle',
  action: { label: 'Ver', handler: () => dialogOpen.value = true }
})
</script>

<template>
  <q-page class="a-page design-system-page">
    <header class="design-system-page__hero a-section">
      <div>
        <span class="a-eyebrow">ASTIAN DESIGN LANGUAGE · 0.1</span>
        <h1 class="a-display">Una interfaz.<br><em>Muchos productos.</em></h1>
        <p class="a-lede">Vue y Quasar forman la infraestructura. Astian UI define el lenguaje: contraste sereno, acciones explícitas, privacidad visible y componentes que funcionan igual en búsqueda, nube, calendario y navegador.</p>
        <AButtonGroup align="left">
          <AButton label="Explorar componentes" icon="widgets" @click="activeTab = 'components'" />
          <AButton label="Abrir diálogo" type="secondary" icon="open_in_new" @click="dialogOpen = true" />
        </AButtonGroup>
      </div>
      <ASurface level="l2" class="design-system-page__manifesto">
        <span class="a-eyebrow">PRINCIPIO 01</span>
        <blockquote>“La privacidad no debe sentirse como una configuración avanzada. Debe estar presente en cada decisión.”</blockquote>
        <div class="design-system-page__manifesto-meta"><AFacepile :people="people" :max-displayed="4" size="xmedium" /><span>Equipo de producto Astian</span></div>
      </ASurface>
    </header>

    <ABanner v-if="bannerVisible" label="Esta base es migrable por producto: adopta tokens primero y componentes después." icon="compare_arrows" color="green" closable :actions="[{ label: 'Ver estrategia', action: () => dialogOpen = true }]" @close="bannerVisible = false" />

    <ATabs v-model="activeTab" :tabs="tabs" size="large" />

    <section class="a-section">
      <div class="a-section__header"><div><span class="a-eyebrow">FUNDAMENTOS</span><h2>Color, tipo y ritmo</h2></div><p class="a-lede">Los tokens semánticos permiten cambiar de marca o tema sin reescribir componentes. Las aplicaciones consumen intención, no valores hexadecimales.</p></div>
      <div class="a-grid">
        <ASurface class="design-system-page__type" level="l2"><ATypography size="h2" weight="bold">Buscar sin dejar rastro.</ATypography><ATypography tone="secondary" size="large">Titulares compactos, texto cómodo y datos tabulares cuando importa comparar.</ATypography><AKeyCodeSequence shortcut="Ctrl + K" size="large" /></ASurface>
        <ASurface class="design-system-page__colors" level="l2">
          <div v-for="color in ['primary','accent','positive','info','warning','negative']" :key="color" class="design-system-page__swatch" :class="`design-system-page__swatch--${color}`"><span></span><div><strong>{{ color }}</strong><small>token semántico</small></div></div>
        </ASurface>
      </div>
    </section>

    <section class="a-section">
      <div class="a-section__header"><div><span class="a-eyebrow">ACCIONES</span><h2>Jerarquía antes que decoración</h2></div><p class="a-lede">Cada acción comunica prioridad, riesgo y estado. Hover, foco y presión son parte del contrato.</p></div>
      <ASurface level="l1" class="design-system-page__showcase">
        <div class="design-system-page__row"><AButton label="Acción principal" icon="arrow_forward" /><AButton label="Secundaria" type="secondary" /><AButton label="Tercera" type="tertiary" /><AButton label="Eliminar" type="destructive" icon="delete" /><AButton label="Procesando" loading /></div>
        <ADivider />
          <div class="design-system-page__row"><AIconButton icon="edit" label="Editar" type="primary" variant="filled" /><AIconButton icon="share" label="Compartir" /><AIconButton icon="delete" label="Eliminar" type="destructive" /><AIconText start-icon="lock" label="Cifrado local" tone="secondary" /><AIconText start-icon="open_in_new" label="Abrir producto" tone="link" interactive /></div>
        <ADivider />
        <div class="design-system-page__row"><AChip label="Privado" icon="visibility_off" color="green" selected /><AChip label="Sincronizado" icon="sync" color="blue" /><AChip label="Borrador" color="orange" removable /><AMonoTag label="E2EE" icon="encrypted" /><AMonoTag label="BETA 04" color="orange" /></div>
      </ASurface>
    </section>

    <section class="a-section">
      <div class="a-section__header"><div><span class="a-eyebrow">ENTRADA</span><h2>Campos que explican qué ocurre</h2></div><p class="a-lede">Ayuda, validación y estados aparecen junto al dato; nunca en alertas desconectadas.</p></div>
      <div class="a-grid">
        <ASurface level="l2" class="design-system-page__form">
          <AInput v-model="input" label="Nombre del espacio" placeholder="Ej. Producto AstianGO" icon="folder" hint="Visible sólo para tu equipo" clearable />
          <ASelect v-model="selectValue" :options="options" label="Contexto de uso" />
          <ARadioGroup
            v-model="visibility"
            label="Visibilidad"
            :options="visibilityOptions"
            orientation="horizontal"
            hint="Las opciones permanecen visibles para comparar su alcance."
            required
          />
          <div class="design-system-page__date-fields">
            <AInput v-model="deliveryDate" type="date" label="Fecha de entrega" min="2026-08-01" max="2026-12-31" />
            <AInput v-model="deliveryTime" type="datetime-local" label="Publicar" step="900" hint="Se conserva la hora local escrita." />
          </div>
          <ATextarea v-model="message" label="Descripción" autogrow />
          <div class="design-system-page__row"><AToggle v-model="toggleValue" label="Compartir cambios con el equipo" /><q-space /><AButton label="Guardar" @click="showNotification" /></div>
        </ASurface>
        <ASurface level="l2" class="design-system-page__verification">
          <span class="a-eyebrow">SEGURIDAD LOCAL</span><ATypography size="h3" weight="bold">Confirma el dispositivo</ATypography><ATypography tone="secondary">Introduce el código de seis caracteres enviado a tu sesión activa.</ATypography><ACodeInput v-model="code" :code-length="6" @submit="showNotification" />
          <div class="design-system-page__progress"><ACircularProgress :progress="72">72</ACircularProgress><div><strong>Configuración segura</strong><small>3 de 4 controles activos</small></div></div>
        </ASurface>
      </div>
      <ASurface level="l1" class="design-system-page__showcase design-system-page__stepper">
        <AStepper
          v-model:active-step="activeStep"
          :steps="setupSteps"
          @next="(_current, next) => { if (next) activeStep = next.id }"
          @back="(_current, previous) => { if (previous) activeStep = previous.id }"
          @step-request="step => activeStep = step.id"
          @cancel="showNotification"
          @complete="showNotification"
        >
          <template #default="{ step }">
            <p class="a-lede">Contenido controlado del paso <strong>{{ step.title }}</strong>. La aplicación conserva validación, persistencia y rutas.</p>
          </template>
        </AStepper>
      </ASurface>
    </section>

    <section class="a-section">
      <div class="a-section__header"><div><span class="a-eyebrow">IDENTIDAD Y ESTADOS</span><h2>Personas, progreso y ausencia</h2></div><p class="a-lede">Los avatares preservan la escala del sistema original; skeletons y progresos evitan saltos durante las cargas.</p></div>
      <ASurface level="l1" class="design-system-page__showcase">
        <div class="design-system-page__row"><AAvatar v-for="(person, index) in people" :key="person.id" :label="person.name" :color="person.color" :active="person.active" :size="index === 0 ? 'large' : 'xmedium'" rounded :show-badge="index < 2" /><AFacepile :people="people" :max-displayed="3" size="xmedium" /></div>
        <ADivider />
        <div class="design-system-page__skeletons"><ASkeleton type="QAvatar" width="44px" height="44px" /><div><ASkeleton width="190px" height="13px" /><ASkeleton width="130px" height="10px" /></div><ACircularProgress spinner size="medium" /></div>
      </ASurface>
    </section>

    <section class="a-section">
      <div class="a-section__header"><div><span class="a-eyebrow">OVERLAYS</span><h2>Capas con contexto y salida clara</h2></div><p class="a-lede">Menús, tooltips y diálogos heredan posicionamiento, navegación por teclado y cierre accesible de Quasar.</p></div>
      <ASurface level="l2" class="design-system-page__overlay-demo">
        <AButton id="overlay-menu-trigger" label="Abrir menú" type="secondary" icon="more_horiz" />
        <ADropdown v-model="menuOpen" target="#overlay-menu-trigger" auto-close width="240px"><ADropdownItem label="Duplicar vista" icon="content_copy" shortcut="⌘D" @click="showNotification" /><ADropdownSubmenu label="Mover a producto" icon="drive_file_move"><ADropdownItem label="AstianGO" icon="travel_explore" /><ADropdownItem label="Astian Cloud" icon="cloud" /></ADropdownSubmenu><ADivider /><ADropdownItem label="Eliminar vista" icon="delete" color="destructive" /></ADropdown>
        <AButton label="Abrir diálogo" @click="dialogOpen = true" />
        <AButton label="Mostrar toast" type="tertiary" icon="notifications" @click="toastVisible = true" />
        <span class="design-system-page__tooltip-trigger" tabindex="0">Pasa por aquí <ATooltip title="La ayuda aparece con mouse y teclado" shortcut="?" /></span>
      </ASurface>
    </section>

    <section class="a-section">
      <div class="a-section__header"><div><span class="a-eyebrow">API PÚBLICA</span><h2>Todos los componentes, sin excepciones</h2></div><p class="a-lede">La matriz se genera desde el mismo inventario que validan las pruebas. Cada familia React tiene una decisión Vue/Quasar explícita.</p></div>
      <div class="a-grid">
        <ASurface level="l2" class="design-system-page__api-sample">
          <span class="a-eyebrow">PRIMITIVAS RESTANTES</span>
          <div class="design-system-page__row"><AIcon name="shield" label="Protección" size="large" /><AIcon name="shield-encrypt" legacy label="Cifrado heredado" size="large" /><AIcon name="sync" tone="link" :rotate="18" /></div>
          <AButtonGroup layout="stacked" full-width><AButtonGroupItem label="Publicar cambios" icon="publish" /><AButtonGroupItem label="Programar" icon="schedule" type="secondary" /><AButtonGroupItem label="Acción no disponible" disabled /></AButtonGroup>
          <APortal disabled><p class="design-system-page__portal-note"><AIcon name="move_up" size="small" /> Portal desactivado: el contenido permanece en contexto.</p></APortal>
        </ASurface>
        <ASurface level="l1" :padding="false" class="design-system-page__parity">
          <div class="design-system-page__parity-header"><strong>Paridad React → Vue</strong><AMonoTag :label="`${componentParity.length}/28`" /></div>
          <div class="design-system-page__parity-list">
            <div v-for="entry in componentParity" :key="entry.source" class="design-system-page__parity-row">
              <strong>{{ entry.source }}</strong><span>{{ entry.targets.join(' + ') }}</span><AMonoTag :label="entry.strategy" :color="entry.strategy === 'quasar-native' ? 'blue' : entry.strategy === 'adapted' ? 'orange' : 'green'" />
            </div>
          </div>
        </ASurface>
      </div>
    </section>

    <section id="cloud-migration-components" class="a-section">
      <div class="a-section__header">
        <div><span class="a-eyebrow">MIGRACIÓN ASTIAN CLOUD</span><h2>Contratos antes que pantallas</h2></div>
        <p class="a-lede">El núcleo permanece reutilizable y los patrones de almacenamiento viven en <code>@goastian/astian-ui/cloud</code>. Todos reciben estado y emiten intención; ninguno conoce Axios, Pinia, cifrado ni transporte.</p>
      </div>

      <div class="design-system-page__migration-note" role="note">
        <AIcon name="difference" size="large" />
        <div>
          <strong>Equivalencia con el Skiff UI original</strong>
          <p><code>Dialog</code>, <code>Dropdown</code>, <code>Select</code>, <code>CircularProgress</code>, <code>Surface</code> y <code>Portal</code> aportaron referencias conceptuales. El shell, tablas, uploads y patrones Cloud no tenían equivalentes públicos directos; se diseñaron como contratos Vue nuevos sin modificar React.</p>
        </div>
      </div>

      <div class="design-system-page__contract-grid">
        <ASurface level="l2" class="design-system-page__contract-panel">
          <div class="design-system-page__contract-heading">
            <div><span class="a-eyebrow">P0 / CORE</span><h3>Fundamentos de migración</h3></div>
            <AMonoTag :label="`${migrationFoundations.length} familias`" color="green" />
          </div>
          <div class="design-system-page__contract-list">
            <article v-for="component in migrationFoundations" :key="component.name">
              <code>{{ component.name }}</code>
              <strong>{{ component.purpose }}</strong>
              <p>{{ component.contract }}</p>
            </article>
          </div>
        </ASurface>

        <ASurface level="l2" class="design-system-page__contract-panel">
          <div class="design-system-page__contract-heading">
            <div><span class="a-eyebrow">P1 / CLOUD</span><h3>Patrones del producto</h3></div>
            <AMonoTag label="./cloud" color="blue" />
          </div>
          <div class="design-system-page__contract-list">
            <article v-for="component in cloudPatterns" :key="component.name">
              <code>{{ component.name }}</code>
              <strong>{{ component.purpose }}</strong>
              <p>API presentacional controlada, estados explícitos y acciones por eventos.</p>
            </article>
          </div>
        </ASurface>
      </div>

      <router-link class="design-system-page__cloud-link" to="/cloud">
        Probar la composición de referencia de Astian Cloud
        <AIcon name="arrow_forward" />
      </router-link>
    </section>

    <ADialog v-model="dialogOpen" title="Una decisión compartida" description="Este patrón funciona para confirmaciones y edición breve sin sacar a la persona de su contexto." icon="hub" type="confirm">
      <ATypography tone="secondary">Los componentes se publicarán desde <AMonoTag label="@goastian/astian-ui" /> y cada producto podrá adoptar la base a su ritmo.</ATypography>
      <template #actions><AButton label="Cancelar" type="tertiary" @click="dialogOpen = false" /><AButton label="Entendido" @click="dialogOpen = false; showNotification()" /></template>
    </ADialog>
    <AToast v-model="toastVisible" title="Componente controlado" body="AToast convive con el servicio global de notificaciones." icon="check_circle" :actions="[{ label: 'Cerrar', action: () => toastVisible = false }]" />
  </q-page>
</template>

<style scoped>
.design-system-page__hero { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(320px, .72fr); gap: clamp(28px, 6vw, 90px); align-items: end; min-height: calc(84dvh - 66px); }.design-system-page__hero em { color: var(--a-primary); font-style: normal; }.design-system-page__hero .a-lede { margin: 28px 0; }
.design-system-page__manifesto { margin-bottom: 6vh; transform: rotate(1.4deg); }.design-system-page__manifesto blockquote { margin: 44px 0 32px; font-size: clamp(1.5rem, 2.4vw, 2.25rem); line-height: 1.2; letter-spacing: -.035em; }.design-system-page__manifesto-meta { display: flex; gap: 14px; align-items: center; color: var(--a-text-secondary); font-size: .78rem; }
.design-system-page__type { grid-column: span 7; display: grid; gap: 24px; align-content: space-between; min-height: 330px; }.design-system-page__colors { grid-column: span 5; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }.design-system-page__swatch { display: grid; grid-template-columns: 52px 1fr; gap: 10px; align-items: center; padding: 9px; border-radius: 10px; background: var(--a-bg-muted); }.design-system-page__swatch > span { display: block; height: 52px; border-radius: 8px; background: var(--swatch, var(--a-primary)); }.design-system-page__swatch div { display: grid; min-width: 0; }.design-system-page__swatch strong { font: .72rem var(--a-font-mono); }.design-system-page__swatch small { color: var(--a-text-tertiary); font-size: .62rem; }.design-system-page__swatch--accent { --swatch: var(--a-accent); }.design-system-page__swatch--positive { --swatch: var(--a-positive); }.design-system-page__swatch--info { --swatch: var(--a-info); }.design-system-page__swatch--warning { --swatch: var(--a-warning); }.design-system-page__swatch--negative { --swatch: var(--a-negative); }
.design-system-page__showcase { display: grid; gap: 20px; }.design-system-page__row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }.design-system-page__form { grid-column: span 7; display: grid; gap: 16px; }.design-system-page__verification { grid-column: span 5; display: grid; gap: 16px; align-content: start; }.design-system-page__date-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--a-space-3); }.design-system-page__stepper { margin-top: var(--a-space-4); }.design-system-page__progress { display: flex; gap: 13px; align-items: center; margin-top: 10px; padding-top: 18px; border-top: 1px solid var(--a-border); }.design-system-page__progress div { display: grid; }.design-system-page__progress small { color: var(--a-text-secondary); }.design-system-page__skeletons { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; max-width: 430px; }.design-system-page__skeletons > div { display: grid; gap: 8px; }.design-system-page__overlay-demo { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }.design-system-page__tooltip-trigger { border-bottom: 1px dashed var(--a-border-strong); color: var(--a-text-secondary); font-size: .82rem; cursor: help; }
.design-system-page__api-sample { grid-column: span 4; display: grid; gap: 20px; align-content: start; }.design-system-page__portal-note { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--a-text-secondary); font-size: .78rem; }.design-system-page__parity { grid-column: span 8; overflow: hidden; }.design-system-page__parity-header,.design-system-page__parity-row { display: grid; grid-template-columns: 1fr 1.4fr auto; gap: 12px; align-items: center; }.design-system-page__parity-header { padding: 18px 20px; border-bottom: 1px solid var(--a-border); }.design-system-page__parity-list { max-height: 430px; overflow: auto; }.design-system-page__parity-row { min-height: 43px; padding: 7px 20px; border-bottom: 1px solid var(--a-border); font-size: .75rem; }.design-system-page__parity-row:last-child { border: 0; }.design-system-page__parity-row span { color: var(--a-text-secondary); }
.design-system-page__migration-note { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--a-space-4); align-items: start; margin-bottom: var(--a-space-5); padding: var(--a-space-4); border: var(--a-border-width) solid var(--a-border); border-radius: var(--a-radius-md); background: var(--a-bg-muted); color: var(--a-text-secondary); }.design-system-page__migration-note > :deep(.a-icon) { color: var(--a-primary); }.design-system-page__migration-note strong { color: var(--a-text-primary); }.design-system-page__migration-note p { max-width: var(--a-layout-copy); margin: var(--a-space-1) var(--a-space-0) var(--a-space-0); }.design-system-page__migration-note code,.design-system-page__contract-list code,.design-system-page__cloud-link { font-family: var(--a-font-mono); }
.design-system-page__contract-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--a-space-4); }.design-system-page__contract-panel { min-width: 0; }.design-system-page__contract-heading { display: flex; gap: var(--a-space-4); align-items: start; justify-content: space-between; margin-bottom: var(--a-space-4); }.design-system-page__contract-heading h3 { margin: var(--a-space-2) var(--a-space-0) var(--a-space-0); font-size: var(--a-font-size-xl); }.design-system-page__contract-list { display: grid; gap: var(--a-space-2); }.design-system-page__contract-list article { display: grid; gap: var(--a-space-1); padding: var(--a-space-3); border: var(--a-border-width) solid var(--a-border); border-radius: var(--a-radius-sm); background: var(--a-bg-surface); }.design-system-page__contract-list code { color: var(--a-primary); font-size: var(--a-font-size-xs); font-weight: var(--a-font-weight-bold); overflow-wrap: anywhere; }.design-system-page__contract-list strong { font-size: var(--a-font-size-sm); }.design-system-page__contract-list p { margin: var(--a-space-0); color: var(--a-text-secondary); font-size: var(--a-font-size-xs); line-height: var(--a-line-height-body); }
.design-system-page__cloud-link { display: inline-flex; min-height: var(--a-target-min); gap: var(--a-space-2); align-items: center; margin-top: var(--a-space-5); padding: var(--a-space-2) var(--a-space-4); border-radius: var(--a-radius-sm); background: var(--a-primary); color: var(--a-text-inverse); font-size: var(--a-font-size-sm); font-weight: var(--a-font-weight-bold); text-decoration: none; }
@media (max-width: 900px) { .design-system-page__hero { grid-template-columns: 1fr; min-height: auto; }.design-system-page__manifesto { margin: 0; transform: none; }.design-system-page__type,.design-system-page__colors,.design-system-page__form,.design-system-page__verification { grid-column: 1 / -1; } }
@media (max-width: 900px) { .design-system-page__api-sample,.design-system-page__parity { grid-column: 1 / -1; }.design-system-page__contract-grid { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .design-system-page__colors,.design-system-page__date-fields { grid-template-columns: 1fr; }.design-system-page__row :deep(.a-button) { width: 100%; }.design-system-page__manifesto blockquote { margin-top: 28px; }.design-system-page__parity-header,.design-system-page__parity-row { grid-template-columns: 1fr auto; }.design-system-page__parity-row > span { grid-column: 1 / -1; grid-row: 2; } }
</style>
