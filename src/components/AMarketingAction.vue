<script setup lang="ts">
import type {
  AMarketingActionSize,
  AMarketingActionVariant,
  AMarketingLinkComponent,
  AMarketingLinkProps
} from '../types/marketing'
import AResolvedMarketingLink from './internal/AResolvedMarketingLink.vue'

withDefaults(defineProps<{
  href: string
  variant?: AMarketingActionVariant
  size?: AMarketingActionSize
  external?: boolean
  target?: '_self' | '_blank'
  rel?: string
  download?: boolean | string
  linkComponent?: AMarketingLinkComponent
  linkProps?: AMarketingLinkProps
}>(), {
  variant: 'primary',
  size: 'medium'
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <AResolvedMarketingLink
    class="a-marketing-action"
    :class="[`a-marketing-action--${variant}`, `a-marketing-action--${size}`]"
    :href="href"
    :external="external"
    :target="target"
    :rel="rel"
    :download="download"
    :link-component="linkComponent"
    :link-props="linkProps"
    @click="$emit('click', $event)"
  >
    <span v-if="$slots['icon-start']" class="a-marketing-action__icon" aria-hidden="true">
      <slot name="icon-start" />
    </span>
    <span class="a-marketing-action__label"><slot /></span>
    <span v-if="$slots['icon-end']" class="a-marketing-action__icon" aria-hidden="true">
      <slot name="icon-end" />
    </span>
  </AResolvedMarketingLink>
</template>
