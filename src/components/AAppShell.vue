<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  routeKey?: string | number
  mainId?: string
  skipLabel?: string
  navigationLabel?: string
  asideLabel?: string
  focusOnRouteChange?: boolean
}>(), {
  mainId: 'main-content',
  skipLabel: 'Saltar al contenido principal',
  navigationLabel: 'Navegación principal',
  asideLabel: 'Información complementaria',
  focusOnRouteChange: true
})

const main = ref<HTMLElement | null>(null)

watch(() => props.routeKey, async (nextRoute, previousRoute) => {
  if (
    !props.focusOnRouteChange ||
    nextRoute === undefined ||
    previousRoute === undefined ||
    nextRoute === previousRoute
  ) return

  await nextTick()
  main.value?.focus({ preventScroll: true })
})

defineExpose({
  focusMain: () => main.value?.focus({ preventScroll: true })
})
</script>

<template>
  <div class="a-app-shell">
    <a class="a-app-shell__skip-link" :href="`#${mainId}`">{{ skipLabel }}</a>

    <header v-if="$slots.header" class="a-app-shell__header">
      <slot name="header" />
    </header>

    <div
      class="a-app-shell__body"
      :class="{
        'a-app-shell__body--with-navigation': !!$slots.navigation,
        'a-app-shell__body--with-aside': !!$slots.aside
      }"
    >
      <nav v-if="$slots.navigation" class="a-app-shell__navigation" :aria-label="navigationLabel">
        <slot name="navigation" />
      </nav>

      <main
        :id="mainId"
        ref="main"
        class="a-app-shell__main"
        tabindex="-1"
      >
        <slot />
      </main>

      <aside v-if="$slots.aside" class="a-app-shell__aside" :aria-label="asideLabel">
        <slot name="aside" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.a-app-shell {
  min-width: 0;
  min-height: 100dvh;
  background: var(--a-bg-canvas);
  color: var(--a-text-primary);
}

.a-app-shell__skip-link {
  position: fixed;
  z-index: var(--a-z-skip-link);
  top: var(--a-space-3);
  left: var(--a-space-3);
  padding: var(--a-space-3) var(--a-space-4);
  border-radius: var(--a-radius-sm);
  background: var(--a-text-primary);
  color: var(--a-bg-raised);
  font-weight: var(--a-font-weight-semibold);
  text-decoration: none;
  transform: translateY(-200%);
  transition: transform var(--a-motion-fast);
}

.a-app-shell__skip-link:focus {
  box-shadow: var(--a-shadow-focus);
  outline: none;
  transform: translateY(0);
}

.a-app-shell__header {
  position: sticky;
  z-index: var(--a-z-sticky);
  top: var(--a-space-0);
  min-height: var(--a-layout-header);
  border-bottom: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-raised);
}

.a-app-shell__body {
  display: grid;
  min-width: 0;
  min-height: calc(100dvh - var(--a-layout-header));
  grid-template-columns: minmax(0, 1fr);
}

.a-app-shell__body--with-navigation {
  grid-template-columns: var(--a-layout-nav) minmax(0, 1fr);
}

.a-app-shell__body--with-aside {
  grid-template-columns: minmax(0, 1fr) var(--a-layout-aside);
}

.a-app-shell__body--with-navigation.a-app-shell__body--with-aside {
  grid-template-columns: var(--a-layout-nav) minmax(0, 1fr) var(--a-layout-aside);
}

.a-app-shell__navigation,
.a-app-shell__aside,
.a-app-shell__main {
  min-width: 0;
  min-height: 0;
}

.a-app-shell__navigation {
  border-right: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-surface);
}

.a-app-shell__main {
  background: var(--a-bg-canvas);
  outline: none;
}

.a-app-shell__main:focus-visible {
  box-shadow: inset var(--a-shadow-focus);
}

.a-app-shell__aside {
  border-left: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-surface);
}

@media (max-width: 64rem) {
  .a-app-shell__body--with-navigation.a-app-shell__body--with-aside {
    grid-template-columns: var(--a-layout-nav) minmax(0, 1fr);
  }

  .a-app-shell__body--with-navigation.a-app-shell__body--with-aside .a-app-shell__aside {
    grid-column: 2;
    border-top: var(--a-border-width) solid var(--a-border);
    border-left: 0;
  }
}

@media (max-width: 48rem) {
  .a-app-shell__body--with-navigation,
  .a-app-shell__body--with-aside,
  .a-app-shell__body--with-navigation.a-app-shell__body--with-aside {
    grid-template-columns: minmax(0, 1fr);
  }

  .a-app-shell__body--with-navigation.a-app-shell__body--with-aside .a-app-shell__aside {
    grid-column: auto;
  }

  .a-app-shell__navigation,
  .a-app-shell__aside {
    border: 0;
    border-bottom: var(--a-border-width) solid var(--a-border);
  }
}
</style>
