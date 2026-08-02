import { describe, expect, it } from 'vitest'

import packageMetadata from '../package.json'
import { publicComponentNames } from '@/migration/publicComponentNames'
import {
  catalogCategories,
  componentCatalog,
  filterComponentCatalog,
  uiVersion
} from '@/pages/ui/catalog'

describe('catálogo visual de Astian UI', () => {
  it('se mantiene sincronizado con todos los exports públicos', () => {
    expect(componentCatalog.map(({ name }) => name).toSorted()).toEqual(publicComponentNames)
    expect(new Set(componentCatalog.map(({ name }) => name)).size).toBe(componentCatalog.length)
    expect(uiVersion).toBe(packageMetadata.version)
  })

  it('envía cada resultado a una sección real del catálogo', () => {
    const categoryIds = new Set(catalogCategories.map(({ id }) => id))

    for (const entry of componentCatalog) {
      expect(categoryIds.has(entry.category)).toBe(true)
      expect(entry.anchor).toBe(`ui-${entry.category}`)
      expect(entry.summary.length).toBeGreaterThan(20)
    }
  })

  it('documenta los subpaths ligeros del paquete', () => {
    const paths = Object.fromEntries(componentCatalog.map(({ name, importPath }) => [name, importPath]))

    expect(paths.AInput).toBe('@goastian/astian-ui/input')
    expect(paths.ATextarea).toBe('@goastian/astian-ui/textarea')
    expect(paths.ACheckbox).toBe('@goastian/astian-ui/checkbox')
    expect(paths.AButton).toBe('@goastian/astian-ui/button')
    expect(paths.AMarketingNavigation).toBe('@goastian/astian-ui/marketing-navigation')
    expect(paths.ALocaleSwitch).toBe('@goastian/astian-ui/locale-switch')
    expect(paths.AMarketingAction).toBe('@goastian/astian-ui/marketing-action')
  })

  it('busca por nombre, propósito y subpath sin depender de DOM', () => {
    expect(filterComponentCatalog('idiomas').map(({ name }) => name)).toContain('ALocaleSwitch')
    expect(filterComponentCatalog('marketing navigation').map(({ name }) => name)).toContain('AMarketingNavigation')
    expect(filterComponentCatalog('SSR segura').map(({ name }) => name)).toContain('AInput')
  })
})
