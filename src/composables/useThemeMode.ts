import { Dark } from 'quasar'
import { onBeforeUnmount, onMounted, ref, watch, type WatchStopHandle } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = Exclude<ThemePreference, 'system'>

const STORAGE_KEY = 'astian-ui-theme'
const VALID_PREFERENCES: readonly ThemePreference[] = ['light', 'dark', 'system']

const isThemePreference = (value: string | null): value is ThemePreference => (
  value !== null && VALID_PREFERENCES.includes(value as ThemePreference)
)

const readStoredPreference = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system'

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return isThemePreference(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

const resolvePreference = (
  preference: ThemePreference,
  media?: Pick<MediaQueryList, 'matches'> | null
): ResolvedTheme => (
  preference === 'dark' || (preference === 'system' && Boolean(media?.matches))
    ? 'dark'
    : 'light'
)

const applyDocumentTheme = (theme: ResolvedTheme) => {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.theme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.body?.classList.toggle('body--dark', theme === 'dark')
}

/** Applies the saved theme before Vue mounts, without requiring a DOM at import time. */
export function primeThemeMode(): ResolvedTheme {
  const media = typeof window === 'undefined'
    ? null
    : window.matchMedia('(prefers-color-scheme: dark)')
  const theme = resolvePreference(readStoredPreference(), media)
  applyDocumentTheme(theme)
  return theme
}

export function useThemeMode() {
  const preference = ref<ThemePreference>('system')
  const resolved = ref<ResolvedTheme>('light')

  let colorScheme: MediaQueryList | null = null
  let stopPreferenceWatch: WatchStopHandle | null = null

  const apply = (mode: ThemePreference) => {
    const theme = resolvePreference(mode, colorScheme)
    resolved.value = theme
    applyDocumentTheme(theme)
    Dark.set(theme === 'dark')
  }

  const handleSystemChange = () => {
    if (preference.value === 'system') apply('system')
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    preference.value = isThemePreference(event.newValue) ? event.newValue : 'system'
  }

  onMounted(() => {
    colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    preference.value = readStoredPreference()
    apply(preference.value)

    colorScheme.addEventListener('change', handleSystemChange)
    window.addEventListener('storage', handleStorageChange)
    stopPreferenceWatch = watch(preference, (mode) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, mode)
      } catch {
        // Theme selection still works when storage is unavailable.
      }
      apply(mode)
    })
  })

  onBeforeUnmount(() => {
    colorScheme?.removeEventListener('change', handleSystemChange)
    window.removeEventListener('storage', handleStorageChange)
    stopPreferenceWatch?.()
  })

  return { preference, resolved }
}
