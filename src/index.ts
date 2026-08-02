import type { App } from 'vue'

import * as components from './components'
import { astianIconMapFn } from './utils/iconSystem'

export * from './components'
export * from './composables/useAstianNotify'
export * from './composables/useOnEscape'
export * from './composables/useThemeMode'
export type * from './types/core'
export type * from './types/marketing'
export type * from './types/ui'
export * from './utils/iconSystem'
export * from './migration/componentParity'

export const AstianUI = {
  install(app: App) {
    Object.entries(components).forEach(([name, component]) => app.component(name, component))
    const quasar = app.config.globalProperties.$q
    if (quasar) quasar.iconMapFn = astianIconMapFn
  }
}

export default AstianUI
