<script setup lang="ts">
import { ref } from 'vue'
import { AAvatar, AButton, AChip, AIconButton, ASurface, AToggle } from '@/components'

const weekends = ref(true)
const selectedDay = ref(17)
const days = Array.from({ length: 35 }, (_, index) => ({ day: index < 3 ? 28 + index : index - 2, outside: index < 3 || index > 33, events: [4, 8, 10, 12, 17, 21, 24, 29].includes(index - 2) ? (index % 3) + 1 : 0 }))
const agenda = [
  { time: '09:30', end: '10:15', title: 'Revisión de producto', color: 'green', people: 4, room: 'Sala Junín' },
  { time: '11:00', end: '11:30', title: 'Diseño · AstianGO', color: 'orange', people: 3, room: 'Videollamada' },
  { time: '15:20', end: '16:00', title: 'Plan de migración Cloud', color: 'blue', people: 6, room: 'Sala Cóndor' }
]
</script>

<template>
  <q-page class="a-page calendar-page">
    <header class="calendar-page__header"><div><span class="a-eyebrow">ASTIAN CALENDAR / JULIO 2026</span><h1>Viernes, 17 de julio</h1><p>3 reuniones · 2 h 10 min de tiempo reservado</p></div><AButton label="Nuevo evento" icon="add" /></header>
    <div class="calendar-page__toolbar"><div><AIconButton icon="chevron_left" label="Mes anterior" /><AButton label="Hoy" type="tertiary" /><AIconButton icon="chevron_right" label="Mes siguiente" /></div><div><AToggle v-model="weekends" label="Fines de semana" size="small" /><AChip label="Mes" icon="calendar_view_month" selected /></div></div>
    <div class="calendar-page__layout">
      <section class="calendar-page__month">
        <div v-for="weekday in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']" :key="weekday" class="calendar-page__weekday">{{ weekday }}</div>
        <button v-for="(item, index) in days" :key="index" type="button" class="calendar-page__day" :class="{ outside: item.outside, selected: item.day === selectedDay && !item.outside }" @click="selectedDay = item.day">
          <span>{{ item.day }}</span><div v-if="item.events"><i v-for="event in item.events" :key="event"></i></div>
        </button>
      </section>
      <aside class="calendar-page__agenda"><div class="calendar-page__agenda-head"><div><span class="a-eyebrow">AGENDA</span><h2>Hoy</h2></div><AIconButton icon="tune" label="Filtrar agenda" /></div>
        <article v-for="event in agenda" :key="event.time" class="calendar-page__event" :class="`calendar-page__event--${event.color}`"><div class="calendar-page__time"><strong>{{ event.time }}</strong><span>{{ event.end }}</span></div><div><h3>{{ event.title }}</h3><p><q-icon name="location_on" /> {{ event.room }}</p><div class="calendar-page__event-people"><AAvatar label="Lucía Rivera" size="small" :color="event.color as any" rounded /><span>+{{ event.people - 1 }} participantes</span></div></div></article>
        <ASurface class="calendar-page__focus"><q-icon name="center_focus_strong" /><div><strong>Bloque de concentración</strong><p>16:30–18:00 · sin invitaciones</p></div></ASurface>
      </aside>
    </div>
  </q-page>
</template>

<style scoped>
.calendar-page__header { display: flex; justify-content: space-between; gap: 24px; align-items: end; padding: 54px 0 28px; }.calendar-page__header h1 { margin: 8px 0 6px; font-size: clamp(2.1rem, 4vw, 4rem); letter-spacing: -.055em; }.calendar-page__header p { margin: 0; color: var(--a-text-secondary); }.calendar-page__toolbar { display: flex; justify-content: space-between; align-items: center; padding: 10px 0 18px; border-bottom: 1px solid var(--a-border); }.calendar-page__toolbar > div { display: flex; align-items: center; gap: 8px; }
.calendar-page__layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; padding-top: 24px; }.calendar-page__month { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid var(--a-border); border-left: 1px solid var(--a-border); }.calendar-page__weekday { padding: 10px; border-right: 1px solid var(--a-border); border-bottom: 1px solid var(--a-border); color: var(--a-text-tertiary); font: 700 .64rem var(--a-font-mono); text-transform: uppercase; }.calendar-page__day { position: relative; min-height: 104px; border: 0; border-right: 1px solid var(--a-border); border-bottom: 1px solid var(--a-border); background: var(--a-bg-surface); color: var(--a-text-primary); text-align: left; cursor: pointer; transition: background var(--a-motion-fast); }.calendar-page__day:hover { background: var(--a-bg-muted); }.calendar-page__day > span { position: absolute; top: 9px; right: 10px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; font: .75rem var(--a-font-mono); }.calendar-page__day.selected > span { background: var(--a-primary); color: var(--a-text-inverse); }.calendar-page__day.outside { color: var(--a-text-tertiary); background: color-mix(in srgb, var(--a-bg-muted) 48%, transparent); }.calendar-page__day div { position: absolute; inset: auto 9px 10px; display: flex; gap: 3px; }.calendar-page__day i { display: block; width: 7px; height: 7px; border-radius: 2px; background: var(--a-primary); }.calendar-page__day i:nth-child(2) { background: var(--a-accent); }.calendar-page__day i:nth-child(3) { background: var(--a-info); }
.calendar-page__agenda { display: grid; gap: 10px; align-content: start; }.calendar-page__agenda-head { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; }.calendar-page__agenda-head h2 { margin: 5px 0 0; font-size: 1.6rem; }.calendar-page__event { --event-color: var(--a-primary); display: grid; grid-template-columns: 60px 1fr; gap: 13px; padding: 15px; border-left: 3px solid var(--event-color); border-radius: 3px 12px 12px 3px; background: var(--a-bg-surface); }.calendar-page__event--orange { --event-color: var(--a-accent); }.calendar-page__event--blue { --event-color: var(--a-info); }.calendar-page__time { display: grid; align-content: start; font-variant-numeric: tabular-nums; }.calendar-page__time strong { font-size: .82rem; }.calendar-page__time span { color: var(--a-text-tertiary); font-size: .7rem; }.calendar-page__event h3 { margin: 0 0 5px; font-size: .88rem; }.calendar-page__event p { margin: 0; color: var(--a-text-secondary); font-size: .7rem; }.calendar-page__event-people { display: flex; gap: 7px; align-items: center; margin-top: 10px; color: var(--a-text-tertiary); font-size: .65rem; }.calendar-page__focus { display: flex; gap: 12px; align-items: center; margin-top: 5px; }.calendar-page__focus > .q-icon { color: var(--a-primary); font-size: 24px; }.calendar-page__focus p { margin: 3px 0 0; color: var(--a-text-secondary); font-size: .7rem; }
@media (max-width: 1050px) { .calendar-page__layout { grid-template-columns: 1fr; }.calendar-page__agenda { grid-template-columns: repeat(2, 1fr); }.calendar-page__agenda-head { grid-column: 1 / -1; } }
@media (max-width: 650px) { .calendar-page__header { align-items: start; flex-direction: column; }.calendar-page__toolbar > div:last-child .a-toggle { display: none; }.calendar-page__month { overflow-x: auto; grid-template-columns: repeat(7, minmax(82px, 1fr)); }.calendar-page__agenda { grid-template-columns: 1fr; }.calendar-page__agenda-head { grid-column: auto; } }
</style>
