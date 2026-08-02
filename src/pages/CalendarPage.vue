<script setup lang="ts">
import { ref } from 'vue'

import AAvatar from '@/components/AAvatar.vue'
import AButton from '@/components/AButton.vue'
import AIconButton from '@/components/AIconButton.vue'
import AToggle from '@/components/AToggle.vue'

const weekends = ref(true)
const selectedDay = ref(17)
const days = Array.from({ length: 35 }, (_, index) => ({ day: index < 3 ? 28 + index : index - 2, outside: index < 3 || index > 33, events: [4, 8, 10, 12, 17, 21, 24, 29].includes(index - 2) ? (index % 3) + 1 : 0 }))
const agenda = [
  { time: '09:30', end: '10:15', title: 'Revisión de producto', color: 'green', people: 4, room: 'Sala Junín' },
  { time: '11:00', end: '11:30', title: 'Diseño · AstianGO', color: 'orange', people: 3, room: 'Videollamada' },
  { time: '15:20', end: '16:00', title: 'Plan de migración Cloud', color: 'blue', people: 6, room: 'Sala Cóndor' }
] as const

const dayLabel = (item: typeof days[number]) => [
  `Día ${item.day}`,
  item.outside ? 'fuera del mes' : null,
  item.events ? `${item.events} eventos` : 'sin eventos'
].filter(Boolean).join(', ')
</script>

<template>
  <main class="a-page calendar-page" aria-label="Astian Calendar">
    <header class="calendar-page__header">
      <div>
        <span class="a-eyebrow">ASTIAN CALENDAR / JULIO 2026</span>
        <h1>Viernes, 17 de julio</h1>
        <p>3 reuniones · 2 h 10 min de tiempo reservado</p>
      </div>
      <AButton label="Nuevo evento" icon="add" />
    </header>

    <section class="calendar-page__toolbar" aria-label="Controles del calendario">
      <div class="calendar-page__period-controls" role="group" aria-label="Cambiar periodo">
        <AIconButton icon="chevron_left" label="Mes anterior" />
        <AButton label="Hoy" type="tertiary" />
        <AIconButton icon="chevron_right" label="Mes siguiente" />
      </div>
      <div class="calendar-page__view-controls">
        <AToggle v-model="weekends" label="Fines de semana" size="small" />
        <span class="calendar-page__view" aria-label="Vista mensual">
          <q-icon name="calendar_view_month" aria-hidden="true" />
          Mes
        </span>
      </div>
    </section>

    <div class="calendar-page__workspace">
      <section class="calendar-page__canvas" aria-labelledby="calendar-month-title">
        <header class="calendar-page__canvas-header">
          <h2 id="calendar-month-title">Julio 2026</h2>
          <span>Vista mensual</span>
        </header>

        <div class="calendar-page__month-scroll" tabindex="0" aria-label="Calendario mensual desplazable">
          <div class="calendar-page__month" role="grid" aria-labelledby="calendar-month-title">
            <div
              v-for="weekday in ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']"
              :key="weekday"
              class="calendar-page__weekday"
              role="columnheader"
            >
              {{ weekday }}
            </div>
            <button
              v-for="(item, index) in days"
              :key="index"
              type="button"
              class="calendar-page__day"
              :class="{ outside: item.outside, selected: item.day === selectedDay && !item.outside }"
              role="gridcell"
              :aria-label="dayLabel(item)"
              :aria-selected="item.day === selectedDay && !item.outside"
              @click="selectedDay = item.day"
            >
              <span>{{ item.day }}</span>
              <div v-if="item.events" aria-hidden="true">
                <i v-for="event in item.events" :key="event" />
              </div>
            </button>
          </div>
        </div>
      </section>

      <aside class="calendar-page__agenda" aria-labelledby="calendar-agenda-title">
        <header class="calendar-page__agenda-head">
          <div>
            <span class="a-eyebrow">AGENDA</span>
            <h2 id="calendar-agenda-title">Hoy</h2>
          </div>
          <AIconButton icon="tune" label="Filtrar agenda" />
        </header>

        <div class="calendar-page__agenda-list">
          <article
            v-for="event in agenda"
            :key="event.time"
            class="calendar-page__event"
            :class="`calendar-page__event--${event.color}`"
          >
            <div class="calendar-page__time">
              <strong>{{ event.time }}</strong>
              <span>{{ event.end }}</span>
            </div>
            <div class="calendar-page__event-copy">
              <h3>{{ event.title }}</h3>
              <p><q-icon name="location_on" aria-hidden="true" /> {{ event.room }}</p>
              <div class="calendar-page__event-people">
                <AAvatar label="Lucía Rivera" size="small" :color="event.color" rounded />
                <span>+{{ event.people - 1 }} participantes</span>
              </div>
            </div>
          </article>
        </div>

        <section class="calendar-page__focus" aria-label="Bloque de concentración">
          <q-icon name="center_focus_strong" aria-hidden="true" />
          <div>
            <strong>Bloque de concentración</strong>
            <p>16:30–18:00 · sin invitaciones</p>
          </div>
        </section>
      </aside>
    </div>
  </main>
