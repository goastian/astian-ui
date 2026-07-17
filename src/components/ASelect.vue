<script setup lang="ts">
import type { AstianOption } from '@/types/ui'

const model = defineModel<string | number | null>({ default: null })
withDefaults(defineProps<{ options: AstianOption[]; label?: string; placeholder?: string; hint?: string; disabled?: boolean; clearable?: boolean; multiple?: boolean; useInput?: boolean; size?: 'small' | 'medium' | 'large' }>(), { size: 'medium' })
</script>

<template>
  <q-select v-model="model" outlined emit-value map-options option-value="value" option-label="label" :options="options" :label="label" :placeholder="placeholder" :hint="hint" :disable="disabled" :clearable="clearable" :multiple="multiple" :use-input="useInput" :dense="size === 'small'" class="a-select" :class="`a-select--${size}`">
    <template #option="scope">
      <q-item v-bind="scope.itemProps" class="a-select__option">
        <q-item-section v-if="scope.opt.icon" avatar><q-icon :name="scope.opt.icon" /></q-item-section>
        <q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label><q-item-label v-if="scope.opt.description" caption>{{ scope.opt.description }}</q-item-label></q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<style scoped>
.a-select :deep(.q-field__control) { border-radius: var(--a-radius-sm); background: var(--a-bg-raised); color: var(--a-text-primary); }.a-select :deep(.q-field__control::before) { border-color: var(--a-border); }.a-select :deep(.q-field__native),.a-select :deep(.q-field__label),.a-select :deep(.q-field__append) { color: var(--a-text-primary); }.a-select--large :deep(.q-field__control) { min-height: 54px; }
</style>

<style>
.a-select__option { color: var(--a-text-primary); }.a-select__option .q-item__label--caption { color: var(--a-text-secondary); }
</style>
