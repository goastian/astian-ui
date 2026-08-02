import '@quasar/extras/material-icons-round/material-icons-round.css'
import 'quasar/src/css/index.sass'
import './css/astian.scss'
import './css/forms.css'
import './css/marketing.css'

import { Dialog, Loading, Notify, Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons-round'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { astianIconMapFn } from './utils/iconSystem'

const app = createApp(App)

app.use(Quasar, {
    plugins: { Dialog, Loading, Notify },
    iconSet,
    config: {
      brand: {
        primary: '#176b52',
        secondary: '#48645b',
        accent: '#d56f3e',
        positive: '#178357',
        negative: '#c7473e',
        info: '#32749b',
        warning: '#b77a23'
      },
      notify: { position: 'bottom-right', timeout: 4000 }
    }
  })

app.config.globalProperties.$q.iconMapFn = astianIconMapFn
app.use(router).mount('#app')
