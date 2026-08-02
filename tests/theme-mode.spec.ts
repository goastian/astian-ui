import { primeThemeMode } from '@/composables/useThemeMode'

const setSystemTheme = (dark: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' && dark,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
}

describe('theme bootstrap', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('body--dark')
    setSystemTheme(false)
  })

  it('applies a stored dark preference before Vue mounts', () => {
    window.localStorage.setItem('astian-ui-theme', 'dark')

    expect(primeThemeMode()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.body.classList.contains('body--dark')).toBe(true)
  })

  it('resolves system preference and rejects unknown stored values', () => {
    setSystemTheme(true)
    expect(primeThemeMode()).toBe('dark')

    window.localStorage.setItem('astian-ui-theme', 'sepia')
    setSystemTheme(false)
    expect(primeThemeMode()).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
