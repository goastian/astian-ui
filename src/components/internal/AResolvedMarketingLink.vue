<script setup lang="ts">
import { computed, toRaw, useAttrs } from 'vue'

import type { AMarketingLinkComponent, AMarketingLinkProps } from '../../types/marketing'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  href: string
  external?: boolean
  target?: '_self' | '_blank'
  rel?: string
  download?: boolean | string
  linkComponent?: AMarketingLinkComponent
  linkProps?: AMarketingLinkProps
}>()

const emit = defineEmits<{ click: [event: MouseEvent] }>()
const attrs = useAttrs()

const useNativeAnchor = computed(() => (
  !props.linkComponent
  || props.external
  || (props.download !== undefined && props.download !== false)
  || props.target === '_blank'
))

const resolvedComponent = computed(() => (
  useNativeAnchor.value || !props.linkComponent
    ? 'a'
    : typeof props.linkComponent === 'string'
      ? props.linkComponent
      : toRaw(props.linkComponent)
))
const resolvedRel = computed(() => {
  const values = new Set((props.rel ?? '').split(/\s+/).filter(Boolean))
  if (props.target === '_blank') {
    values.add('noopener')
    values.add('noreferrer')
  }
  return values.size ? [...values].join(' ') : undefined
})
</script>

<template>
  <component
    :is="resolvedComponent"
    v-bind="{ ...linkProps, ...attrs }"
    :href="href"
    :target="target"
    :rel="resolvedRel"
    :download="download"
    @click="emit('click', $event)"
  >
    <slot />
  </component>
</template>
