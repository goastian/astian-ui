<script setup lang="ts">
import { ref } from 'vue'
import { AAvatar, AButton, AChip, AFacepile, AIconButton, AInput, AMonoTag, ASurface } from '@/components'
import type { AstianPerson } from '@/types/ui'

const search = ref('')
const view = ref<'grid' | 'list'>('grid')
const people: AstianPerson[] = [{ id: '1', name: 'Lucía Rivera', color: 'orange' }, { id: '2', name: 'Mina Park', color: 'blue' }, { id: '3', name: 'Andrés Pardo', color: 'green' }]
const files = [
  { name: 'Estrategia producto 2026', type: 'Documento', icon: 'description', color: 'green', meta: 'Editado hace 12 min', shared: true },
  { name: 'Research · navegación privada', type: 'Colección', icon: 'folder', color: 'orange', meta: '18 elementos', shared: true },
  { name: 'Sistema visual Astian', type: 'Diseño', icon: 'draw', color: 'blue', meta: 'Editado ayer', shared: false },
  { name: 'Calendario lanzamientos', type: 'Hoja', icon: 'table', color: 'pink', meta: 'Editado el 14 jul', shared: true },
  { name: 'Contratos proveedores', type: 'Colección', icon: 'folder_lock', color: 'yellow', meta: '6 elementos', shared: false },
  { name: 'Informe de transparencia', type: 'PDF', icon: 'picture_as_pdf', color: 'red', meta: '2,4 MB', shared: false }
]
</script>

<template>
  <q-page class="a-page cloud-page">
    <header class="cloud-page__header"><div><span class="a-eyebrow">ASTIAN CLOUD / ARCHIVOS</span><h1>Tu espacio de trabajo</h1><p>8,7 GB de 25 GB utilizados · cifrado de extremo a extremo</p></div><AButton label="Nuevo" icon="add" /></header>
    <div class="cloud-page__tools"><AInput v-model="search" placeholder="Buscar en archivos" icon="search" size="small" /><div class="cloud-page__view"><AIconButton icon="grid_view" label="Vista de cuadrícula" :variant="view === 'grid' ? 'filled' : 'unfilled'" @click="view = 'grid'" /><AIconButton icon="view_list" label="Vista de lista" :variant="view === 'list' ? 'filled' : 'unfilled'" @click="view = 'list'" /></div></div>

    <section class="cloud-page__stats">
      <ASurface><span class="a-eyebrow">ALMACENAMIENTO</span><strong class="a-tabular">8,7 <small>GB</small></strong><q-linear-progress :value=".348" color="primary" rounded /><p>16,3 GB disponibles</p></ASurface>
      <ASurface><span class="a-eyebrow">ACTIVIDAD</span><strong class="a-tabular">27 <small>cambios</small></strong><p>Esta semana, 11 compartidos</p></ASurface>
      <ASurface><span class="a-eyebrow">EQUIPO</span><AFacepile :people="people" size="xmedium" /><p>3 personas activas ahora</p></ASurface>
    </section>

    <section><div class="cloud-page__section-title"><div><h2>Recientes</h2><p>Archivos que abriste o editaste</p></div><AChip label="Últimos 30 días" icon="schedule" /></div>
      <div class="cloud-page__files" :class="`cloud-page__files--${view}`">
        <article v-for="file in files" :key="file.name" class="cloud-page__file">
          <div class="cloud-page__file-top"><span class="cloud-page__file-icon" :class="`cloud-page__file-icon--${file.color}`"><q-icon :name="file.icon" /></span><AIconButton icon="more_horiz" label="Opciones del archivo" size="small" /></div>
          <div class="cloud-page__file-info"><h3>{{ file.name }}</h3><p>{{ file.meta }}</p></div>
          <div class="cloud-page__file-bottom"><AMonoTag :label="file.type" :color="file.color as any" /><span v-if="file.shared"><AAvatar label="Lucía Rivera" size="small" color="orange" rounded /> compartido</span><span v-else><q-icon name="lock" /> privado</span></div>
        </article>
      </div>
    </section>
  </q-page>
</template>

