import { Dark } from 'quasar'
import { computed, onMounted, ref, watch } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'
const STORAGE_KEY = 'astian-ui-theme'

export function useThemeMode() {
  const preference = ref<ThemePreference>('system')
  const resolved = computed(() => Dark.isActive ? 'dark' : 'light')

  const apply = (mode: ThemePreference) => {
    Dark.set(mode === 'system' ? 'auto' : mode === 'dark')
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
    preference.value = saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system'
    apply(preference.value)
  })

  watch(preference, (mode) => { localStorage.setItem(STORAGE_KEY, mode); apply(mode) })

  return { preference, resolved }
}
