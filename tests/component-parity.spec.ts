import { describe, expect, it } from 'vitest'

import * as components from '@/components'
import { componentParity, migratedPublicComponents, originalComponentFamilies } from '@/migration/componentParity'

const expectedOriginalFamilies = [
  'Avatar', 'Banner', 'Button', 'ButtonGroup', 'ButtonGroupItem', 'Chip',
  'CircularProgress', 'CodeInput', 'Dialog', 'Divider', 'Dropdown',
  'DropdownItem', 'DropdownSubmenu', 'Facepile', 'IconText', 'Icons',
  'InputField', 'KeyCodeSequence', 'MonoTag', 'Portal', 'Select', 'Skeleton',
  'Surface', 'Tabs', 'Toast', 'Toggle', 'Tooltip', 'Typography'
].sort()

describe('matriz de paridad React a Vue', () => {
  it('mantiene una decisión explícita para las 28 familias originales', () => {
    expect(originalComponentFamilies.toSorted()).toEqual(expectedOriginalFamilies)
    expect(new Set(originalComponentFamilies).size).toBe(28)
  })

  it('documenta contrato y verificación para cada familia', () => {
    for (const entry of componentParity) {
      expect(entry.targets.length).toBeGreaterThan(0)
      expect(entry.contract.length).toBeGreaterThan(20)
      expect(entry.verification.length).toBeGreaterThan(10)
    }
  })

  it('cubre todos los componentes públicos Vue sin entradas fantasma', () => {
    const publicComponents = Object.keys(components).sort()
    expect(migratedPublicComponents).toEqual(publicComponents)
    for (const target of migratedPublicComponents) expect(components).toHaveProperty(target)
  })
})
