export type AstianSize = 'xsmall' | 'small' | 'medium' | 'xmedium' | 'large' | 'xlarge'
export type AstianTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'destructive'
export type AstianAccent = 'green' | 'orange' | 'blue' | 'red' | 'yellow' | 'pink' | 'dark-blue'
export type AstianActionType = 'primary' | 'secondary' | 'tertiary' | 'destructive'
export type AstianVariant = 'filled' | 'unfilled'
export type AstianLayout = 'inline' | 'stacked'

export interface AstianOption {
  label: string
  value: string | number
  description?: string
  icon?: string
  disabled?: boolean
}

export interface AstianTab {
  label: string
  value: string
  icon?: string
  badge?: string | number
}

export interface AstianPerson {
  id: string
  name: string
  imageSrc?: string
  color?: AstianAccent
  active?: boolean
}
