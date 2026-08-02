<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import type {
  ALocaleOption,
  ALocaleSwitchMode,
  AMarketingLinkComponent,
  AMarketingLinkProps
} from '../types/marketing'
import AResolvedMarketingLink from './internal/AResolvedMarketingLink.vue'

const props = withDefaults(defineProps<{
  locales: readonly ALocaleOption[]
  currentLocale: string
  label?: string
  mode?: ALocaleSwitchMode
  linkComponent?: AMarketingLinkComponent
  linkProps?: AMarketingLinkProps
}>(), {
  label: 'Seleccionar idioma',
  mode: 'auto'
})

const emit = defineEmits<{ navigate: [locale: ALocaleOption, event: MouseEvent] }>()
const root = ref<HTMLElement | null>(null)
const disclosure = ref<HTMLDetailsElement | null>(null)
const summary = ref<HTMLElement | null>(null)

const normalizedCurrentLocale = computed(() => props.currentLocale.toLocaleLowerCase())
const currentOption = computed(() => props.locales.find(isCurrent) ?? props.locales[0])
const resolvedMode = computed(() => (
  props.mode === 'auto'
    ? props.locales.length > 3 ? 'menu' : 'inline'
    : props.mode
))

function isCurrent(option: ALocaleOption) {
  return option.locale.toLocaleLowerCase() === normalizedCurrentLocale.value
}

function closeDisclosure(restoreFocus = false) {
  if (!disclosure.value?.open) return
  disclosure.value.open = false
  if (restoreFocus) summary.value?.focus()
}

function handleNavigate(option: ALocaleOption, event: MouseEvent) {
  closeDisclosure(true)
  emit('navigate', option, event)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !disclosure.value?.open) return
  event.preventDefault()
  closeDisclosure(true)
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (root.value?.contains(event.target as Node)) return
  closeDisclosure()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>

<template>
  <nav ref="root" class="a-locale-switch" :aria-label="label" @keydown="handleKeydown">
    <slot name="prefix" />

    <ul v-if="resolvedMode === 'inline'" class="a-locale-switch__list">
      <li v-for="option in locales" :key="`${option.locale}:${option.href}`">
        <AResolvedMarketingLink
          class="a-locale-switch__link"
          :class="{ 'a-locale-switch__link--current': isCurrent(option) }"
          :href="option.href"
          :hreflang="option.locale"
          :lang="option.locale"
          :dir="option.dir"
          :aria-label="option.label"
          :aria-current="isCurrent(option) ? 'page' : undefined"
          :link-component="linkComponent"
          :link-props="linkProps"
          @click="handleNavigate(option, $event)"
        >
          <slot name="option" :locale="option" :current="isCurrent(option)">
            {{ option.shortLabel ?? option.label }}
          </slot>
        </AResolvedMarketingLink>
      </li>
    </ul>

    <details v-else ref="disclosure" class="a-locale-switch__details">
      <summary ref="summary" class="a-locale-switch__summary" :aria-label="label">
        <slot name="trigger" :locale="currentOption">
          {{ currentOption?.shortLabel ?? currentOption?.label ?? currentLocale }}
        </slot>
        <span class="a-locale-switch__chevron" aria-hidden="true" />
      </summary>
      <ul class="a-locale-switch__menu">
        <li v-for="option in locales" :key="`${option.locale}:${option.href}`">
          <AResolvedMarketingLink
            class="a-locale-switch__menu-link"
            :href="option.href"
            :hreflang="option.locale"
            :lang="option.locale"
            :dir="option.dir"
            :aria-current="isCurrent(option) ? 'page' : undefined"
            :link-component="linkComponent"
            :link-props="linkProps"
            @click="handleNavigate(option, $event)"
          >
            <slot name="option" :locale="option" :current="isCurrent(option)">
              <span>{{ option.label }}</span>
              <span class="a-locale-switch__code">{{ option.shortLabel ?? option.locale }}</span>
            </slot>
          </AResolvedMarketingLink>
        </li>
      </ul>
    </details>
  </nav>
</template>
