import { mount, RouterLinkStub } from '@vue/test-utils'

import AButton from '@/components/AButton.vue'
import ACheckbox from '@/components/ACheckbox.vue'
import AInput from '@/components/AInput.vue'
import ATextarea from '@/components/ATextarea.vue'

describe('controles nativos modulares', () => {
  it('conserva semántica y atributos HTML sin instalar Quasar', async () => {
    const wrapper = mount(AInput, {
      props: {
        modelValue: '2026-08-04',
        label: 'Fecha de publicación',
        type: 'date',
        name: 'published_at',
        required: true,
        min: '2026-08-01',
        max: '2026-08-31',
        step: 1,
        'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value })
      }
    })

    const input = wrapper.get('input')
    expect(input.attributes()).toMatchObject({
      type: 'date',
      name: 'published_at',
      required: '',
      min: '2026-08-01',
      max: '2026-08-31',
      step: '1'
    })
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))

    await input.setValue('2026-08-12')
    expect(wrapper.props('modelValue')).toBe('2026-08-12')
    expect(wrapper.find('[class*="q-"]').exists()).toBe(false)
  })

  it('limpia el campo y conserva el foco en la entrada', async () => {
    const wrapper = mount(AInput, {
      attachTo: document.body,
      props: {
        modelValue: 'Borrador',
        label: 'Título',
        clearable: true,
        'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value })
      }
    })

    await wrapper.get('button[aria-label="Limpiar campo"]').trigger('click')
    expect(wrapper.props('modelValue')).toBeNull()
    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(document.activeElement).toBe(wrapper.get('input').element)
    wrapper.unmount()
  })

  it('expone textarea y checkbox como controles nativos accesibles', async () => {
    const textarea = mount(ATextarea, {
      props: {
        modelValue: '',
        label: 'Resumen',
        hint: 'Máximo 160 caracteres',
        maxlength: 160,
        required: true
      }
    })
    expect(textarea.get('textarea').attributes('maxlength')).toBe('160')
    expect(textarea.get('textarea').attributes('aria-describedby')).toContain('-hint')

    const checkbox = mount(ACheckbox, {
      props: { modelValue: false, label: 'Publicar ahora', required: true }
    })
    await checkbox.get('input').setValue(true)
    expect(checkbox.emitted('update:modelValue')?.at(-1)).toEqual([true])
    expect(checkbox.get('input').attributes('required')).toBe('')
  })

  it('usa button para formularios y conserva el alias de enlace existente', async () => {
    const submit = mount(AButton, {
      props: { label: 'Guardar cambios', nativeType: 'submit' }
    })
    expect(submit.get('button').attributes('type')).toBe('submit')

    const action = mount(AButton, {
      props: { label: 'Ver borrador', to: '/borrador' }
    })
    expect(action.get('a').attributes('href')).toBe('/borrador')

    await action.setProps({ disabled: true })
    expect(action.get('a').attributes('href')).toBeUndefined()
    expect(action.get('a').attributes('aria-disabled')).toBe('true')

    const routerAction = mount(AButton, {
      props: { label: 'Editar borrador', to: '/borrador/editar' },
      global: { components: { RouterLink: RouterLinkStub } }
    })
    expect(routerAction.getComponent(RouterLinkStub).props('to')).toBe('/borrador/editar')
  })
})
