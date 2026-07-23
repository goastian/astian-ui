<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
  headingLevel?: 2 | 3 | 4 | 5 | 6
  compact?: boolean
  busy?: boolean
  disabled?: boolean
  announce?: 'off' | 'polite'
}>(), {
  headingLevel: 2,
  compact: false,
  busy: false,
  disabled: false,
  announce: 'off'
})
</script>

<template>
  <section
    class="a-empty-state"
    :class="{
      'a-empty-state--compact': compact,
      'a-empty-state--busy': busy,
      'a-empty-state--disabled': disabled
    }"
    :aria-live="announce"
    :aria-busy="busy || undefined"
    :aria-disabled="disabled || undefined"
  >
    <div v-if="icon || $slots.visual" class="a-empty-state__visual" aria-hidden="true">
      <slot name="visual"><q-icon :name="icon" /></slot>
    </div>
    <div class="a-empty-state__copy">
      <component :is="`h${headingLevel}`" class="a-empty-state__title">
        {{ title }}
      </component>
      <p v-if="description" class="a-empty-state__description">{{ description }}</p>
    </div>
    <div
      v-if="$slots.actions || $slots.primary || $slots.secondary"
      class="a-empty-state__actions"
      :class="{ 'a-empty-state__actions--disabled': busy || disabled }"
      :inert="busy || disabled ? true : undefined"
    >
      <slot name="actions" :disabled="busy || disabled">
        <slot name="primary" :disabled="busy || disabled" />
        <slot name="secondary" :disabled="busy || disabled" />
      </slot>
    </div>
    <slot :busy="busy" :disabled="disabled" />
  </section>
</template>

<style scoped>
.a-empty-state {
  display: grid;
  justify-items: center;
  gap: var(--a-space-4);
  max-width: var(--a-layout-state-max);
  margin-inline: auto;
  padding: var(--a-space-10) var(--a-space-6) var(--a-space-12);
  color: var(--a-text-primary);
  text-align: center;
}

.a-empty-state__visual {
  display: grid;
  place-items: center;
  width: var(--a-space-16);
  height: var(--a-space-16);
  border-radius: var(--a-radius-md);
  background: var(--a-bg-muted);
  color: var(--a-text-secondary);
  font-size: var(--a-icon-lg);
}

.a-empty-state__copy {
  display: grid;
  gap: var(--a-space-2);
  max-width: var(--a-layout-copy-narrow);
}

.a-empty-state__title {
  margin: var(--a-space-0);
  font-size: var(--a-font-size-xl);
  font-weight: var(--a-font-weight-semibold);
  letter-spacing: var(--a-letter-spacing-heading);
  line-height: var(--a-line-height-tight);
  text-wrap: balance;
}

.a-empty-state__description {
  margin: var(--a-space-0);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  line-height: var(--a-line-height-body);
  text-wrap: pretty;
}

.a-empty-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--a-space-2);
}

.a-empty-state__actions--disabled {
  pointer-events: none;
}

.a-empty-state--compact {
  gap: var(--a-space-3);
  padding: var(--a-space-6) var(--a-space-4) var(--a-space-8);
}

.a-empty-state--compact .a-empty-state__visual {
  width: var(--a-space-12);
  height: var(--a-space-12);
  border-radius: var(--a-radius-sm);
}

.a-empty-state--busy,
.a-empty-state--disabled {
  opacity: var(--a-opacity-disabled);
}

@media (max-width: 30rem) {
  .a-empty-state {
    padding-inline: var(--a-space-4);
  }

  .a-empty-state__actions {
    width: 100%;
  }

  .a-empty-state__actions :deep(*) {
    width: 100%;
  }
}
</style>
