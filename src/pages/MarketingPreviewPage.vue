<script setup lang="ts">
import ALocaleSwitch from '@/components/ALocaleSwitch.vue'
import AMarketingAction from '@/components/AMarketingAction.vue'
import AMarketingNavigation from '@/components/AMarketingNavigation.vue'
import type { ALocaleOption, AMarketingNavEntry } from '@/types/marketing'

const entries: AMarketingNavEntry[] = [
  { kind: 'link', id: 'inicio', label: 'Inicio', href: '#inicio', current: true },
  {
    kind: 'menu',
    id: 'productos',
    label: 'Productos',
    columns: [
      {
        id: 'privacidad',
        label: 'Privacidad',
        items: [
          { id: 'midori', label: 'Midori', description: 'Navegación privada y ligera', href: '#midori' },
          { id: 'vpn', label: 'MidoriVPN', description: 'Conexiones privadas en cualquier red', href: '#vpn' }
        ]
      },
      {
        id: 'servicios',
        label: 'Servicios',
        items: [
          { id: 'search', label: 'AstianGO', description: 'Búsqueda con control de privacidad', href: '#search' },
          { id: 'cloud', label: 'Astian Cloud', description: 'Archivos protegidos para equipos', href: '#cloud' }
        ]
      }
    ],
    cta: { id: 'ecosistema', label: 'Explorar el ecosistema', href: '#ecosistema' }
  },
  { kind: 'link', id: 'seguridad', label: 'Seguridad', href: '#seguridad' },
  { kind: 'link', id: 'empresa', label: 'Empresa', href: '#empresa' }
]

const locales: ALocaleOption[] = [
  { locale: 'es', label: 'Español', shortLabel: 'ES', href: '?lang=es#inicio' },
  { locale: 'en', label: 'English', shortLabel: 'EN', href: '?lang=en#inicio' },
  { locale: 'fr', label: 'Français', shortLabel: 'FR', href: '?lang=fr#inicio' }
]
</script>

<template>
  <div class="marketing-preview">
    <AMarketingNavigation :entries="entries">
      <template #brand>
        <a class="marketing-preview__brand" href="#inicio" aria-label="Astian, inicio">
          <span aria-hidden="true">a</span><strong>astian</strong>
        </a>
      </template>
      <template #item-icon="{ item }">
        <span class="marketing-preview__item-mark">{{ item.label.slice(0, 1) }}</span>
      </template>
      <template #header-actions>
        <ALocaleSwitch :locales="locales" current-locale="es" />
        <AMarketingAction href="#contacto" variant="secondary">Contactar</AMarketingAction>
      </template>
    </AMarketingNavigation>

    <main id="inicio" class="marketing-preview__main">
      <section class="marketing-preview__intro" aria-labelledby="marketing-preview-title">
        <p>Componentes de marketing</p>
        <h1 id="marketing-preview-title">Navegación clara para cada producto Astian</h1>
        <span>Vista de referencia para teclado, foco, idiomas y adaptación responsive.</span>
        <AMarketingAction href="#ecosistema">Ver productos</AMarketingAction>
      </section>

      <section id="ecosistema" class="marketing-preview__utility" aria-label="Acciones compactas">
        <ALocaleSwitch :locales="locales" current-locale="es" />
        <AMarketingAction href="https://astian.org" target="_blank" variant="secondary">
          Visitar Astian
        </AMarketingAction>
      </section>
    </main>
  </div>
</template>

<style scoped>
.marketing-preview {
  min-height: 100dvh;
  overflow-x: clip;
  background: var(--a-bg-canvas);
  color: var(--a-text-primary);
}

.marketing-preview :deep(.a-marketing-navigation) {
  border-bottom: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-raised);
}

.marketing-preview__brand {
  display: inline-flex;
  gap: var(--a-space-2);
  align-items: center;
  min-height: var(--a-target-min);
  color: var(--a-text-primary);
  text-decoration: none;
}

.marketing-preview__brand > span {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--a-radius-sm);
  background: var(--a-primary);
  color: var(--a-text-inverse);
  font-weight: var(--a-font-weight-bold);
}

.marketing-preview__brand strong {
  letter-spacing: var(--a-letter-spacing-heading);
}

.marketing-preview__item-mark {
  font-weight: var(--a-font-weight-bold);
}

.marketing-preview__main {
  width: min(100%, 72rem);
  margin-inline: auto;
  padding: clamp(var(--a-space-6), 7vw, var(--a-space-16)) var(--a-space-4);
}

.marketing-preview__intro {
  display: grid;
  gap: var(--a-space-5);
  max-width: 48rem;
}

.marketing-preview__intro p,
.marketing-preview__intro h1,
.marketing-preview__intro > span {
  margin: 0;
}

.marketing-preview__intro p {
  color: var(--a-primary);
  font-size: var(--a-font-size-sm);
  font-weight: var(--a-font-weight-bold);
}

.marketing-preview__intro h1 {
  max-width: 16ch;
  font-size: clamp(2.25rem, 6vw, 4.5rem);
  line-height: 1;
  letter-spacing: var(--a-letter-spacing-display);
}

.marketing-preview__intro > span {
  max-width: var(--a-layout-copy-narrow);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-lg);
  line-height: var(--a-line-height-body);
}

.marketing-preview__intro .a-marketing-action {
  width: fit-content;
}

.marketing-preview__utility {
  display: flex;
  flex-wrap: wrap;
  gap: var(--a-space-4);
  align-items: center;
  justify-content: space-between;
  margin-top: clamp(var(--a-space-12), 10vw, var(--a-space-16));
  padding-top: var(--a-space-5);
  border-top: var(--a-border-width) solid var(--a-border);
}

@media (max-width: 30rem) {
  .marketing-preview__brand strong {
    display: none;
  }

  .marketing-preview__utility {
    align-items: stretch;
  }
}
</style>
