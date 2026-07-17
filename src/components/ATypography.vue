<script setup lang="ts">
import { computed } from 'vue'

import type { AstianTone } from '@/types/ui'

type TypographySize = 'h1' | 'h2' | 'h3' | 'h4' | 'large' | 'medium' | 'small' | 'caption'
type TypographyWeight = 'regular' | 'medium' | 'bold'

const props = withDefaults(defineProps<{
  as?: string
  size?: TypographySize
  weight?: TypographyWeight
  tone?: AstianTone
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit'
  inline?: boolean
  mono?: boolean
  uppercase?: boolean
  capitalize?: boolean
  underline?: boolean
  wrap?: boolean
  truncate?: boolean
}>(), {
  size: 'medium',
  weight: 'regular',
  tone: 'primary',
  align: 'inherit',
  wrap: true
})

const defaultTags: Partial<Record<TypographySize, string>> = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4' }
const defaultTag = computed(() => defaultTags[props.size] ?? (props.inline ? 'span' : 'p'))
</script>

<template>
  <component
    :is="as || defaultTag"
    class="a-typography"
    :class="[
      `a-typography--${size}`,
      `a-typography--${weight}`,
      `a-typography--${tone}`,
      { 'a-typography--mono': mono, 'a-typography--uppercase': uppercase, 'a-typography--capitalize': capitalize, 'a-typography--underline': underline, 'a-typography--truncate': truncate }
    ]"
    :style="{ textAlign: align, whiteSpace: wrap ? undefined : 'nowrap' }"
  ><slot /></component>
</template>

<style scoped>
.a-typography { margin: 0; line-height: 1.5; text-wrap: pretty; }
.a-typography--h1 { font-size: clamp(2.5rem, 6vw, 5.4rem); line-height: .98; letter-spacing: -.065em; }
.a-typography--h2 { font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1.02; letter-spacing: -.05em; }
.a-typography--h3 { font-size: clamp(1.5rem, 3vw, 2.25rem); line-height: 1.1; letter-spacing: -.035em; }
.a-typography--h4 { font-size: 1.25rem; line-height: 1.25; letter-spacing: -.02em; }
.a-typography--large { font-size: 1.05rem; }
.a-typography--medium { font-size: .92rem; }
.a-typography--small { font-size: .8rem; }
.a-typography--caption { font-size: .7rem; letter-spacing: .015em; }
.a-typography--regular { font-weight: 400; }
.a-typography--medium { font-weight: 500; }
.a-typography--bold { font-weight: 700; }
.a-typography--primary { color: var(--a-text-primary); }
.a-typography--secondary { color: var(--a-text-secondary); }
.a-typography--tertiary { color: var(--a-text-tertiary); }
.a-typography--inverse { color: var(--a-text-inverse); }
.a-typography--link { color: var(--a-primary); }
.a-typography--destructive { color: var(--a-negative); }
.a-typography--mono { font-family: var(--a-font-mono); font-variant-numeric: tabular-nums; }
.a-typography--uppercase { text-transform: uppercase; letter-spacing: .06em; }
.a-typography--capitalize { text-transform: capitalize; }
.a-typography--underline { text-decoration: underline; text-underline-offset: .18em; }
.a-typography--truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap !important; }
</style>
