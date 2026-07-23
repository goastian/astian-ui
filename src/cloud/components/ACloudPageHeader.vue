<script setup lang="ts">
import AButton from '../../components/AButton.vue'

withDefaults(defineProps<{
  title: string
  context?: string
  description?: string
  primaryActionLabel?: string
  primaryActionIcon?: string
  loading?: boolean
  disabled?: boolean
}>(), {
  primaryActionIcon: 'add',
  loading: false,
  disabled: false
})

defineEmits<{ primary: [] }>()
</script>

<template>
  <header class="a-cloud-page-header">
    <div class="a-cloud-page-header__context">
      <slot name="breadcrumbs" />
      <span v-if="context" class="a-cloud-page-header__eyebrow">{{ context }}</span>
    </div>
    <div class="a-cloud-page-header__title">
      <div>
        <h1>{{ title }}</h1>
        <p v-if="description">{{ description }}</p>
      </div>
      <div class="a-cloud-page-header__actions">
        <slot name="actions" />
        <AButton
          v-if="primaryActionLabel"
          :label="primaryActionLabel"
          :icon="primaryActionIcon"
          :loading="loading"
          :disabled="disabled"
          @click="$emit('primary')"
        />
      </div>
    </div>
    <div v-if="$slots.default" class="a-cloud-page-header__toolbar"><slot /></div>
  </header>
</template>

<style scoped>
.a-cloud-page-header {
  display: grid;
  gap: var(--a-space-4);
  padding-block: var(--a-space-8) var(--a-space-4);
}
.a-cloud-page-header__context {
  display: flex;
  gap: var(--a-space-3);
  align-items: center;
  flex-wrap: wrap;
}
.a-cloud-page-header__eyebrow {
  color: var(--a-primary);
  font-family: var(--a-font-mono);
  font-size: var(--a-font-size-xs);
  font-weight: var(--a-font-weight-bold);
  letter-spacing: var(--a-letter-spacing-eyebrow);
}
.a-cloud-page-header__title {
  display: flex;
  gap: var(--a-space-6);
  align-items: end;
  justify-content: space-between;
}
.a-cloud-page-header h1 {
  margin: var(--a-space-0);
  max-width: var(--a-layout-title);
  font-size: var(--a-font-size-display);
  line-height: 1;
  letter-spacing: var(--a-letter-spacing-display);
  text-wrap: balance;
}
.a-cloud-page-header p {
  max-width: var(--a-layout-copy);
  margin: var(--a-space-3) var(--a-space-0) var(--a-space-0);
  color: var(--a-text-secondary);
  text-wrap: pretty;
}
.a-cloud-page-header__actions {
  display: flex;
  gap: var(--a-space-2);
  align-items: center;
  flex-wrap: wrap;
}
@media (max-width: 40rem) {
  .a-cloud-page-header__title { align-items: stretch; flex-direction: column; }
  .a-cloud-page-header__actions :deep(.a-button) { width: 100%; }
}
</style>
