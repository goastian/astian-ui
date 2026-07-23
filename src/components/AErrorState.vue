<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  cause?: string
  icon?: string
  retryLabel?: string
  supportLabel?: string
  supportHref?: string
  headingLevel?: 2 | 3 | 4 | 5 | 6
  compact?: boolean
  retrying?: boolean
  disabled?: boolean
  announce?: 'polite' | 'assertive'
}>(), {
  icon: 'error_outline',
  headingLevel: 2,
  compact: false,
  retrying: false,
  disabled: false,
  announce: 'assertive'
})

defineEmits<{
  retry: []
}>()
</script>

<template>
  <section
    class="a-error-state"
    :class="{
      'a-error-state--compact': compact,
      'a-error-state--retrying': retrying,
      'a-error-state--disabled': disabled
    }"
    role="alert"
    :aria-live="announce"
    :aria-busy="retrying || undefined"
    :aria-disabled="disabled || undefined"
  >
    <div v-if="icon || $slots.visual" class="a-error-state__visual" aria-hidden="true">
      <slot name="visual"><q-icon :name="icon" /></slot>
    </div>
    <div class="a-error-state__copy">
      <component :is="`h${headingLevel}`" class="a-error-state__title">
        {{ title }}
      </component>
      <p v-if="description" class="a-error-state__description">{{ description }}</p>
      <p v-if="cause" class="a-error-state__cause">{{ cause }}</p>
    </div>
    <div
      v-if="retryLabel || supportLabel || $slots.retry || $slots.support"
      class="a-error-state__actions"
    >
      <slot name="retry" :retrying="retrying" :disabled="disabled">
        <button
          v-if="retryLabel"
          class="a-error-state__retry"
          type="button"
          :disabled="retrying || disabled"
          @click="$emit('retry')"
        >
          <span v-if="retrying" class="a-error-state__spinner" aria-hidden="true" />
          {{ retryLabel }}
        </button>
      </slot>
      <slot name="support" :disabled="disabled">
        <a
          v-if="supportLabel && supportHref"
          class="a-error-state__support"
          :class="{ 'a-error-state__support--disabled': disabled }"
          :href="disabled ? undefined : supportHref"
          :aria-disabled="disabled || undefined"
        >
          {{ supportLabel }}
        </a>
      </slot>
    </div>
    <slot :retrying="retrying" :disabled="disabled" />
  </section>
</template>

<style scoped>
.a-error-state {
  display: grid;
  justify-items: center;
  gap: var(--a-space-4);
  max-width: var(--a-layout-state-max);
  margin-inline: auto;
  padding: var(--a-space-10) var(--a-space-6) var(--a-space-12);
  color: var(--a-text-primary);
  text-align: center;
}

.a-error-state__visual {
  display: grid;
  place-items: center;
  width: var(--a-space-16);
  height: var(--a-space-16);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-negative-soft);
  color: var(--a-negative);
  font-size: var(--a-icon-lg);
}

.a-error-state__copy {
  display: grid;
  gap: var(--a-space-2);
  max-width: var(--a-layout-copy);
}

.a-error-state__title {
  margin: var(--a-space-0);
  font-size: var(--a-font-size-xl);
  font-weight: var(--a-font-weight-semibold);
  letter-spacing: var(--a-letter-spacing-heading);
  line-height: var(--a-line-height-tight);
  text-wrap: balance;
}

.a-error-state__description,
.a-error-state__cause {
  margin: var(--a-space-0);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
  text-wrap: pretty;
}

.a-error-state__cause {
  color: var(--a-negative);
}

.a-error-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--a-space-2);
}

.a-error-state__retry,
.a-error-state__support {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--a-space-2);
  min-height: var(--a-target-min);
  border-radius: var(--a-radius-sm);
  padding: var(--a-space-2) var(--a-space-4);
  font: var(--a-font-weight-semibold) var(--a-font-size-sm) / var(--a-line-height-tight) var(--a-font-sans);
  text-decoration: none;
  cursor: pointer;
  transition:
    background var(--a-motion-fast),
    color var(--a-motion-fast),
    transform var(--a-motion-fast);
}

.a-error-state__retry {
  border: var(--a-border-width) solid var(--a-negative);
  background: var(--a-negative);
  color: var(--a-text-inverse);
}

.a-error-state__retry:hover:not(:disabled) {
  background: color-mix(in srgb, var(--a-negative) 86%, var(--a-text-primary));
}

.a-error-state__support {
  border: var(--a-border-width) solid var(--a-border);
  background: var(--a-bg-raised);
  color: var(--a-text-primary);
}

.a-error-state__support:hover {
  background: var(--a-bg-hover);
}

.a-error-state__retry:active:not(:disabled),
.a-error-state__support:active {
  transform: translateY(var(--a-border-width));
}

.a-error-state__retry:focus-visible,
.a-error-state__support:focus-visible {
  outline: var(--a-border-width-strong) solid var(--a-focus-ring);
  outline-offset: var(--a-border-width-strong);
}

.a-error-state__retry:disabled,
.a-error-state__support--disabled {
  cursor: not-allowed;
  opacity: var(--a-opacity-disabled);
  pointer-events: none;
}

.a-error-state__spinner {
  width: var(--a-icon-sm);
  height: var(--a-icon-sm);
  border: var(--a-border-width-strong) solid color-mix(in srgb, var(--a-text-inverse) 34%, transparent);
  border-top-color: var(--a-text-inverse);
  border-radius: var(--a-radius-round);
  animation: a-error-state-spin var(--a-duration-slow) linear infinite;
}

.a-error-state--compact {
  gap: var(--a-space-3);
  padding: var(--a-space-6) var(--a-space-4) var(--a-space-8);
}

.a-error-state--compact .a-error-state__visual {
  width: var(--a-space-12);
  height: var(--a-space-12);
  border-radius: var(--a-radius-sm);
}

.a-error-state--disabled {
  opacity: var(--a-opacity-disabled);
}

@keyframes a-error-state-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .a-error-state__retry,
  .a-error-state__support {
    transition: none;
  }

  .a-error-state__spinner {
    animation: none;
  }
}

@media (max-width: 30rem) {
  .a-error-state {
    padding-inline: var(--a-space-4);
  }

  .a-error-state__actions,
  .a-error-state__retry,
  .a-error-state__support {
    width: 100%;
  }
}
</style>
