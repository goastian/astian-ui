import '@goastian/astian-ui/tokens.css'

import { defineComponent, h } from 'vue'

import { mountProfile } from './mount'

mountProfile(defineComponent({
  name: 'BaselineProfile',
  setup: () => () => h('main', 'Astian UI consumer baseline')
}))
