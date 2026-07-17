import 'quasar/src/css/index.sass'
import '@astian/astian-ui/style.css'

import { AstianUI } from '@astian/astian-ui'
import { Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons-round'
import { createApp } from 'vue'

import App from './App.vue'

createApp(App).use(Quasar, { iconSet }).use(AstianUI).mount('#app')
