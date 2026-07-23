<script setup lang="ts" generic="T extends AId = AId">
import { computed, useId } from 'vue'

import type { AId, AStepSpec, AStepState } from '../types/core'
import AButton from './AButton.vue'
import AIcon from './AIcon.vue'

const activeStep = defineModel<T>('activeStep', { required: true })

const props = withDefaults(defineProps<{
  steps: readonly AStepSpec<T>[]
  label?: string
  orientation?: 'horizontal' | 'vertical'
  nonLinear?: boolean
  disabled?: boolean
  showActions?: boolean
  showCancel?: boolean
  backLabel?: string
  nextLabel?: string
  cancelLabel?: string
  completeLabel?: string
}>(), {
  label: 'Progreso',
  orientation: 'horizontal',
  nonLinear: false,
  disabled: false,
  showActions: true,
  showCancel: true,
  backLabel: 'Atrás',
  nextLabel: 'Continuar',
  cancelLabel: 'Cancelar',
  completeLabel: 'Completar'
})

const emit = defineEmits<{
  next: [current: AStepSpec<T>, next: AStepSpec<T> | undefined]
  back: [current: AStepSpec<T>, previous: AStepSpec<T> | undefined]
  cancel: [current: AStepSpec<T>]
  complete: [current: AStepSpec<T>]
  'step-request': [step: AStepSpec<T>, index: number]
}>()

const instanceId = useId()
const panelId = `a-stepper-${instanceId}-panel`
const activeIndex = computed(() => props.steps.findIndex((step) => step.id === activeStep.value))
const currentStep = computed(() => props.steps[activeIndex.value])

function stateOf(step: AStepSpec<T>): AStepState {
  if (step.disabled || step.state === 'disabled') return 'disabled'
  if (step.id === activeStep.value) return step.state === 'error' ? 'error' : 'active'
  return step.state ?? 'pending'
}

function iconFor(state: AStepState, index: number) {
  if (state === 'complete') return 'check'
  if (state === 'error') return 'priority_high'
  return String(index + 1)
}

function canRequest(step: AStepSpec<T>, index: number) {
  if (props.disabled || step.disabled || step.state === 'disabled') return false
  if (props.nonLinear) return true
  return index <= activeIndex.value || step.state === 'complete'
}

function requestStep(step: AStepSpec<T>, index: number) {
  if (!canRequest(step, index) || step.id === activeStep.value) return
  emit('step-request', step, index)
}

function goBack() {
  if (!currentStep.value || activeIndex.value <= 0 || props.disabled) return
  emit('back', currentStep.value, props.steps[activeIndex.value - 1])
}

function goNext() {
  if (!currentStep.value || props.disabled) return
  const next = props.steps[activeIndex.value + 1]
  if (next && (next.disabled || next.state === 'disabled')) return
  if (next) emit('next', currentStep.value, next)
  else emit('complete', currentStep.value)
}

function cancel() {
  if (currentStep.value && !props.disabled) emit('cancel', currentStep.value)
}
</script>

<template>
  <section
    class="a-stepper"
    :class="[
      `a-stepper--${orientation}`,
      { 'a-stepper--disabled': disabled }
    ]"
    :aria-label="label"
  >
    <nav :aria-label="label">
      <ol class="a-stepper__list">
        <li
          v-for="(step, index) in steps"
          :key="`${typeof step.id}:${String(step.id)}`"
          class="a-stepper__step"
          :class="`a-stepper__step--${stateOf(step)}`"
        >
          <button
            type="button"
            class="a-stepper__trigger"
            :disabled="!canRequest(step, index)"
            :aria-current="step.id === activeStep ? 'step' : undefined"
            :aria-controls="step.id === activeStep ? panelId : undefined"
            :aria-describedby="step.error ? `${panelId}-step-${index}-error` : undefined"
            @click="requestStep(step, index)"
          >
            <span class="a-stepper__marker" aria-hidden="true">
              <AIcon v-if="stateOf(step) === 'complete' || stateOf(step) === 'error'" :name="iconFor(stateOf(step), index)" />
              <span v-else>{{ index + 1 }}</span>
            </span>
            <span class="a-stepper__copy">
              <strong>{{ step.title }}</strong>
              <span v-if="step.description">{{ step.description }}</span>
              <span
                v-if="step.error"
                :id="`${panelId}-step-${index}-error`"
                class="a-stepper__error"
              >
                {{ step.error }}
              </span>
            </span>
          </button>
        </li>
      </ol>
    </nav>

    <div
      v-if="currentStep"
      :id="panelId"
      class="a-stepper__panel"
      role="region"
      :aria-label="currentStep.title"
    >
      <slot :step="currentStep" :index="activeIndex" :state="stateOf(currentStep)" />
    </div>

    <div v-if="showActions && currentStep" class="a-stepper__actions">
      <slot
        name="actions"
        :step="currentStep"
        :index="activeIndex"
        :back="goBack"
        :next="goNext"
        :cancel="cancel"
      >
        <AButton
          v-if="showCancel"
          :label="cancelLabel"
          type="tertiary"
          :disabled="disabled"
          @click="cancel"
        />
        <span class="a-stepper__actions-spacer" />
        <AButton
          :label="backLabel"
          type="secondary"
          :disabled="disabled || activeIndex <= 0"
          @click="goBack"
        />
        <AButton
          :label="activeIndex === steps.length - 1 ? completeLabel : nextLabel"
          :disabled="disabled || currentStep.disabled || currentStep.state === 'disabled' || Boolean(steps[activeIndex + 1]?.disabled || steps[activeIndex + 1]?.state === 'disabled')"
          @click="goNext"
        />
      </slot>
    </div>

    <p v-if="currentStep" class="a-visually-hidden" aria-live="polite" aria-atomic="true">
      Paso {{ activeIndex + 1 }} de {{ steps.length }}: {{ currentStep?.title }}.
      {{ currentStep?.error }}
    </p>
  </section>
