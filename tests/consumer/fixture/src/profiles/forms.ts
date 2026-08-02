import '@goastian/astian-ui/tokens.css'
import '@goastian/astian-ui/forms.css'

import { AButton } from '@goastian/astian-ui/button'
import { ACheckbox } from '@goastian/astian-ui/checkbox'
import { AInput } from '@goastian/astian-ui/input'
import { ATextarea } from '@goastian/astian-ui/textarea'
import { defineComponent, h, ref } from 'vue'

import { mountProfile } from './mount'

mountProfile(defineComponent({
  name: 'FormsProfile',
  setup() {
    const name = ref('Astian')
    const message = ref('Hola')
    const accepted = ref(false)

    return () => h('form', { onSubmit: (event: Event) => event.preventDefault() }, [
      h(AInput, {
        label: 'Nombre',
        modelValue: name.value,
        'onUpdate:modelValue': (next: string | number | null) => { name.value = String(next ?? '') }
      }),
      h(ATextarea, {
        label: 'Mensaje',
        modelValue: message.value,
        'onUpdate:modelValue': (next: string) => { message.value = next }
      }),
      h(ACheckbox, {
        label: 'Acepto',
        modelValue: accepted.value,
        'onUpdate:modelValue': (next: boolean) => { accepted.value = next }
      }),
      h(AButton, { nativeType: 'submit', label: 'Enviar' }, { default: () => 'Enviar' })
    ])
  }
}))
