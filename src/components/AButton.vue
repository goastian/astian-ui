<script setup lang="ts">
import { computed, getCurrentInstance, useAttrs } from 'vue'

import type { AstianActionType } from '../types/ui'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  label?: string
  type?: AstianActionType
  nativeType?: 'button' | 'submit' | 'reset'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  iconRight?: string
  loading?: boolean
  loadingLabel?: string
  disabled?: boolean
  fullWidth?: boolean
  compact?: boolean
  rounded?: boolean
  to?: string
}>(), {
  type: 'primary',
  nativeType: 'button',
  size: 'medium',
  loadingLabel: 'Cargando'
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()
const attrs = useAttrs()
const routerLink = getCurrentInstance()?.appContext.components.RouterLink

const usesRouterLink = computed(() => Boolean(
  props.to && routerLink && !props.disabled && !props.loading
))
const renderedComponent = computed(() => (
  props.to ? usesRouterLink.value ? routerLink : 'a' : 'button'
))

const forwardedAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    event.stopImmediatePropagation()
    return
  }

  emit('click', event)
}
</script>

<template>
  <component
    :is="renderedComponent"
    v-bind="forwardedAttrs"
    class="a-button a-focusable"
    :class="[
      `a-button--${type}`,
      `a-button--${size}`,
      attrs.class,
      {
        'a-button--full': fullWidth,
        'a-button--compact': compact,
        'a-button--rounded': rounded,
        'a-button--loading': loading
      }
    ]"
    :style="attrs.style"
    :type="to ? undefined : nativeType"
    :to="usesRouterLink ? to : undefined"
    :href="to && !usesRouterLink && !disabled && !loading ? to : undefined"
    :disabled="to ? undefined : disabled || loading"
    :aria-disabled="to && (disabled || loading) ? 'true' : undefined"
    :aria-busy="loading || undefined"
    :tabindex="to && (disabled || loading) ? -1 : undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="a-button__loader" aria-hidden="true" />
    <span v-else-if="$slots['icon-start'] || icon" class="a-button__icon" aria-hidden="true">
      <slot name="icon-start"><span class="material-icons-round">{{ icon }}</span></slot>
    </span>
    <span class="a-button__label"><slot>{{ label }}</slot></span>
    <span v-if="($slots['icon-end'] || iconRight) && !loading" class="a-button__icon" aria-hidden="true">
      <slot name="icon-end"><span class="material-icons-round">{{ iconRight }}</span></slot>
    </span>
    <span v-if="loading" class="a-visually-hidden">{{ loadingLabel }}</span>
  </component>
</template>
