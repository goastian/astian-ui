import { onBeforeUnmount, onMounted } from 'vue'

export function useOnEscape(handler: () => void, enabled = () => true) {
  const listener = (event: KeyboardEvent) => { if (event.key === 'Escape' && enabled()) handler() }
  onMounted(() => document.addEventListener('keyup', listener))
  onBeforeUnmount(() => document.removeEventListener('keyup', listener))
}