<style scoped>
.cloud-page__header { display: flex; justify-content: space-between; gap: 30px; align-items: end; padding: 54px 0 30px; }.cloud-page__header h1 { margin: 9px 0 6px; font-size: clamp(2.2rem, 4vw, 4.4rem); line-height: 1; letter-spacing: -.055em; }.cloud-page__header p,.cloud-page__section-title p { margin: 0; color: var(--a-text-secondary); }.cloud-page__tools { display: grid; grid-template-columns: minmax(220px, 420px) auto; justify-content: space-between; gap: 12px; padding: 12px 0 20px; border-bottom: 1px solid var(--a-border); }.cloud-page__view { display: flex; }
.cloud-page__stats { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 12px; padding: 24px 0 46px; }.cloud-page__stats .a-surface { display: grid; gap: 14px; align-content: space-between; min-height: 150px; }.cloud-page__stats strong { font-size: 2.1rem; letter-spacing: -.05em; }.cloud-page__stats strong small { color: var(--a-text-secondary); font-size: .8rem; letter-spacing: 0; }.cloud-page__stats p { margin: 0; color: var(--a-text-secondary); font-size: .75rem; }.cloud-page__section-title { display: flex; justify-content: space-between; gap: 20px; align-items: end; margin-bottom: 18px; }.cloud-page__section-title h2 { margin: 0 0 4px; font-size: 1.7rem; letter-spacing: -.035em; }
.cloud-page__files { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }.cloud-page__file { display: grid; min-height: 220px; padding: 16px; border: 1px solid var(--a-border); border-radius: 15px; background: var(--a-bg-surface); transition: transform var(--a-motion-base), border var(--a-motion-base), box-shadow var(--a-motion-base); }.cloud-page__file:hover { transform: translateY(-3px); border-color: var(--a-border-strong); box-shadow: var(--a-shadow-1); }.cloud-page__file-top,.cloud-page__file-bottom { display: flex; justify-content: space-between; align-items: center; }.cloud-page__file-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 13px; background: var(--a-primary-soft); color: var(--a-primary); font-size: 24px; }.cloud-page__file-icon--orange { background: var(--a-accent-soft); color: var(--a-accent); }.cloud-page__file-icon--blue { background: color-mix(in srgb, var(--a-info) 13%, transparent); color: var(--a-info); }.cloud-page__file-icon--red { background: color-mix(in srgb, var(--a-negative) 13%, transparent); color: var(--a-negative); }.cloud-page__file-icon--yellow { background: color-mix(in srgb, var(--a-warning) 13%, transparent); color: var(--a-warning); }.cloud-page__file-icon--pink { background: color-mix(in srgb, #b65a85 13%, transparent); color: #b65a85; }.cloud-page__file-info { align-self: end; }.cloud-page__file-info h3 { margin: 0; font-size: .95rem; }.cloud-page__file-info p { margin: 5px 0 0; color: var(--a-text-secondary); font-size: .72rem; }.cloud-page__file-bottom { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--a-border); }.cloud-page__file-bottom > span { display: flex; gap: 5px; align-items: center; color: var(--a-text-tertiary); font-size: .66rem; }.cloud-page__files--list { grid-template-columns: 1fr; }.cloud-page__files--list .cloud-page__file { grid-template-columns: auto 1fr auto; gap: 16px; align-items: center; min-height: auto; }.cloud-page__files--list .cloud-page__file-top { display: contents; }.cloud-page__files--list .cloud-page__file-top :deep(.a-icon-button) { order: 4; }.cloud-page__files--list .cloud-page__file-info { align-self: center; }.cloud-page__files--list .cloud-page__file-bottom { justify-content: flex-start; gap: 14px; margin: 0; padding: 0; border: 0; }
@media (max-width: 940px) { .cloud-page__files { grid-template-columns: repeat(2, 1fr); }.cloud-page__stats { grid-template-columns: 1fr 1fr; }.cloud-page__stats > :first-child { grid-column: 1 / -1; } }
@media (max-width: 620px) { .cloud-page__header { align-items: start; flex-direction: column; }.cloud-page__tools { grid-template-columns: 1fr; }.cloud-page__view { display: none; }.cloud-page__stats,.cloud-page__files { grid-template-columns: 1fr; }.cloud-page__stats > :first-child { grid-column: auto; } }
</style>