</template>

<style scoped>
/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
.calendar-page {
  display: grid;
  gap: var(--a-space-4);
}

.calendar-page__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--a-space-6);
  padding-block: var(--a-space-8) var(--a-space-4);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.calendar-page__header h1,
.calendar-page__header p,
.calendar-page__canvas-header h2,
.calendar-page__agenda-head h2,
.calendar-page__event h3,
.calendar-page__event p,
.calendar-page__focus p {
  margin: var(--a-space-0);
}

.calendar-page__header h1 {
  margin-block-start: var(--a-space-2);
  font-size: clamp(var(--text-xl), 4vw, var(--text-2xl));
  font-weight: var(--a-font-weight-semibold);
  line-height: var(--a-line-height-tight);
  letter-spacing: var(--a-letter-spacing-heading);
  text-wrap: balance;
}

.calendar-page__header p {
  margin-block-start: var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
}

.calendar-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-4);
  min-width: 0;
  padding-block: var(--a-space-2);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.calendar-page__period-controls,
.calendar-page__view-controls {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--a-space-2);
}

.calendar-page__view {
  display: inline-flex;
  min-height: var(--a-target-min);
  align-items: center;
  gap: var(--a-space-2);
  padding-inline: var(--a-space-3);
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-selected);
  color: var(--a-text-primary);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
  white-space: nowrap;
}

.calendar-page__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(var(--a-layout-search-min), var(--a-layout-aside));
  gap: var(--a-space-6);
  align-items: start;
  min-width: 0;
}

.calendar-page__canvas {
  min-width: 0;
}

.calendar-page__canvas-header,
.calendar-page__agenda-head {
  display: flex;
  min-height: var(--a-target-min);
  align-items: center;
  justify-content: space-between;
  gap: var(--a-space-3);
}

.calendar-page__canvas-header {
  padding-block-end: var(--a-space-2);
}

.calendar-page__canvas-header h2,
.calendar-page__agenda-head h2 {
  font-size: var(--a-font-size-lg);
  letter-spacing: var(--a-letter-spacing-heading);
}

.calendar-page__canvas-header span {
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.calendar-page__month-scroll {
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}

.calendar-page__month {
  display: grid;
  grid-template-columns: repeat(7, minmax(var(--a-target-min), 1fr));
  min-width: calc(
    var(--a-target-min) + var(--a-target-min) + var(--a-target-min) +
    var(--a-target-min) + var(--a-target-min) + var(--a-target-min) +
    var(--a-target-min)
  );
}

.calendar-page__weekday {
  display: grid;
  min-height: var(--a-target-min);
  place-items: center;
  padding: var(--a-space-2);
  border-inline-end: var(--a-border-width) solid var(--a-border);
  border-block-end: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-muted);
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
  font-weight: var(--a-font-weight-semibold);
  text-transform: uppercase;
}

.calendar-page__weekday:nth-child(7) {
  border-inline-end: 0;
}

.calendar-page__day {
  display: grid;
  min-width: var(--a-target-min);
  min-height: var(--space-3xl);
  grid-template-rows: auto 1fr;
  align-items: start;
  gap: var(--a-space-2);
  padding: var(--a-space-2);
  border: 0;
  border-inline-end: var(--a-border-width) solid var(--a-border);
  border-block-end: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-surface);
  color: var(--a-text-primary);
  text-align: start;
  cursor: pointer;
}

.calendar-page__day:hover {
  background: var(--a-bg-hover);
}

.calendar-page__day:nth-child(7n + 7) {
  border-inline-end: 0;
}

.calendar-page__day:nth-last-child(-n + 7) {
  border-block-end: 0;
}