</template>

<style scoped>
.a-stepper {
  display: grid;
  gap: var(--a-space-6);
  color: var(--a-text-primary);
}

.a-stepper__list {
  display: grid;
  gap: var(--a-space-2);
  margin: var(--a-space-0);
  padding: var(--a-space-0);
  list-style: none;
}

.a-stepper--horizontal .a-stepper__list {
  grid-template-columns: repeat(auto-fit, minmax(var(--a-layout-media-min), 1fr));
}

.a-stepper__step {
  position: relative;
  min-width: var(--a-space-0);
}

.a-stepper--horizontal .a-stepper__step:not(:last-child)::after {
  position: absolute;
  z-index: -1;
  inset-block-start: calc(var(--a-target-min) / 2);
  inset-inline: calc(50% + var(--a-target-min) / 2) calc(-50% + var(--a-target-min) / 2);
  height: var(--a-border-width-strong);
  background: var(--a-border);
  content: '';
}

.a-stepper__trigger {
  display: grid;
  grid-template-columns: var(--a-target-min) minmax(0, 1fr);
  gap: var(--a-space-2);
  width: 100%;
  min-height: var(--a-target-min);
  padding: var(--a-space-0);
  border: var(--a-space-0);
  border-radius: var(--a-radius-sm);
  background: transparent;
  color: inherit;
  text-align: start;
}

.a-stepper__trigger:not(:disabled) {
  cursor: pointer;
}

.a-stepper__trigger:disabled {
  cursor: default;
}

.a-stepper__marker {
  display: grid;
  place-items: center;
  width: var(--a-target-min);
  height: var(--a-target-min);
  border: var(--a-border-width-strong) solid var(--a-border-strong);
  border-radius: var(--a-radius-round);
  background: var(--a-bg-raised);
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-sm);
  font-variant-numeric: tabular-nums;
  font-weight: var(--a-font-weight-bold);
}

.a-stepper__copy {
  display: grid;
  align-content: center;
  gap: var(--a-space-1);
  min-width: var(--a-space-0);
  padding-block: var(--a-space-1);
}

.a-stepper__copy strong {
  font-size: var(--a-font-size-sm);
}

.a-stepper__copy span {
  color: var(--a-text-secondary);
  font-size: var(--a-font-size-xs);
  line-height: var(--a-line-height-body);
}

.a-stepper__step--active .a-stepper__marker,
.a-stepper__step--complete .a-stepper__marker {
  border-color: var(--a-primary);
  background: var(--a-primary);
  color: var(--a-text-inverse);
}

.a-stepper__step--error .a-stepper__marker {
  border-color: var(--a-negative);
  background: var(--a-negative);
  color: var(--a-text-inverse);
}

.a-stepper__copy .a-stepper__error {
  color: var(--a-negative);
}

.a-stepper__step--disabled {
  opacity: var(--a-opacity-disabled);
}

.a-stepper__panel {
  min-width: var(--a-space-0);
}

.a-stepper__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--a-space-2);
  align-items: center;
}

.a-stepper__actions-spacer {
  flex: 1 1 var(--a-space-6);
}

.a-stepper--disabled {
  opacity: var(--a-opacity-disabled);
}

@media (max-width: 40rem) {
  .a-stepper--horizontal .a-stepper__list {
    grid-template-columns: 1fr;
  }

  .a-stepper--horizontal .a-stepper__step:not(:last-child)::after {
    inset-block: calc(var(--a-target-min) / 2) calc(-1 * var(--a-space-2));
    inset-inline-start: calc(var(--a-target-min) / 2);
    width: var(--a-border-width-strong);
    height: auto;
  }

  .a-stepper__actions > :deep(.a-button) {
    flex: 1 1 calc(50% - var(--a-space-1));
  }

  .a-stepper__actions-spacer {
    display: none;
  }
}
</style>
