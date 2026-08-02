import '@goastian/astian-ui/tokens.css'
import '@goastian/astian-ui/forms.css'

import { AInput } from '@goastian/astian-ui/input'
import { defineComponent, h, ref } from 'vue'

import { mountProfile } from './mount'

mountProfile(defineComponent({
  name: 'InputProfile',
  setup() {
    const value = ref('Astian')
    return () => h(AInput, {
      label: 'Nombre',
      modelValue: value.value,
      'onUpdate:modelValue': (next: string | number | null) => { value.value = String(next ?? '') }
    })
  }
}))