.calendar-page__day > span {
  display: grid;
  width: var(--a-target-min);
  height: var(--a-target-min);
  place-items: center;
  justify-self: end;
  border-radius: var(--a-radius-round);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.calendar-page__day.selected {
  background: var(--a-bg-selected);
}

.calendar-page__day.selected > span {
  background: var(--a-text-primary);
  color: var(--a-bg-raised);
  font-weight: var(--a-font-weight-semibold);
}

.calendar-page__day.outside {
  background: color-mix(in oklch, var(--a-bg-muted) 58%, var(--a-bg-surface));
  color: var(--a-text-tertiary);
}

.calendar-page__day > div {
  display: flex;
  align-self: end;
  gap: var(--a-space-1);
}

.calendar-page__day i {
  display: block;
  width: var(--a-space-2);
  height: var(--a-space-2);
  border-radius: var(--a-radius-xs);
  background: var(--a-positive);
}

.calendar-page__day i:nth-child(2) {
  background: var(--a-accent);
}

.calendar-page__day i:nth-child(3) {
  background: var(--a-info);
}

.calendar-page__agenda {
  min-width: 0;
  overflow: hidden;
  border: var(--a-border-width) solid var(--a-border);
  border-radius: var(--a-radius-sm);
  background: var(--a-bg-surface);
}

.calendar-page__agenda-head {
  padding: var(--a-space-3) var(--a-space-4);
  border-bottom: var(--a-border-width) solid var(--a-border);
}

.calendar-page__agenda-head h2 {
  margin-block-start: var(--a-space-1);
}

.calendar-page__agenda-list {
  display: grid;
}

.calendar-page__event {
  --event-color: var(--a-positive);
  display: grid;
  grid-template-columns: var(--a-control-lg) minmax(0, 1fr);
  gap: var(--a-space-3);
  min-width: 0;
  padding: var(--a-space-4);
  border-inline-start: var(--a-border-width-strong) solid var(--event-color);
  border-block-end: var(--a-border-width) solid var(--a-border);
}

.calendar-page__event--orange {
  --event-color: var(--a-accent);
}

.calendar-page__event--blue {
  --event-color: var(--a-info);
}

.calendar-page__time {
  display: grid;
  align-content: start;
  gap: var(--a-space-1);
  font-variant-numeric: tabular-nums;
}

.calendar-page__time strong {
  font: var(--a-font-size-sm)/1 var(--a-font-mono);
  font-weight: var(--a-font-weight-semibold);
}

.calendar-page__time span {
  color: var(--a-text-tertiary);
  font: var(--a-font-size-xs)/1 var(--a-font-mono);
}

.calendar-page__event-copy {
  min-width: 0;
}

.calendar-page__event h3 {
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-semibold);
  overflow-wrap: anywhere;
}

.calendar-page__event p {
  display: flex;
  align-items: center;
  gap: var(--a-space-1);
  margin-block-start: var(--a-space-2);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

.calendar-page__event-people {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--a-space-2);
  margin-block-start: var(--a-space-3);
  color: var(--a-text-tertiary);
  font-size: var(--a-font-size-xs);
}

.calendar-page__event-people span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.calendar-page__focus {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--a-space-3);
  padding: var(--a-space-4);
  background: var(--a-bg-muted);
}

.calendar-page__focus > .q-icon {
  flex: none;
  color: var(--a-positive);
  font-size: var(--a-icon-lg);
}

.calendar-page__focus strong {
  font-size: var(--a-font-size-sm);
}

.calendar-page__focus p {
  margin-block-start: var(--a-space-1);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
}

@media (max-width: 64rem) {
  .calendar-page__workspace {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 48rem) {
  .calendar-page {
    gap: var(--a-space-3);
  }

  .calendar-page__header {
    align-items: start;
    flex-direction: column;
    gap: var(--a-space-4);
    padding-block-start: var(--a-space-6);
  }

  .calendar-page__toolbar {
    flex-wrap: wrap;
  }

  .calendar-page__month-scroll {
    scrollbar-width: thin;
  }

  .calendar-page__day {
    min-height: var(--space-2xl);
  }
}

@media (max-width: 34rem) {
  .calendar-page__header :deep(.a-button) {
    width: 100%;
  }

  .calendar-page__toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .calendar-page__period-controls,
  .calendar-page__view-controls {
    justify-content: space-between;
  }

  .calendar-page__event {
    grid-template-columns: var(--a-control-lg) minmax(0, 1fr);
    padding-inline: var(--a-space-3);
  }
}
</style>
