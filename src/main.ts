import 'quasar/src/css/index.sass'
import './css/icons.css'
import './css/astian.scss'
import './css/forms.css'
import './css/marketing.css'

import { Dialog, Loading, Notify, Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons-round'
import { createApp } from 'vue'

import App from './App.vue'
import { primeThemeMode } from './composables/useThemeMode'
import router from './router'
import { astianIconMapFn } from './utils/iconSystem'

primeThemeMode()

const app = createApp(App)

app.use(Quasar, {
    plugins: { Dialog, Loading, Notify },
    iconSet,
    config: {
      brand: {
        primary: 'var(--color-ink)',
        secondary: 'var(--color-ink-2)',
        accent: 'var(--color-accent)',
        positive: 'var(--color-success)',
        negative: 'var(--color-error)',
        info: 'var(--color-info)',
        warning: 'var(--color-warning)'
      },
      notify: { position: 'bottom-right', timeout: 4000 }
    }
  })

if (typeof document !== 'undefined') document.documentElement.lang = 'es'

app.config.globalProperties.$q.iconMapFn = astianIconMapFn
app.use(router).mount('#app')
