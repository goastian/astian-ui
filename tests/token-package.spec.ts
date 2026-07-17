import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const tokens = readFileSync(join(process.cwd(), 'src/css/tokens.css'), 'utf8')

describe('entrada ligera de tokens', () => {
  it('expone los contratos semánticos esenciales sin depender de Quasar', () => {
    for (const token of ['--a-bg-canvas', '--a-text-primary', '--a-primary', '--a-negative', '--a-radius-md', '--a-motion-fast']) {
      expect(tokens).toContain(token)
    }
    expect(tokens).not.toContain('.q-')
    expect(tokens).not.toContain('material-icons')
  })

  it('reconoce los selectores de tema usados por Quasar, Tailwind y Midori', () => {
    expect(tokens).toContain('body.body--dark')
    expect(tokens).toContain("[data-theme='dark']")
    expect(tokens).toContain('.dark')
  })
})
