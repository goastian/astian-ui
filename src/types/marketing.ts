import type { Component } from 'vue'

export type AMarketingLinkComponent = string | Component
export type AMarketingLinkProps = Record<string, unknown>
export type AMarketingLinkPropsResolver = (
  link: AMarketingLink
) => AMarketingLinkProps | undefined

export interface AMarketingLink {
  id: string
  href: string
  label: string
  description?: string
  icon?: string
  current?: boolean
  external?: boolean
  target?: '_self' | '_blank'
  rel?: string
  download?: boolean | string
}

export interface AMarketingNavColumn {
  id: string
  label?: string
  items: readonly AMarketingLink[]
}

export interface AMarketingNavDirectLink extends AMarketingLink {
  kind: 'link'
}

export interface AMarketingNavMenu {
  kind: 'menu'
  id: string
  label: string
  columns: readonly AMarketingNavColumn[]
  cta?: AMarketingLink
}

export type AMarketingNavEntry = AMarketingNavDirectLink | AMarketingNavMenu

export type AMarketingNavigationReason =
  | 'toggle'
  | 'hover'
  | 'pointer-leave'
  | 'focus-leave'
  | 'escape'
  | 'outside'
  | 'navigate'
  | 'resize'
  | 'model'

export interface ALocaleOption {
  locale: string
  label: string
  shortLabel?: string
  href: string
  dir?: 'ltr' | 'rtl'
}

export type ALocaleSwitchMode = 'auto' | 'inline' | 'menu'
export type AMarketingActionVariant = 'primary' | 'secondary'
export type AMarketingActionSize = 'medium' | 'large'
